'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { api, categoriesApi, jobsApi } from '@/lib/api';
import LocationPicker from '@/components/LocationPicker';
import DatePicker from '@/components/DatePicker';

type Step = 'category' | 'details' | 'location' | 'schedule' | 'budget';

interface Category {
  id: string;
  slug: string;
  nameFr: string;
  icon: string;
}

interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  neighborhood?: string;
  latitude: number;
  longitude: number;
}

const TIME_PREFERENCES = [
  { value: 'MORNING', label: 'Matin (8h-12h)' },
  { value: 'AFTERNOON', label: 'Après-midi (12h-18h)' },
  { value: 'EVENING', label: 'Soir (18h-21h)' },
  { value: 'FLEXIBLE', label: 'Flexible' },
];

const BUDGET_TYPES = [
  { value: 'FIXED', label: 'Prix fixe' },
  { value: 'HOURLY', label: 'Prix par heure' },
];

export default function NewJobPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const [step, setStep] = useState<Step>('category');
  const [categories, setCategories] = useState<Category[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form data
  const [categoryId, setCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [addressId, setAddressId] = useState('');
  const [useExistingAddress, setUseExistingAddress] = useState(true);
  const [newAddressLabel, setNewAddressLabel] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
    city: string;
    address: string;
  } | null>(null);
  const [preferredDate, setPreferredDate] = useState<Date | undefined>();
  const [timePreference, setTimePreference] = useState('FLEXIBLE');
  const [budgetType, setBudgetType] = useState('FIXED');
  const [budgetAmount, setBudgetAmount] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user?.role !== 'CLIENT') {
      router.push('/dashboard');
      return;
    }
    fetchCategories();
    fetchAddresses();
  }, [isAuthenticated, user, router]);

  const fetchCategories = async () => {
    try {
      const { data } = await categoriesApi.getAll();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchAddresses = async () => {
    try {
      const { data } = await api.get('/users/me/addresses');
      setAddresses(data || []);
      // If user has no addresses, show the map picker by default
      if (!data || data.length === 0) {
        setUseExistingAddress(false);
      }
    } catch (err) {
      setAddresses([]);
      setUseExistingAddress(false);
    }
  };

  const handleCategorySelect = (id: string) => {
    setCategoryId(id);
    setStep('details');
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    setError('');
    setStep('location');
  };

  const handleLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (useExistingAddress) {
      if (!addressId) {
        setError('Veuillez sélectionner une adresse');
        return;
      }
      setStep('schedule');
      return;
    }

    // Create new address from map selection
    if (!selectedLocation) {
      setError('Veuillez sélectionner un emplacement sur la carte');
      return;
    }

    if (!newAddressLabel.trim()) {
      setError('Veuillez donner un nom à cette adresse');
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.post('/users/me/addresses', {
        label: newAddressLabel,
        street: selectedLocation.address || 'Adresse sélectionnée sur carte',
        city: selectedLocation.city,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        isDefault: addresses.length === 0,
      });
      setAddressId(data.id);
      setAddresses([...addresses, data]);
      setStep('schedule');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création de l\'adresse');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!preferredDate) {
      setError('Veuillez sélectionner une date');
      return;
    }
    setError('');
    setStep('budget');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetAmount || parseInt(budgetAmount) <= 0) {
      setError('Veuillez entrer un budget valide');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await jobsApi.create({
        categoryId,
        title,
        description,
        addressId,
        preferredDate: preferredDate!.toISOString(),
        timePreference,
        budgetType,
        budgetAmount: parseInt(budgetAmount),
        photos: [],
      });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création de la demande');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    const steps: Step[] = ['category', 'details', 'location', 'schedule', 'budget'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  const selectedCategory = categories.find(c => c.id === categoryId);

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          {step !== 'category' ? (
            <button onClick={goBack} className="p-2 -ml-2 text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          ) : (
            <Link href="/dashboard" className="p-2 -ml-2 text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Link>
          )}
          <h1 className="text-lg font-semibold">Nouvelle demande</h1>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-200">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{
              width: step === 'category' ? '20%'
                : step === 'details' ? '40%'
                : step === 'location' ? '60%'
                : step === 'schedule' ? '80%'
                : '100%'
            }}
          />
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-lg">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        {/* Step 1: Category Selection */}
        {step === 'category' && (
          <div>
            <h2 className="text-xl font-semibold mb-2">De quel service avez-vous besoin ?</h2>
            <p className="text-gray-600 mb-6">Choisissez une catégorie</p>

            <div className="grid grid-cols-2 gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className={`p-4 rounded-xl border-2 text-left transition ${
                    categoryId === category.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">
                    {category.icon === 'cleaning' && '🧹'}
                    {category.icon === 'tools' && '🔧'}
                    {category.icon === 'furniture' && '🪑'}
                    {category.icon === 'plant' && '🌱'}
                    {category.icon === 'truck' && '🚚'}
                    {category.icon === 'computer' && '💻'}
                    {category.icon === 'baby' && '👶'}
                    {category.icon === 'book' && '📚'}
                    {category.icon === 'wrench' && '🔩'}
                    {category.icon === 'lightning' && '⚡'}
                    {category.icon === 'paint' && '🎨'}
                    {category.icon === 'snowflake' && '❄️'}
                    {category.icon === 'car' && '🚗'}
                    {category.icon === 'delivery' && '📦'}
                    {category.icon === 'chef' && '👨‍🍳'}
                  </div>
                  <span className="font-medium text-gray-900">{category.nameFr}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 'details' && (
          <form onSubmit={handleDetailsSubmit}>
            <h2 className="text-xl font-semibold mb-2">Décrivez votre besoin</h2>
            <p className="text-gray-600 mb-6">
              {selectedCategory?.nameFr}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre de la demande
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Nettoyage appartement 3 pièces"
                  className="input"
                  maxLength={100}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description détaillée
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez précisément ce que vous attendez..."
                  className="input min-h-[120px]"
                  maxLength={1000}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">{description.length}/1000</p>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full mt-6">
              Continuer
            </button>
          </form>
        )}

        {/* Step 3: Location */}
        {step === 'location' && (
          <form onSubmit={handleLocationSubmit}>
            <h2 className="text-xl font-semibold mb-2">Où doit avoir lieu le service ?</h2>
            <p className="text-gray-600 mb-6">Sélectionnez l'emplacement</p>

            {/* Toggle between existing and new address */}
            {addresses.length > 0 && (
              <div className="flex gap-2 mb-6">
                <button
                  type="button"
                  onClick={() => setUseExistingAddress(true)}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition ${
                    useExistingAddress
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Mes adresses
                </button>
                <button
                  type="button"
                  onClick={() => setUseExistingAddress(false)}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition ${
                    !useExistingAddress
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Nouvelle adresse
                </button>
              </div>
            )}

            {/* Existing addresses */}
            {useExistingAddress && addresses.length > 0 && (
              <div className="space-y-3">
                {addresses.map((address) => (
                  <button
                    key={address.id}
                    type="button"
                    onClick={() => setAddressId(address.id)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition ${
                      addressId === address.id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-medium">{address.label}</p>
                    <p className="text-sm text-gray-600">{address.street}</p>
                    <p className="text-sm text-gray-500">{address.city}</p>
                  </button>
                ))}
              </div>
            )}

            {/* New address with map */}
            {!useExistingAddress && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de l'adresse
                  </label>
                  <input
                    type="text"
                    value={newAddressLabel}
                    onChange={(e) => setNewAddressLabel(e.target.value)}
                    placeholder="Ex: Domicile, Bureau, Appartement Maarif..."
                    className="input"
                    required={!useExistingAddress}
                  />
                </div>

                <LocationPicker
                  onLocationSelect={setSelectedLocation}
                  initialCity={user?.city || 'Casablanca'}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-6"
            >
              {loading ? 'Enregistrement...' : 'Continuer'}
            </button>
          </form>
        )}

        {/* Step 4: Schedule */}
        {step === 'schedule' && (
          <form onSubmit={handleScheduleSubmit}>
            <h2 className="text-xl font-semibold mb-2">Quand avez-vous besoin du service ?</h2>
            <p className="text-gray-600 mb-6">Choisissez une date et un créneau</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date souhaitée
                </label>
                <DatePicker
                  selected={preferredDate}
                  onSelect={setPreferredDate}
                  placeholder="Choisir une date"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Créneau horaire
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {TIME_PREFERENCES.map((pref) => (
                    <button
                      key={pref.value}
                      type="button"
                      onClick={() => setTimePreference(pref.value)}
                      className={`p-3 rounded-xl border-2 text-sm transition ${
                        timePreference === pref.value
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {pref.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full mt-6">
              Continuer
            </button>
          </form>
        )}

        {/* Step 5: Budget */}
        {step === 'budget' && (
          <form onSubmit={handleSubmit}>
            <h2 className="text-xl font-semibold mb-2">Quel est votre budget ?</h2>
            <p className="text-gray-600 mb-6">Indiquez le montant que vous êtes prêt à payer</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Type de tarif
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {BUDGET_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setBudgetType(type.value)}
                      className={`p-3 rounded-xl border-2 text-sm transition ${
                        budgetType === type.value
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Montant ({budgetType === 'HOURLY' ? 'par heure' : 'total'})
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                    placeholder="0"
                    className="input pr-16"
                    min="1"
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                    DH
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Les helpers pourront proposer un tarif différent
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-6"
            >
              {loading ? 'Publication...' : 'Publier ma demande'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
