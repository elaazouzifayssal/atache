import Link from 'next/link';
import { CATEGORIES } from '@khedma/shared';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Khedma</h1>
          <nav className="flex items-center gap-4">
            <Link href="/login" className="text-gray-600 hover:text-primary">
              Connexion
            </Link>
            <Link href="/register" className="btn-primary">
              Inscription
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-primary-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Trouvez de l'aide près de chez vous
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Ménage, bricolage, garde d'enfants... Des helpers de confiance au Maroc
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register?role=CLIENT" className="btn bg-white text-primary hover:bg-gray-100 text-lg px-8 py-3">
              Je cherche de l'aide
            </Link>
            <Link href="/register?role=HELPER" className="btn border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-3">
              Je propose mes services
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold text-center mb-8">Nos services</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {CATEGORIES.slice(0, 10).map((cat) => (
              <Link
                key={cat.slug}
                href={`/jobs?category=${cat.slug}`}
                className="card hover:shadow-md transition-shadow text-center"
              >
                <div className="text-4xl mb-2">
                  {getCategoryEmoji(cat.slug)}
                </div>
                <h4 className="font-medium text-gray-900">{cat.nameFr}</h4>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold text-center mb-12">Comment ça marche</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h4 className="font-semibold text-lg mb-2">Décrivez votre besoin</h4>
              <p className="text-gray-600">Publiez votre demande avec les détails du service souhaité</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h4 className="font-semibold text-lg mb-2">Recevez des offres</h4>
              <p className="text-gray-600">Les helpers qualifiés vous envoient leurs propositions</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h4 className="font-semibold text-lg mb-2">Choisissez et réservez</h4>
              <p className="text-gray-600">Sélectionnez le helper idéal et coordonnez le service</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-300">© 2024 Khedma. Tous droits réservés.</p>
        </div>
      </footer>
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
