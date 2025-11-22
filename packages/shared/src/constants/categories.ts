export const CATEGORIES = [
  { slug: 'menage', nameFr: 'Ménage', nameAr: 'نظافة', icon: 'cleaning' },
  { slug: 'bricolage', nameFr: 'Bricolage', nameAr: 'إصلاحات', icon: 'tools' },
  { slug: 'montage-meubles', nameFr: 'Montage meubles', nameAr: 'تركيب الأثاث', icon: 'furniture' },
  { slug: 'jardinage', nameFr: 'Jardinage', nameAr: 'البستنة', icon: 'plant' },
  { slug: 'demenagement', nameFr: 'Déménagement', nameAr: 'نقل الأثاث', icon: 'truck' },
  { slug: 'informatique', nameFr: 'Informatique', nameAr: 'معلوميات', icon: 'computer' },
  { slug: 'garde-enfants', nameFr: "Garde d'enfants", nameAr: 'رعاية الأطفال', icon: 'baby' },
  { slug: 'cours-particuliers', nameFr: 'Cours particuliers', nameAr: 'دروس خصوصية', icon: 'book' },
  { slug: 'plomberie', nameFr: 'Plomberie', nameAr: 'سباكة', icon: 'wrench' },
  { slug: 'electricite', nameFr: 'Électricité', nameAr: 'كهرباء', icon: 'lightning' },
  { slug: 'peinture', nameFr: 'Peinture', nameAr: 'طلاء', icon: 'paint' },
  { slug: 'climatisation', nameFr: 'Climatisation', nameAr: 'تكييف', icon: 'snowflake' },
  { slug: 'nettoyage-auto', nameFr: 'Nettoyage auto', nameAr: 'غسيل السيارات', icon: 'car' },
  { slug: 'livraison', nameFr: 'Livraison', nameAr: 'توصيل', icon: 'delivery' },
  { slug: 'cuisine', nameFr: 'Cuisine', nameAr: 'طبخ', icon: 'chef' },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]['slug'];
