const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgrespassword@127.0.0.1:5432/superapp_db?schema=public';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function run() {
  const users = await prisma.user.findMany({
    select: { id: true, phone: true, role: true, fullName: true },
    take: 15
  });
  console.log('USERS:', JSON.stringify(users, null, 2));

  const restaurants = await prisma.restaurant.findMany({
    select: { id: true, name: true, ownerId: true }
  });
  console.log('RESTAURANTS:', JSON.stringify(restaurants, null, 2));
}

run()
  .catch(console.error)
  .finally(() => pool.end());
