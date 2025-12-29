const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function run(userId) {
  if (!userId) {
    console.error('Usage: node scripts/create-unlimited-chat-usage.js <USER_ID>');
    process.exit(1);
  }

  // Check existing
  const existing = await prisma.chatUsage.findUnique({ where: { userId } });
  if (existing) {
    console.log('chat_usage already exists for user:', existing);
    await prisma.$disconnect();
    return;
  }

  // Create with quota = null (unlimited). Make sure the DB column allows NULL.
  const created = await prisma.chatUsage.create({
    data: { userId, promptCount: 0, quota: null },
  });

  console.log('Created chat_usage:', created);
  await prisma.$disconnect();
}

run(process.argv[2]).catch((err) => {
  console.error('Error:', err);
  prisma.$disconnect();
  process.exit(1);
});
