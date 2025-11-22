'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';

const MAROCCAN_CITIES = [
  'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger',
  'Agadir', 'Meknès', 'Oujda', 'Kenitra', 'Tetouan'
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, setAuth } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    city: 'Casablanca',
    bio: '',
    yearsExperience: '',
    workRadius: 10,
    isAvailable: true,
    avatarPreview: undefined as string | undefined
  });

  // Initialize form with user data
  useEffect(() => {
    if (user && isAuthenticated) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        email: (user as any).email || '',
        city: user.city,
      }));

      // Load existing helper profile if available
      const profile = (user as any).helperProfile;
      if (profile) {
        setFormData(prev => ({
          ...prev,
          bio: profile.bio || '',
          yearsExperience: profile.yearsExperience?.toString() || '',
          workRadius: profile.workRadius || 10,
          isAvailable: profile.isAvailable || true
        }));
      }
    }
  }, [user, isAuthenticated]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData(prev => ({ ...prev, avatarPreview: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('Le prénom et le nom sont requis');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        city: formData.city,
      };

      const { data: updatedUser } = await api.patch('/users/me', payload);
      setAuth(updatedUser, localStorage.getItem('accessToken')!, localStorage.getItem('refreshToken')!);
      setSuccess('Profil mis à jour avec succès !');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h1 className="text-2xl font-bold text-gray-900 mt-20">Connexion requise</h1>
          <p className="text-gray-600 mt-4">Veuillez vous connecter pour accéder à votre profil.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="text-primary hover:underline text-sm">
            ← Retour au tableau de bord
          </Link>
          <div className="flex justify-between items-center mt-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
              <p className="text-gray-600 mt-1">Gérez vos informations personnelles</p>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-4 py-2 rounded-lg transition ${
                isEditing ? 'bg-gray-300 text-gray-700' : 'bg-primary text-white'
              }`}
            >
              {isEditing ? 'Annuler' : '✏️ Modifier'}
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 text-green-600 p-4 rounded-lg text-sm mb-6">
            {success}
          </div>
        )}

        <div className="card space-y-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div
                onClick={() => isEditing && fileInputRef.current?.click()}
                className={`w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer ${
                  isEditing ? 'hover:bg-gray-300 transition border-4 border-primary/20' : ''
                }`}
              >
                {formData.avatarPreview ? (
                  <img
                    src={formData.avatarPreview}
                    alt="Avatar"
                    className="w-32 h-32 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-5xl">👷‍♂️</span>
                )}
              </div>
              {isEditing && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-primary/80"
                >
                  📷
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            {isEditing && (
              <p className="text-xs text-gray-500 text-center">
                Cliquez pour changer la photo de profil
              </p>
            )}
          </div>

          {/* Personal Information */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Informations personnelles</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="input w-full"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                    {formData.firstName || '(non défini)'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="input w-full"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                    {formData.lastName || '(non défini)'}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <div className="p-3 bg-gray-50 rounded-lg text-gray-500 cursor-not-allowed">
                  {formData.phone || '(non défini)'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="input w-full"
                    placeholder="votre@email.com"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                    {formData.email || '(non défini)'}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ville de travail
              </label>
              {isEditing ? (
                <select
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="input w-full"
                >
                  {MAROCCAN_CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                  {formData.city || 'Casablanca'}
                </div>
              )}
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Informations professionnelles</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Années d'expérience
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={formData.yearsExperience}
                    onChange={(e) => handleInputChange('yearsExperience', e.target.value)}
                    className="input w-full"
                    placeholder="Ex: 5"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                    {formData.yearsExperience || '0'} ans
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rayon d'intervention
                </label>
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={formData.workRadius}
                      onChange={(e) => handleInputChange('workRadius', parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>1 km</span>
                      <span>{formData.workRadius} km</span>
                      <span>50 km</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                    {formData.workRadius} km
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.isAvailable}
                  onChange={(e) => handleInputChange('isAvailable', e.target.checked)}
                  className="w-5 h-5 text-primary"
                  disabled={!isEditing}
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Disponible pour de nouveaux projets</span>
                  <p className="text-xs text-gray-500">
                    {formData.isAvailable ? '✓ Acceptant de nouvelles missions' : '✗ Indisponible pour le moment'}
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Bio Section */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Présentation professionnelle
            </label>
            {isEditing ? (
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Décrivez brièvement votre expérience et vos compétences professionnelles..."
                className="input w-full min-h-[120px] resize-none"
                maxLength={500}
              />
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg text-gray-900 min-h-[120px]">
                {formData.bio || '(présentation non écrite)'}
              </div>
            )}
            <p className="text-xs text-gray-500">
              {formData.bio?.length || 0}/500 caractères
            </p>
          </div>

          {/* Edit Actions */}
          {isEditing && (
            <div className="flex gap-4">
              <button
                onClick={() => setIsEditing(false)}
                className="btn-secondary"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary min-w-[150px]"
              >
                {loading ? 'Enregistrement...' : '💾 Sauvegarder'}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
