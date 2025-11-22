import { PrismaClient } from '@prisma/client';
import { CATEGORIES } from '@khedma/shared';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Seed categories
  for (let i = 0; i < CATEGORIES.length; i++) {
    const cat = CATEGORIES[i];
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        slug: cat.slug,
        nameFr: cat.nameFr,
        nameAr: cat.nameAr,
        icon: cat.icon,
        sortOrder: i,
      },
    });
  }

  console.log(`✅ Seeded ${CATEGORIES.length} categories`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
