'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { CATEGORIES } from '@khedma/shared';

interface Job {
  id: string;
  title: string;
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  category: { nameFr: string };
  _count?: { applications: number };
  assignedHelper?: { firstName: string; lastName: string };
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'CLIENT') {
      fetchClientData();
    } else if (isAuthenticated && user?.role === 'HELPER') {
      fetchHelperData();
    }
  }, [isAuthenticated, user]);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      const [jobsRes, notifRes] = await Promise.all([
        api.get('/jobs/my').catch(() => ({ data: [] })),
        api.get('/notifications/unread-count').catch(() => ({ data: { count: 0 } })),
      ]);
      setJobs(jobsRes.data || []);
      setUnreadNotifications(notifRes.data?.count || 0);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHelperData = async () => {
    try {
      setLoading(true);
      const [appsRes, notifRes] = await Promise.all([
        api.get('/applications/my').catch(() => ({ data: [] })),
        api.get('/notifications/unread-count').catch(() => ({ data: { count: 0 } })),
      ]);
      // Transform applications to job-like structure for display
      const jobsFromApps = appsRes.data?.map((app: any) => ({
        ...app.job,
        applicationStatus: app.status,
      })) || [];
      setJobs(jobsFromApps);
      setUnreadNotifications(notifRes.data?.count || 0);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      OPEN: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
      ASSIGNED: { label: 'Assigné', color: 'bg-blue-100 text-blue-800' },
      IN_PROGRESS: { label: 'En cours', color: 'bg-purple-100 text-purple-800' },
      COMPLETED: { label: 'Terminé', color: 'bg-green-100 text-green-800' },
      CANCELLED: { label: 'Annulé', color: 'bg-gray-100 text-gray-800' },
      // Application statuses for helpers
      PENDING: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
      ACCEPTED: { label: 'Acceptée', color: 'bg-green-100 text-green-800' },
      DECLINED: { label: 'Refusée', color: 'bg-red-100 text-red-800' },
    };
    return badges[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
  };

  const activeJobs = jobs.filter(j => !['COMPLETED', 'CANCELLED'].includes(j.status));
  const completedJobs = jobs.filter(j => j.status === 'COMPLETED');

  const getCategoryEmoji = (slug: string): string => {
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
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header with red theme */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-red-600">
            Khedma
          </Link>
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <Link href="/notifications" className="relative p-2 text-gray-600 hover:text-red-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </Link>
            {/* Messages */}
            <Link href="/messages" className="p-2 text-gray-600 hover:text-red-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </Link>
            {/* Profile */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-medium text-sm">
                  {user?.firstName[0]}{user?.lastName[0]}
                </span>
              </div>
              <span className="text-gray-700 font-medium hidden sm:block">
                {user?.firstName}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-600 text-sm"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Welcome + CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Bonjour {user?.firstName} !
            </h1>
            <p className="text-red-600">
              {user?.role === 'CLIENT'
                ? 'Gérez vos demandes de services'
                : 'Trouvez des missions près de vous'}
            </p>
          </div>
          {user?.role === 'CLIENT' ? (
            <Link
              href="/jobs/new"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 justify-center transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nouvelle demande
            </Link>
          ) : (
            <Link
              href="/jobs"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 justify-center transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Trouver des jobs
            </Link>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        )}

        {/* CLIENT View */}
        {!loading && user?.role === 'CLIENT' && (
          <>
            {/* Categories Section - Early in the layout */}
            <section className="mb-8">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
                  <span className="mr-3">🛠️</span>
                  Services disponibles
                </h2>
                <p className="text-gray-600">Cliquez sur une catégorie pour publier une demande</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                {CATEGORIES.slice(0, 15).map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/jobs/new?category=${cat.slug}`}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:scale-105 group"
                  >
                    <div className="p-4 text-center">
                      <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-200">
                        {getCategoryEmoji(cat.slug)}
                      </div>
                      <h4 className="font-bold text-gray-900 text-sm group-hover:text-red-600 transition-colors">
                        {cat.nameFr}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* Active Jobs */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-600">
                <span>📋 Mes demandes en cours</span>
                {activeJobs.length > 0 && (
                  <span className="bg-red-100 text-red-800 text-sm px-2 py-0.5 rounded-full">
                    {activeJobs.length}
                  </span>
                )}
              </h2>

              {activeJobs.length === 0 ? (
                <div className="card text-center py-8">
                  <div className="text-4xl mb-3">📋</div>
                  <p className="text-gray-500 mb-4">Aucune demande en cours</p>
                  <Link href="/jobs/new" className="text-red-600 font-medium hover:underline">
                    Créer votre première demande
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeJobs.map((job) => (
                    <Link
                      key={job.id}
                      href={`/jobs/${job.id}`}
                      className="card hover:shadow-md transition-shadow flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{job.title}</h3>
                        <p className="text-sm text-gray-500">{job.category?.nameFr}</p>
                        {job._count?.applications !== undefined && job._count.applications > 0 && (
                          <p className="text-sm text-red-600 mt-1">
                            {job._count.applications} candidature{job._count.applications > 1 ? 's' : ''}
                          </p>
                        )}
                        {job.assignedHelper && (
                          <p className="text-sm text-gray-600 mt-1">
                            Helper: {job.assignedHelper.firstName} {job.assignedHelper.lastName}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(job.status).color}`}>
                          {getStatusBadge(job.status).label}
                        </span>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Completed Jobs */}
            {completedJobs.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-4 text-red-600">📂 Terminées</h2>
                <div className="space-y-3">
                  {completedJobs.slice(0, 3).map((job) => (
                    <Link
                      key={job.id}
                      href={`/jobs/${job.id}`}
                      className="card hover:shadow-md transition-shadow flex items-center justify-between"
                    >
                      <div>
                        <h3 className="font-medium text-gray-900">{job.title}</h3>
                        <p className="text-sm text-gray-500">{job.category?.nameFr}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(job.status).color}`}>
                        {getStatusBadge(job.status).label}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* HELPER View */}
        {!loading && user?.role === 'HELPER' && (
          <>
            {/* My Applications */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-600">
                <span>📋 Mes candidatures</span>
                {jobs.length > 0 && (
                  <span className="bg-red-100 text-red-800 text-sm px-2 py-0.5 rounded-full">
                    {jobs.length}
                  </span>
                )}
              </h2>

              {jobs.length === 0 ? (
                <div className="card text-center py-8">
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="text-gray-500 mb-4">Aucune candidature pour le moment</p>
                  <Link href="/jobs" className="text-red-600 font-medium hover:underline">
                    Parcourir les jobs disponibles
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {jobs.map((job: any) => (
                    <Link
                      key={job.id}
                      href={`/jobs/${job.id}`}
                      className="card hover:shadow-md transition-shadow flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{job.title}</h3>
                        <p className="text-sm text-gray-500">{job.category?.nameFr}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(job.applicationStatus || job.status).color}`}>
                          {getStatusBadge(job.applicationStatus || job.status).label}
                        </span>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Find More Jobs CTA */}
            <section>
              <div className="card bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">🔍 Trouver plus de jobs</h3>
                    <p className="text-sm text-gray-600">Parcourez les nouvelles demandes</p>
                  </div>
                  <Link href="/jobs" className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium transition-colors">
                    Voir les jobs
                  </Link>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
