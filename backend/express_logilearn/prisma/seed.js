const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const BADGES = [
  {
    name: 'Skor Sempurna',
    description: 'Raih skor 100 untuk pertama kalinya',
    criteria_type: 'PERFECT_SCORE',
  },
  {
    name: 'Lulus Pertama Kali',
    description: 'Lulus (skor \u2265 75) di sebuah level untuk pertama kalinya',
    criteria_type: 'FIRST_PASS',
  },
  {
    name: 'Pelajar Rajin',
    description: 'Kumpulkan total XP \u2265 1000',
    criteria_type: 'XP_1000',
  },
  {
    name: 'Pejuang XP',
    description: 'Kumpulkan total XP \u2265 5000',
    criteria_type: 'XP_5000',
  },
];

async function main() {
  console.log('Seeding badges...');

  for (const badge of BADGES) {
    const result = await prisma.badges.upsert({
      where: { name: badge.name },
      update: {
        description: badge.description,
        criteria_type: badge.criteria_type,
      },
      create: badge,
    });
    console.log(`  ✓ Badge "${result.name}" (id: ${result.id}) seeded.`);
  }

  console.log('Seeding selesai.');
}

main()
  .catch((e) => {
    console.error('Error saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
