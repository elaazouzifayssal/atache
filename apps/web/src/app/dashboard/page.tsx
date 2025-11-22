'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { CATEGORIES } from '@khedma/shared';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-red-600 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-white">
            Khedma
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/profile"
              className="text-white hover:text-red-200 transition-colors p-2 hover:bg-red-700 rounded-lg flex items-center gap-2"
              title="Voir mon profil"
            >
              <span className="text-lg">👤</span>
            </Link>
            <span className="text-white">
              {user.firstName} {user.lastName}
            </span>
            <button
              onClick={handleLogout}
              className="text-white hover:text-red-200 px-3 py-1 rounded-lg hover:bg-red-700 transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Bonjour {user.firstName} !
          </h1>
          <p className="text-red-600">
            {user.role === 'CLIENT'
              ? 'Que recherchez-vous aujourd\'hui ?'
              : 'Trouvez des jobs près de vous'}
          </p>
        </div>

        {/* Client View */}
        {user.role === 'CLIENT' && (
          <>
            {/* Categories */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold mb-4 text-red-600">Services</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {CATEGORIES.slice(0, 10).map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/jobs/new?category=${cat.slug}`}
                    className="card hover:shadow-md transition-shadow text-center border-red-200 hover:border-red-300"
                  >
                    <div className="text-3xl mb-2 text-red-500">{getCategoryEmoji(cat.slug)}</div>
                    <h4 className="font-medium text-gray-900 text-sm">{cat.nameFr}</h4>
                  </Link>
                ))}
              </div>
            </section>

            {/* Quick Actions */}
            <section>
              <h2 className="text-lg font-semibold mb-4 text-red-600">Actions rapides</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Link href="/jobs/new" className="card hover:shadow-md flex items-center gap-4 border-red-200 hover:border-red-300">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl text-red-600">+</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-600">Nouvelle demande</h3>
                    <p className="text-sm text-gray-600">Publiez une demande de service</p>
                  </div>
                </Link>
                <Link href="/jobs/my" className="card hover:shadow-md flex items-center gap-4 border-red-200 hover:border-red-300">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl text-red-600">📋</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-600">Mes demandes</h3>
                    <p className="text-sm text-gray-600">Gérez vos demandes en cours</p>
                  </div>
                </Link>
              </div>
            </section>
          </>
        )}

        {/* Helper View */}
        {user.role === 'HELPER' && (
          <>
            <section className="mb-8">
              <h2 className="text-lg font-semibold mb-4 text-red-600">Actions rapides</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Link href="/jobs" className="card hover:shadow-md flex items-center gap-4 border-red-200 hover:border-red-300">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl text-red-600">🔍</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-600">Trouver des jobs</h3>
                    <p className="text-sm text-gray-600">Parcourez les demandes disponibles</p>
                  </div>
                </Link>
                <Link href="/applications" className="card hover:shadow-md flex items-center gap-4 border-red-200 hover:border-red-300">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl text-red-600">📋</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-600">Mes candidatures</h3>
                    <p className="text-sm text-gray-600">Suivez vos candidatures</p>
                  </div>
                </Link>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-4 text-red-600">Jobs récents près de vous</h2>
              <div className="card border-red-200">
                <p className="text-red-600 text-center py-8">
                  Aucun job disponible pour le moment
                </p>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function getCategoryEmoji(slug: string): string {
  const emojis: Record<string, string> = {
    menage: '🧹',
    bricolage: '🔧',
    'montage-meubles': '🪑',
    jardinage: '🌱',
    demenagement: '📦',
    informatique: '💻',
    'garde-enfants': '👶',
    'cours-particuliers': '📚',
    plomberie: '🔧',
    electricite: '⚡',
  };
  return emojis[slug] || '🛠️';
}
