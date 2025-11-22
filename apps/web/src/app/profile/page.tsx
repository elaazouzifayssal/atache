'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { api, categoriesApi } from '@/lib/api';

// Icons (using emoji for simplicity - could be replaced with icon library)
const ICONS = {
  user: '👤',
  phone: '📱',
  email: '✉️',
  location: '🏙️',
  experience: '⭐',
  radius: '📍',
  availability: '🟢',
  skills: '🛠️',
  bio: '📝',
  edit: '✏️',
  save: '💾',
  cancel: '❌',
  add: '➕',
  remove: '🗑️',
  back: '⬅️',
  verified: '✅',
  money: '💰'
};

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
    avatarPreview: undefined as string | undefined,
    skills: [] as { categoryId: string; category?: any; hourlyRate: number; serviceDescription?: string }[]
  });

  const [categories, setCategories] = useState<any[]>([]);

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data: cats } = await categoriesApi.getAll();
        setCategories(cats);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    loadCategories();
  }, []);

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
          isAvailable: profile.isAvailable || true,
          skills: profile.skills?.map((skill: any) => ({
            categoryId: skill.category.id,
            hourlyRate: skill.hourlyRate,
            serviceDescription: skill.serviceDescription || '',
            category: skill.category
          })) || []
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

  const addSkill = (categoryId: string, category: any) => {
    if (!formData.skills.some(skill => skill.categoryId === categoryId)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, { categoryId, category, hourlyRate: 200 }]
      }));
    }
  };

  const removeSkill = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill.categoryId !== categoryId)
    }));
  };

  const updateSkillRate = (categoryId: string, hourlyRate: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.map(skill =>
        skill.categoryId === categoryId ? { ...skill, hourlyRate } : skill
      )
    }));
  };

  const updateSkillDescription = (categoryId: string, serviceDescription: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.map(skill =>
        skill.categoryId === categoryId ? { ...skill, serviceDescription } : skill
      )
    }));
  };

  const handleSubmit = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('Le prénom et le nom sont requis');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        city: formData.city,
        email: formData.email,
      };

      // For helpers, include helper profile data and skills
      if (user?.role === 'HELPER') {
        payload.helperProfile = {
          bio: formData.bio,
          yearsExperience: formData.yearsExperience ? parseInt(formData.yearsExperience.toString()) : null,
          workRadius: formData.workRadius,
          isAvailable: formData.isAvailable,
          skills: formData.skills.map(skill => ({
            categoryId: skill.categoryId,
            hourlyRate: skill.hourlyRate,
            serviceDescription: skill.serviceDescription || ''
          }))
        };
      }

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

  const canEditProfile = isAuthenticated && user;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-red-600 hover:underline text-sm mb-4 block">
            ← Retour à l'accueil
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {canEditProfile ? 'Mon Profil' : 'Profil'}
              </h1>
              <p className="text-red-600 mt-1">
                {canEditProfile ? 'Gérez vos informations personnelles' : 'Consultez les informations de profil'}
              </p>
            </div>
            {canEditProfile && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-4 py-2 rounded-lg transition font-medium ${
                  isEditing ? 'bg-gray-300 text-gray-700' : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {isEditing ? 'Annuler' : '✏️ Modifier'}
              </button>
            )}
          </div>

          {!canEditProfile && (
            <div className="bg-red-50 text-red-900 p-4 rounded-lg text-sm mt-4 border border-red-200">
              <p>🔑 Connectez-vous pour accéder et modifier votre profil personnel.</p>
              <Link href="/login" className="text-red-600 font-medium hover:underline">
                Se connecter →
              </Link>
            </div>
          )}
        </div>

        {/* Success/Error Messages */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm mb-6 border border-red-200">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 text-green-600 p-4 rounded-lg text-sm mb-6 border border-green-200">
            {success}
          </div>
        )}

        <div className="space-y-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div
                onClick={() => isEditing && fileInputRef.current?.click()}
                className={`w-32 h-32 bg-red-100 rounded-full flex items-center justify-center cursor-pointer ${
                  isEditing ? 'hover:bg-red-200 transition border-4 border-red-300' : ''
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
                  className="absolute -bottom-2 -right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-700"
                >
                  📷
                </button>
              )}
            </div>

            {isEditing && (
              <p className="text-xs text-red-600 text-center">
                Cliquez pour changer la photo de profil
              </p>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Personal Information Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <span className="text-2xl">{ICONS.user}</span>
              <h2 className="text-xl font-bold text-gray-900">Informations Personnelles</h2>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center">
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
                    <div className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl text-gray-900 font-medium">
                      {formData.firstName || '(non défini)'}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center">
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
                    <div className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl text-gray-900 font-medium">
                      {formData.lastName || '(non défini)'}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <span className="mr-2">{ICONS.phone}</span>
                  Téléphone
                </label>
                <div className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl text-gray-600">
                  {formData.phone || '(non défini)'}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <span className="mr-2">{ICONS.email}</span>
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
                  <div className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl text-gray-900 font-medium">
                    {formData.email || '(non défini)'}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <span className="mr-2">{ICONS.location}</span>
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
                  <div className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl text-gray-900 font-medium">
                    {formData.city || 'Casablanca'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Professional Information Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <span className="text-2xl">{ICONS.skills}</span>
              <h2 className="text-xl font-bold text-gray-900">Informations Professionnelles</h2>
            </div>

            {(user?.role === 'HELPER') && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <span className="mr-2">{ICONS.experience}</span>
                      Expérience
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={formData.yearsExperience}
                        onChange={(e) => handleInputChange('yearsExperience', e.target.value)}
                        className="input w-full"
                        placeholder="5"
                      />
                    ) : (
                      <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-100 rounded-xl text-gray-900 font-medium">
                        {formData.yearsExperience || '0'} ans d'expérience
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <span className="mr-2">{ICONS.radius}</span>
                      Rayon d'intervention
                    </label>
                    {isEditing ? (
                      <div className="space-y-2 p-3 bg-gray-50 rounded-xl">
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
                          <span className="font-medium">{formData.workRadius} km</span>
                          <span>50 km</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-100 rounded-xl text-gray-900 font-medium">
                        {formData.workRadius} km de rayon
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.isAvailable}
                      onChange={(e) => handleInputChange('isAvailable', e.target.checked)}
                      className="w-5 h-5 text-green-600 rounded"
                      disabled={!isEditing}
                    />
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{formData.isAvailable ? ICONS.availability : '🚫'}</span>
                      <span className="text-sm font-medium text-gray-700">
                        Disponible pour de nouveaux projets
                      </span>
                    </div>
                  </label>
                  <p className={`text-xs ml-8 ${
                    formData.isAvailable ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formData.isAvailable ? '✓ Acceptant de nouvelles missions' : '✗ Indisponible pour le moment'}
                  </p>
                </div>
              </div>
            )}

            {/* Bio Section */}
            {(user?.role === 'HELPER' || canEditProfile) && (
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <span className="mr-2">{ICONS.bio}</span>
                  Présentation professionnelle
                </label>
                {isEditing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Présentez-vous brièvement, mettez en avant vos compétences et votre expérience..."
                    className="input w-full min-h-[100px] resize-none"
                    maxLength={500}
                  />
                ) : (
                  <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-100 rounded-xl text-gray-900 min-h-[100px]">
                    {formData.bio || '(présentation non écrite)'}
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  {(formData.bio?.length || 0)}/500 caractères
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Skills Section for Helpers */}
        {((canEditProfile && user?.role === 'HELPER') || (isAuthenticated && user?.role === 'HELPER' && formData.skills.length > 0)) && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 mt-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{ICONS.skills}</span>
                <h2 className="text-xl font-bold text-gray-900">Compétences & Tarifs</h2>
              </div>
              {formData.skills.length > 0 && (
                <div className="text-sm text-gray-500">
                  {formData.skills.length} compétence{formData.skills.length > 1 ? 's' : ''} ajoutée{formData.skills.length > 1 ? 's' : ''}
                </div>
              )}
            </div>

            {formData.skills.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {formData.skills.map((skill) => (
                  <div key={skill.categoryId} className="bg-gradient-to-br from-red-50 to-pink-100 p-6 rounded-xl border border-red-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-gray-900">{skill.category?.nameFr || 'Catégorie'}</h4>
                      <div className="flex items-center space-x-2">
                        {isEditing ? (
                          <input
                            type="number"
                            min="50"
                            max="2000"
                            value={skill.hourlyRate}
                            onChange={(e) => updateSkillRate(skill.categoryId, parseInt(e.target.value))}
                            className="input text-sm w-20 text-center border-red-300 focus:border-red-500"
                            placeholder="200"
                          />
                        ) : (
                          <span className="font-bold text-red-600 text-xl">{skill.hourlyRate} MAD/h</span>
                        )}
                        {isEditing && (
                          <button
                            onClick={() => removeSkill(skill.categoryId)}
                            className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors"
                          >
                            {ICONS.remove}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {isEditing ? (
                        <textarea
                          value={skill.serviceDescription}
                          onChange={(e) => updateSkillDescription(skill.categoryId, e.target.value)}
                          placeholder={`Décrivez vos services pour ${skill.category?.nameFr?.toLowerCase()}...`}
                          className="input w-full resize-none border-red-300 focus:border-red-500"
                          rows={4}
                          maxLength={200}
                        />
                      ) : (
                        <div className="text-sm text-gray-700 bg-white/60 p-3 rounded-lg min-h-[80px] border border-red-100">
                          {skill.serviceDescription || (
                            <span className="text-gray-500 italic">Aucune description fournie</span>
                          )}
                        </div>
                      )}
                      {isEditing && (
                        <p className="text-xs text-red-600">
                          {(skill.serviceDescription?.length || 0)}/200 caractères
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              !isEditing && <div className="text-center py-12 text-red-500">Aucune compétence définie</div>
            )}

            {/* Add Skill Section */}
            {isEditing && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-xl">{ICONS.add}</span>
                  <h3 className="text-lg font-semibold text-gray-900">Ajouter une compétence</h3>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <select
                    onChange={(e) => {
                      const category = categories.find(cat => cat.id === e.target.value);
                      if (category) {
                        addSkill(category.id, category);
                      }
                      e.target.value = '';
                    }}
                    className="input w-full mb-4"
                    value=""
                  >
                    <option value="">Sélectionnez une catégorie de service...</option>
                    {categories
                      .filter(cat => !formData.skills.some(skill => skill.categoryId === cat.id))
                      .map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.nameFr}
                        </option>
                      ))}
                  </select>

                  <p className="text-sm text-gray-600">
                    💡 Choisissez une catégorie puis ajoutez une description détaillée de vos services
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Edit Actions */}
        {isEditing && (
          <div className="mt-8 flex justify-center space-x-4">
            <button
              onClick={() => setIsEditing(false)}
              className="px-8 py-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors shadow-lg"
            >
              <span className="mr-2">{ICONS.cancel}</span>
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span className="mr-2">{ICONS.save}</span>
              {loading ? 'Enregistrement...' : 'Sauvegarder'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
