const { PrismaClient } = require('./node_modules/.pnpm/@prisma+client@5.22.0_prisma@5.22.0/node_modules/@prisma/client');
const bcrypt = require('./node_modules/.pnpm/bcrypt@5.1.1/node_modules/bcrypt');

const prisma = new PrismaClient();

async function createTestUser() {
  console.log('🌱 Creating test user for your taha_branch...');

  try {
    const passwordHash = await bcrypt.hash('test123456', 10);

    const testUser = await prisma.user.upsert({
      where: { phone: '+212622222222' },
      update: {},
      create: {
        phone: '+212622222222',
        firstName: 'Ayoub',
        lastName: 'El Hadrami',
        passwordHash,
        role: 'HELPER',
        city: 'Casablanca',
        phoneVerified: true,
        status: 'ACTIVE',
        email: 'ayoub@hadrami.ma',
        helperProfile: {
          create: {
            bio: 'Artisan professionnel avec plus de 8 ans d\'expérience. Spécialisé en électricité et plomberie. Travail de qualité garantie et ponctualité assurée.',
            yearsExperience: 8,
            workRadius: 25,
            isAvailable: true,
            isVerified: true,
            averageRating: 4.9,
            totalReviews: 67,
            totalJobsCompleted: 63,
            responseRate: 98.0,
          }
        }
      },
      include: {
        helperProfile: true
      }
    });

    console.log('\n🎉 SUCCESS! Test user created!');
    console.log('===================================================');
    console.log('📱 Phone: +212622222222');
    console.log('🔑 Password: test123456');
    console.log('👤 Name: Ayoub El Hadrami');
    console.log('🏙️ City: Casablanca');
    console.log('👷 Role: HELPER');
    console.log('📈 Rating: 4.9/5');
    console.log('💼 Experience: 8 years');
    console.log('📍 Work Radius: 25km');
    console.log('===================================================');
    console.log('');
    console.log('🚀 TO TEST:');
    console.log('1. http://localhost:3000/login');
    console.log('2. Phone: +212622222222');
    console.log('3. Password: test123456');
    console.log('4. Visit: http://localhost:3000/profile');
    console.log('');
    console.log('✨ Your profile page edit mode is ready!');

  } catch (error) {
    console.error('❌ Error creating user:', error);
    console.log('\n💡 Hint: Make sure your API database is running!');
  } finally {
    await prisma.$disconnect();
  }
}

