'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { api, categoriesApi } from '@/lib/api';

// Competency icons mapping
const COMPETENCY_ICONS: Record<string, string> = {
  'menage': '🧹',
  'bricolage': '🔧',
  'montage-meubles': '🪑',
  'jardinage': '🌱',
  'demenagement': '🚛',
  'informatique': '💻',
  'garde-enfants': '👶',
  'cours-particuliers': '📚',
  'plomberie': '🔩',
  'electricite': '⚡',
  'peinture': '🎨',
  'climatisation': '❄️',
  'nettoyage-auto': '🚗',
  'livraison': '📦',
  'cuisine': '👨‍🍳'
};

const MAROCCAN_CITIES = [
  'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger',
  'Agadir', 'Meknès', 'Oujda', 'Kenitra', 'Tetouan'
];

export default function ProfilePage() {
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
    selectedCompetences: [] as string[],
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
        selectedCompetences: (user as any).selectedCompetences || [],
        avatarPreview: (user as any).avatarUrl || undefined,
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
        selectedCompetences: formData.selectedCompetences || [],
      };

      // Include avatar URL if changed
      if (formData.avatarPreview) {
        payload.avatarUrl = formData.avatarPreview;
      }

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
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard" className="text-red-600 hover:underline text-sm mb-4 inline-block">
            ← Retour au tableau de bord
          </Link>
          <div className="flex justify-between items-center mb-4">
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
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  isEditing
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg'
                }`}
              >
                {isEditing ? '✕ Annuler' : '✏️ Modifier'}
              </button>
            )}
          </div>
        </div>

        {/* Success/Error Messages */}
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 border border-red-200">
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-6 border border-green-200">
            ✅ {success}
          </div>
        )}

        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <div
                  onClick={() => isEditing && fileInputRef.current?.click()}
                  className={`w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-red-200 to-red-300 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isEditing ? 'cursor-pointer hover:shadow-xl border-4 border-red-400 hover:scale-105' : ''
                  }`}
                >
                  {formData.avatarPreview ? (
                    <img
                      src={formData.avatarPreview}
                      alt="Avatar"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl md:text-5xl">👷‍♂️</span>
                  )}
                </div>
                {isEditing && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-700 shadow-lg transition-colors text-sm"
                  >
                    📷
                  </button>
                )}
              </div>

              {isEditing && (
                <p className="text-sm text-red-600 text-center font-medium">
                  Cliquez sur la photo pour modifier
                </p>
              )}

              <h2 className="text-2xl font-bold text-gray-900">
                {formData.firstName} {formData.lastName}
              </h2>
              <p className="text-gray-600">
                {formData.city}, Maroc
              </p>
            </div>
          </div>

          {/* Main Information Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <div className="flex items-center space-x-3 mb-6">
                <span className="text-2xl">👤</span>
                <h3 className="text-xl font-bold text-gray-900">Informations Personnelles</h3>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium">
                        {formData.firstName || '(non défini)'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium">
                        {formData.lastName || '(non défini)'}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">📱 Téléphone</label>
                  <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-600">
                    {formData.phone || '(non défini)'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">✉️ Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="votre@email.com"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium">
                      {formData.email || '(non défini)'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">🏙️ Ville de travail</label>
                  {isEditing ? (
                    <select
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      {MAROCCAN_CITIES.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium">
                      {formData.city || 'Casablanca'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Competences Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <div className="flex items-center space-x-3 mb-6">
                <span className="text-2xl">🛠️</span>
                <h3 className="text-xl font-bold text-gray-900">Mes Compétences</h3>
              </div>

              <div className="space-y-4">
                {isEditing ? (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-4">
                      💪 Sélectionnez vos compétences :
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                      {categories.map((category) => (
                        <label
                          key={category.id}
                          className="flex items-center space-x-3 p-4 border border-gray-200 rounded-xl hover:border-red-300 hover:bg-red-50 cursor-pointer transition-all duration-200"
                        >
                          <input
                            type="checkbox"
                            checked={formData.selectedCompetences?.includes(category.id) || false}
                            onChange={(e) => {
                              const newCompetences = e.target.checked
                                ? [...(formData.selectedCompetences || []), category.id]
                                : (formData.selectedCompetences || []).filter(id => id !== category.id);
                              handleInputChange('selectedCompetences', newCompetences);
                            }}
                            className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                          />
                          <span className="text-lg">{COMPETENCY_ICONS[category.slug] || '🔧'}</span>
                          <span className="text-sm font-medium text-gray-700">{category.nameFr}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-4">
                      Compétences sélectionnées :
                    </p>
                    <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-xl border border-red-200">
                      {formData.selectedCompetences && formData.selectedCompetences.length > 0 ? (
                        <div className="flex flex-wrap gap-3">
                          {formData.selectedCompetences.map((categoryId) => {
                            const category = categories.find(cat => cat.id === categoryId);
                            const emoji = category ? COMPETENCY_ICONS[category.slug] || '🔧' : '🔧';
                            return category ? (
                              <div
                                key={categoryId}
                                className="flex items-center space-x-2 px-4 py-2 bg-white border border-red-200 text-red-800 text-sm font-medium rounded-full shadow-sm"
                              >
                                <span className="text-base">{emoji}</span>
                                <span>{category.nameFr}</span>
                              </div>
                            ) : null;
                          })}
                        </div>
                      ) : (
                        <div className="text-center text-red-600 font-medium py-4">
                          <div className="text-4xl mb-2">🤔</div>
                          Aucune compétence sélectionnée
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Professional Information - Only for Helpers */}
          {user?.role === 'HELPER' && (
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <div className="flex items-center space-x-3 mb-6">
                <span className="text-2xl">⭐</span>
                <h3 className="text-xl font-bold text-gray-900">Informations Professionnelles</h3>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">⭐ Expérience</label>
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={formData.yearsExperience}
                        onChange={(e) => handleInputChange('yearsExperience', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="5"
                      />
                    ) : (
                      <p className="px-4 py-3 bg-amber-50 rounded-xl text-gray-900 font-medium">
                        {formData.yearsExperience || '0'} ans d'expérience
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">📍 Rayon d'intervention</label>
                    {isEditing ? (
                      <div className="space-y-3 p-4 bg-gray-50 rounded-xl">
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
                      <p className="px-4 py-3 bg-green-50 rounded-xl text-gray-900 font-medium">
                        {formData.workRadius} km de rayon
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.isAvailable}
                      onChange={(e) => handleInputChange('isAvailable', e.target.checked)}
                      className="w-5 h-5 text-green-600 rounded"
                      disabled={!isEditing}
                    />
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{formData.isAvailable ? '🟢' : '🔴'}</span>
                      <span className="text-sm font-medium text-gray-700">
                        Disponible pour de nouveaux projets
                      </span>
                    </div>
                  </label>
                  <p className={`text-xs ml-8 ${formData.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                    {formData.isAvailable ? '✅ Acceptant de nouvelles missions' : '❌ Indisponible pour le moment'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">📝 Présentation professionnelle</label>
                  {isEditing ? (
                    <textarea
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="Décrivez-vous brièvement, mettez en avant vos compétences et votre expérience..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                      rows={4}
                      maxLength={500}
                    />
                  ) : (
                    <p className="px-4 py-3 bg-indigo-50 rounded-xl text-gray-900 min-h-[100px]">
                      {formData.bio || '(présentation non écrite)'}
                    </p>
                  )}
                  {isEditing && (
                    <p className="text-xs text-gray-500 mt-1">
                      {(formData.bio?.length || 0)}/500 caractères
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Skills Section for Helpers */}
          {user?.role === 'HELPER' && canEditProfile && formData.skills.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">💰</span>
                  <h3 className="text-xl font-bold text-gray-900">Compétences & Tarifs</h3>
                </div>
                <div className="text-sm text-gray-500">
                  {formData.skills.length} compétence{formData.skills.length > 1 ? 's' : ''} ajoutée{formData.skills.length > 1 ? 's' : ''}
                </div>
              </div>

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
                            className="px-3 py-1 border border-red-300 rounded text-sm w-20 text-center focus:ring-red-500 focus:border-red-500"
                            placeholder="200"
                          />
                        ) : (
                          <span className="font-bold text-red-600 text-xl">{skill.hourlyRate} MAD/h</span>
                        )}
                        {isEditing && (
                          <button
                            onClick={() => removeSkill(skill.categoryId)}
                            className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded text-sm"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      {isEditing ? (
                        <textarea
                          value={skill.serviceDescription}
                          onChange={(e) => updateSkillDescription(skill.categoryId, e.target.value)}
                          placeholder={`Décrivez vos services pour ${skill.category?.nameFr?.toLowerCase()}...`}
                          className="w-full px-3 py-2 border border-red-300 rounded text-sm focus:ring-red-500 focus:border-red-500 resize-none"
                          rows={3}
                          maxLength={200}
                        />
                      ) : (
                        <p className="text-sm text-gray-700 bg-white/60 p-3 rounded border border-red-100 min-h-[60px]">
                          {skill.serviceDescription || '(aucune description)'}
                        </p>
                      )}
                      {isEditing && (
                        <p className="text-xs text-red-600 mt-1">
                          {(skill.serviceDescription?.length || 0)}/200 caractères
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {isEditing && (
                <>
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <span className="text-xl">➕</span>
                      <h4 className="text-lg font-semibold text-gray-900">Ajouter une compétence</h4>
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
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
                </>
              )}
            </div>
          )}

          {/* Edit Actions */}
          {isEditing && (
            <div className="mt-8 flex justify-center space-x-6">
              <button
                onClick={() => setIsEditing(false)}
                className="px-8 py-4 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors shadow-lg"
              >
                ❌ Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                💾 {loading ? 'Enregistrement...' : 'Sauvegarder'}
              </button>
            </div>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
}
