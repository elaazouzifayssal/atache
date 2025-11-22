const { PrismaClient } = require('./node_modules/.pnpm/@prisma+client@5.22.0_prisma@5.22.0/node_modules/@prisma/client');
const bcrypt = require('./node_modules/.pnpm/bcrypt@5.1.1/node_modules/bcrypt');

const prisma = new PrismaClient();

async function createTestUser() {
  console.log('🌱 Creating beautifully complete test user...');

  try {
    const passwordHash = await bcrypt.hash('test123456', 10);

    // First, create/get categories
    const categories = await Promise.all([
      prisma.category.upsert({
        where: { slug: 'electricite' },
        update: {},
        create: {
          slug: 'electricite',
          nameFr: 'Électricité',
          nameAr: 'كهرباء',
          icon: '⚡',
          description: 'Installation et réparation électrique, dépannages, mises aux normes'
        }
      }),
      prisma.category.upsert({
        where: { slug: 'plomberie' },
        update: {},
        create: {
          slug: 'plomberie',
          nameFr: 'Plomberie',
          nameAr: 'سباكة',
          icon: '🚿',
          description: 'Installation et réparation de plomberie, fuites, robinets, chauffe-eau'
        }
      }),
      prisma.category.upsert({
        where: { slug: 'peinture' },
        update: {},
        create: {
          slug: 'peinture',
          nameFr: 'Peinture',
          nameAr: 'طلاء',
          icon: '🎨',
          description: 'Peinture intérieure et extérieure, revêtements muraux'
        }
      })
    ]);

    const testUser = await prisma.user.upsert({
      where: { phone: '+212622222222' },
      update: {},
      create: {
        phone: '+212622222222',
        firstName: 'Ayoub',
        lastName: 'El Hadrami',
        email: 'ayoub@hadrami.ma',
        passwordHash,
        role: 'HELPER',
        city: 'Casablanca',
        phoneVerified: true,
        status: 'ACTIVE',
        helperProfile: {
          create: {
            bio: 'Artisan passionné avec plus de 8 ans d\'expérience dans le bâtiment. Spécialiste en électricité, plomberie et peinture. Je garantis un travail de qualité, ponctuel et respectueux de vos délais. Interventions dans toute la région Casablanca-Rabat.',
            yearsExperience: 8,
            workRadius: 25,
            isAvailable: true,
            isVerified: true,
            averageRating: 4.9,
            totalReviews: 67,
            totalJobsCompleted: 63,
            responseRate: 98.0,
            skills: {
              create: [
                {
                  categoryId: categories[0].id, // Électricité
                  hourlyRate: 150,
                  serviceDescription: 'Installations électriques complètes, diagnostics de pannes, réparation de circuits, mises aux normes électriques NF C 15-100. Interventions d\'urgence 24h/24 pour les pannes électriques.'
                },
                {
                  categoryId: categories[1].id, // Plomberie
                  hourlyRate: 120,
                  serviceDescription: 'Réparations plomberie, débouchages, changement de robinets et siphons, installations de chauffe-eau, dépannages fuites d\'eau. Équipé pour tous types d\'interventions.'
                },
                {
                  categoryId: categories[2].id, // Peinture
                  hourlyRate: 100,
                  serviceDescription: 'Peinture intérieure et extérieure, préparation des surfaces, pose de revêtements muraux (papier peint, tissus). Travail soigné avec finitions parfaites.'
                }
              ]
            }
          }
        }
      },
      include: {
        helperProfile: {
          include: {
            skills: {
              include: {
                category: true
              }
            }
          }
        }
      }
    });

    console.log('\n🎉 SUCCESS! Beautifully complete test user created!');
    console.log('======================================================================');
    console.log('📱 Phone: +212622222222');
    console.log('🔑 Password: test123456');
    console.log('👤 Name: Ayoub El Hadrami');
    console.log('✉️ Email: ayoub@hadrami.ma');
    console.log('🏙️ City: Casablanca');
    console.log('👷 Role: HELPER');
    console.log('⭐ Rating: 4.9/5');
    console.log('💼 Experience: 8 years');
    console.log('📍 Work Radius: 25km');
    console.log('✅ Verified: Yes');
    console.log('🔧 Skills: Électricité (150 MAD/h), Plomberie (120 MAD/h), Peinture (100 MAD/h)');
    console.log('======================================================================');
    console.log('');
    console.log('🚀 TO TEST THE BEAUTIFUL PROFILE:');
    console.log('1. Visit: http://localhost:3000/login');
    console.log('2. Phone: +212622222222');
    console.log('3. Password: test123456');
    console.log('4. Go to: http://localhost:3000/profile');
    console.log('5. Click "Modifier Profil" to edit and see all features!');
    console.log('');
    console.log('✨ Your modern, beautiful profile page is ready! 🎨🛠️⚡');

  } catch (error) {
    console.error('❌ Error creating user:', error);
    console.log('\n💡 Hints:');
    console.log('- Make sure your API database is running');
    console.log('- Try: cd apps/api && pnpm prisma db push');
    console.log('- Then run this script again');
  } finally {
    await prisma.$disconnect();
  }
}
