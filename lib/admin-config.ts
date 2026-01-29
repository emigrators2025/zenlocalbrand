// Admin Configuration - DO NOT EXPOSE IN CLIENT CODE
// Generated Admin Signing Key: ZEN-2026-ADMIN-KEY-X9K4M2P7Q3R8L5N1

export const ADMIN_CONFIG = {
  username: 'ZenAdmin2026',
  // Password hash (in production, use proper hashing like bcrypt)
  passwordHash: 'Ma23072007ZenLocal2026',
  signingKey: 'ZEN-2026-ADMIN-KEY-X9K4M2P7Q3R8L5N1',
  sessionDuration: 24 * 60 * 60 * 1000, // 24 hours
};

export function verifyAdminCredentials(username: string, password: string): boolean {
  return username === ADMIN_CONFIG.username && password === ADMIN_CONFIG.passwordHash;
}

export function generateAdminToken(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return Buffer.from(`${ADMIN_CONFIG.signingKey}:${timestamp}:${random}`).toString('base64');
}

export function verifyAdminToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [key, timestamp] = decoded.split(':');
    const tokenAge = Date.now() - parseInt(timestamp);
    return key === ADMIN_CONFIG.signingKey && tokenAge < ADMIN_CONFIG.sessionDuration;
  } catch {
    return false;
  }
}
