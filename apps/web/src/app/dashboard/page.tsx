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
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">
            Khedma
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              {user.firstName} {user.lastName}
            </span>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-primary"
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
          <p className="text-gray-600">
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
              <h2 className="text-lg font-semibold mb-4">Services</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {CATEGORIES.slice(0, 10).map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/jobs/new?category=${cat.slug}`}
                    className="card hover:shadow-md transition-shadow text-center"
                  >
                    <div className="text-3xl mb-2">{getCategoryEmoji(cat.slug)}</div>
                    <h4 className="font-medium text-gray-900 text-sm">{cat.nameFr}</h4>
                  </Link>
                ))}
              </div>
            </section>

            {/* Quick Actions */}
            <section>
              <h2 className="text-lg font-semibold mb-4">Actions rapides</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Link href="/jobs/new" className="card hover:shadow-md flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">+</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Nouvelle demande</h3>
                    <p className="text-sm text-gray-600">Publiez une demande de service</p>
                  </div>
                </Link>
                <Link href="/jobs/my" className="card hover:shadow-md flex items-center gap-4">
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📋</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Mes demandes</h3>
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
              <h2 className="text-lg font-semibold mb-4">Actions rapides</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Link href="/jobs" className="card hover:shadow-md flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🔍</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Trouver des jobs</h3>
                    <p className="text-sm text-gray-600">Parcourez les demandes disponibles</p>
                  </div>
                </Link>
                <Link href="/applications" className="card hover:shadow-md flex items-center gap-4">
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📋</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Mes candidatures</h3>
                    <p className="text-sm text-gray-600">Suivez vos candidatures</p>
                  </div>
                </Link>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-4">Jobs récents près de vous</h2>
              <div className="card">
                <p className="text-gray-500 text-center py-8">
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
