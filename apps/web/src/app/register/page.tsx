'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { MOROCCO_CITIES } from '@khedma/shared';

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
  const [city, setCity] = useState('Casablanca');
  const [role, setRole] = useState<'CLIENT' | 'HELPER'>(
    (searchParams.get('role') as 'CLIENT' | 'HELPER') || 'CLIENT'
  );
  const [verificationToken, setVerificationToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.startsWith('212')) return '+' + digits;
    if (digits.startsWith('0')) return '+212' + digits.slice(1);
    return '+212' + digits;
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
      const { data } = await authApi.register({
        verificationToken,
        phone,
        password,
        firstName,
        lastName,
        city,
        role,
      });
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
            <form onSubmit={handleRegister} className="space-y-4">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ville
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
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? 'Création...' : 'Créer mon compte'}
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
      </div>
    </main>
  );
}
