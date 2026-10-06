export default {
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgrespassword@127.0.0.1:5432/superapp_db?schema=public',
  },
};
