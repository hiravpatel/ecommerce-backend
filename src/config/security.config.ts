import { createHash } from 'crypto';
import { registerAs } from '@nestjs/config';

function buildEncryptionKey() {
  const rawKey = process.env.APP_ENCRYPTION_KEY ?? process.env.JWT_SECRET ?? 'change-me';

  // AES-256 requires a 32-byte key, so we normalize any configured secret to that size.
  return createHash('sha256').update(rawKey).digest('hex');
}

export default registerAs('security', () => ({
  encryptionKey: buildEncryptionKey(),
}));
