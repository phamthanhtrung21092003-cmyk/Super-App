export const jwtConstants = {
  secret: process.env.JWT_SECRET || 'super-app-secret-jwt-key-2026',
  expiresIn: '15m',
  refreshExpiresIn: '7d',
};
