'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi, categoriesApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { MOROCCO_CITIES, CATEGORIES } from '@khedma/shared';

type Step = 'phone' | 'otp' | 'password' | 'profile';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();

  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Casablanca');
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined);
  const [bio, setBio] = useState('');
  const [selectedCompetences, setSelectedCompetences] = useState<string[]>([]);
  const [customCompetences, setCustomCompetences] = useState<string[]>([]);
  const [newCompetence, setNewCompetence] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | ''>('');
  const [age, setAge] = useState('');
  const [role, setRole] = useState<'CLIENT' | 'HELPER'>(
    (searchParams.get('role') as 'CLIENT' | 'HELPER') || 'CLIENT'
  );
  const [verificationToken, setVerificationToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.startsWith('212')) return '+' + digits;
    if (digits.startsWith('0')) return '+212' + digits.slice(1);
    return '+212' + digits;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAvatarPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formattedPhone = formatPhone(phone);
      setPhone(formattedPhone);
      await authApi.sendOtp(formattedPhone, 'registration');
      setStep('otp');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'envoi du code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await authApi.verifyOtp(phone, otp, 'registration');
      setVerificationToken(data.token);
      setStep('password');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Code incorrect');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    setError('');
    setStep('profile');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Basic user registration payload (only accepted properties)
      const payload: any = {
        verificationToken,
        phone,
        password,
        firstName,
        lastName,
        city,
        role,
      };

      // Add optional fields if provided
      if (email) payload.email = email;
      // Note: gender and age are collected but not saved during registration
      // They will be available for profile updates later

      const { data } = await authApi.register(payload);
      setAuth(data.user, data.accessToken, data.refreshToken);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-primary">
            Khedma
          </Link>
          <p className="text-gray-600 mt-2">Créez votre compte</p>
        </div>

        {/* Role Selector */}
        {step === 'phone' && (
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setRole('CLIENT')}
              className={`flex-1 py-3 rounded-lg font-medium transition ${
                role === 'CLIENT'
                  ? 'bg-primary text-white'
                  : 'bg-white border border-gray-300 text-gray-700'
              }`}
            >
              Je cherche de l'aide
            </button>
            <button
              type="button"
              onClick={() => setRole('HELPER')}
              className={`flex-1 py-3 rounded-lg font-medium transition ${
                role === 'HELPER'
                  ? 'bg-primary text-white'
                  : 'bg-white border border-gray-300 text-gray-700'
              }`}
            >
              Je propose mes services
            </button>
          </div>
        )}

        <div className="card">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          {/* Step 1: Phone */}
          {step === 'phone' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro de téléphone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="06 12 34 56 78"
                  className="input"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Nous vous enverrons un code de vérification
                </p>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? 'Envoi...' : 'Recevoir le code'}
              </button>
            </form>
          )}

          {/* Step 2: OTP */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code de vérification
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  className="input text-center text-2xl tracking-widest"
                  maxLength={6}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Code envoyé au {phone}
                </p>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? 'Vérification...' : 'Vérifier'}
              </button>
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="w-full text-gray-600 text-sm"
              >
                Changer de numéro
              </button>
            </form>
          )}

          {/* Step 3: Password */}
          {step === 'password' && (
            <form onSubmit={handleSetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input"
                  minLength={8}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input"
                  required
                />
              </div>
              <button type="submit" className="btn-primary w-full py-3">
                Continuer
              </button>
            </form>
          )}

          {/* Step 4: Profile */}
          {step === 'profile' && (
            <form onSubmit={handleRegister} className="space-y-6">
              {/* Avatar Upload */}
              <div className="text-center">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📸 Photo de profil (optionnel)
                </label>
                <div className="relative inline-block">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-20 h-20 mx-auto bg-gradient-to-br from-red-200 to-red-300 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ${
                      avatarPreview ? 'hover:shadow-xl border-4 border-red-400' : 'hover:shadow-lg'
                    }`}
                  >
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl">👤</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md hover:bg-red-700"
                  >
                    📷
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Cliquez pour choisir une photo
                </p>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Mohammed"
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Alaoui"
                    className="input"
                    required
                  />
                </div>
              </div>

              {/* Age and Gender in same row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    🎂 Âge (optionnel)
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="25"
                    className="input"
                    min="18"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    👤 Genre (optionnel)
                  </label>
                  <div className="flex gap-2">
                    <label className="flex items-center space-x-1">
                      <input
                        type="radio"
                        name="gender"
                        value="MALE"
                        checked={gender === 'MALE'}
                        onChange={(e) => setGender(e.target.value as 'MALE')}
                        className="w-4 h-4 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-xs font-medium text-gray-700">👨</span>
                    </label>
                    <label className="flex items-center space-x-1">
                      <input
                        type="radio"
                        name="gender"
                        value="FEMALE"
                        checked={gender === 'FEMALE'}
                        onChange={(e) => setGender(e.target.value as 'FEMALE')}
                        className="w-4 h-4 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-xs font-medium text-gray-700">👩</span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ✉️ Email (optionnel)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="input"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Pour recevoir notifications et mises à jour importantes
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  🏙️ Ville de résidence
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="input"
                  required
                >
                  {MOROCCO_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bio Section - Only for Helpers */}
              {role === 'HELPER' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    📝 Présentation (optionnel)
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Décrivez brièvement votre expérience et vos compétences..."
                    className="input resize-none"
                    rows={3}
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {(bio?.length || 0)}/200 caractères
                  </p>
                </div>
              )}

              {/* Competences Selection - Only for Helpers */}
              {role === 'HELPER' && (
                <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-lg">🛠️</span>
                    <div>
                      <label className="block text-lg font-bold text-gray-800">
                        Vos compétences
                      </label>
                      <p className="text-sm text-gray-600 font-medium">
                        (Optionnel - améliore la visibilité de votre profil)
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                    Sélectionnez jusqu'à 5 compétences principales pour apparaître dans les recherches clients.<br/>
                    <span className="font-medium text-red-600">Astuce: Plus de compétences = plus de chances d'être contacté !</span>
                  </p>

                  {/* Add custom competence */}
                  <div className="mb-4 p-3 bg-white border border-gray-200 rounded-lg">
                    <p className="text-xs font-medium text-gray-700 mb-2">Ajouter une compétence personnalisée:</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCompetence}
                        onChange={(e) => setNewCompetence(e.target.value)}
                        placeholder="Ex: Réparation de vélos, Couture..."
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                        maxLength={50}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newCompetence.trim() && !selectedCompetences.includes(newCompetence.trim()) && selectedCompetences.length < 5) {
                            setSelectedCompetences([...selectedCompetences, newCompetence.trim()]);
                            setNewCompetence('');
                          }
                        }}
                        disabled={!newCompetence.trim() || selectedCompetences.length >= 5}
                        className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        ➕ Ajouter
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Ajoutez vos compétences spécialisées non listées ci-dessous
                    </p>
                  </div>

                  {/* Selected competencies display */}
                  {selectedCompetences.length > 0 && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-xs font-medium text-red-800 mb-2">Sélectionnés:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedCompetences.map((competence) => {
                          const category = CATEGORIES.find(cat => cat.slug === competence);
                          const emoji = competence === 'menage' ? '🧹' :
                                        competence === 'bricolage' ? '🔧' :
                                        competence === 'jardinage' ? '🌱' :
                                        competence === 'informatique' ? '💻' :
                                        competence === 'demenagement' ? '🚛' :
                                        competence === 'electricite' ? '⚡' :
                                        competence === 'plomberie' ? '🔩' :
                                        competence === 'peinture' ? '🎨' : '🛠️';
                          return (
                            <div
                              key={competence}
                              className="flex items-center space-x-1 px-3 py-1 bg-white border border-red-300 text-red-800 text-xs font-medium rounded-full"
                            >
                              <span className="text-xs">{emoji}</span>
                              <span>{category?.nameFr || competence}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedCompetences(selectedCompetences.filter(c => c !== competence));
                                }}
                                className="ml-1 text-red-600 hover:text-red-800"
                              >
                                ×
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Competence selection grid */}
                  <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                    {CATEGORIES.slice(0, 20).map((category) => {
                      const isSelected = selectedCompetences.includes(category.slug);
                      const emoji = category.slug === 'menage' ? '🧹' :
                                   category.slug === 'bricolage' ? '🔧' :
                                   category.slug === 'montage-meubles' ? '🪑' :
                                   category.slug === 'jardinage' ? '🌱' :
                                   category.slug === 'demenagement' ? '🚛' :
                                   category.slug === 'informatique' ? '💻' :
                                   category.slug === 'garde-enfants' ? '👶' :
                                   category.slug === 'cours-particuliers' ? '📚' :
                                   category.slug === 'plomberie' ? '🔩' :
                                   category.slug === 'electricite' ? '⚡' :
                                   category.slug === 'peinture' ? '🎨' :
                                   category.slug === 'climatisation' ? '❄️' :
                                   category.slug === 'nettoyage-auto' ? '🚗' :
                                   category.slug === 'livraison' ? '📦' :
                                   category.slug === 'cuisine' ? '👨‍🍳' : '🛠️';

                      return (
                        <label
                          key={category.slug}
                          className={`relative flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                            isSelected || selectedCompetences.length < 5
                              ? isSelected
                                ? 'border-red-500 bg-red-50 shadow-md'
                                : 'border-gray-300 hover:border-red-400 hover:bg-red-50 hover:shadow-md'
                              : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                if (selectedCompetences.length < 5) {
                                  setSelectedCompetences([...selectedCompetences, category.slug]);
                                }
                              } else {
                                setSelectedCompetences(selectedCompetences.filter(c => c !== category.slug));
                              }
                            }}
                            disabled={!isSelected && selectedCompetences.length >= 5}
                            className="sr-only"
                          />
                          <span className="text-2xl mb-2">{emoji}</span>
                          <span className={`text-xs font-medium text-center leading-tight ${
                            isSelected ? 'text-red-800' : 'text-gray-700'
                          }`}>
                            {category.nameFr}
                          </span>
                          {isSelected && (
                            <div className="absolute top-1 right-1 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          )}
                        </label>
                      );
                    })}
                  </div>

                  <div className="mt-3 flex justify-between items-center">
                    <p className={`text-xs font-medium ${
                      selectedCompetences.length === 5 ? 'text-orange-600' :
                      selectedCompetences.length >= 3 ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {selectedCompetences.length === 5 ? 'Maximum atteint' : `${selectedCompetences.length}/5 sélectionnés`}
                    </p>
                    <button
                      type="button"
                      onClick={() => setSelectedCompetences([])}
                      className="text-xs text-gray-500 hover:text-gray-700 underline"
                      disabled={selectedCompetences.length === 0}
                    >
                      Effacer tout
                    </button>
                  </div>
                </div>
              )}

              {/* Information Message */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-blue-500">💡</span>
                  <span className="text-sm font-medium text-blue-800">Informations importantes</span>
                </div>
                <p className="text-xs text-blue-700">
                  {role === 'CLIENT'
                    ? 'En tant que client, vous pourrez publier des demandes de services et contacter des prestataires qualifiés près de chez vous.'
                    : 'En tant que prestataire, votre profil sera visible par les clients recherchant vos services. Vous pouvez toujours modifier ces informations plus tard dans votre profil.'}
                </p>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? 'Création du compte...' : 'Créer mon compte'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-gray-600">
            Déjà inscrit ?{' '}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Connectez-vous
            </Link>
          </div>
        </div>

        {/* Hidden file input for avatar upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </main>
  );
}
