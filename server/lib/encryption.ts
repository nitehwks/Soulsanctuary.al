import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

function getEncryptionKey(): Buffer {
  const keyString = process.env.ENCRYPTION_KEY || process.env.SESSION_SECRET || 'trusthub-default-key-change-in-production';
  return crypto.scryptSync(keyString, 'trusthub-salt', KEY_LENGTH);
}

export interface EncryptedData {
  ciphertext: string;
  iv: string;
  authTag: string;
  version: number;
}

export function encrypt(plaintext: string): EncryptedData {
  if (!plaintext) {
    return { ciphertext: '', iv: '', authTag: '', version: 1 };
  }

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let ciphertext = cipher.update(plaintext, 'utf8', 'base64');
  ciphertext += cipher.final('base64');

  const authTag = cipher.getAuthTag();

  return {
    ciphertext,
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
    version: 1
  };
}

export function decrypt(encryptedData: EncryptedData): string {
  if (!encryptedData.ciphertext) {
    return '';
  }

  const key = getEncryptionKey();
  const iv = Buffer.from(encryptedData.iv, 'base64');
  const authTag = Buffer.from(encryptedData.authTag, 'base64');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let plaintext = decipher.update(encryptedData.ciphertext, 'base64', 'utf8');
  plaintext += decipher.final('utf8');

  return plaintext;
}

export function encryptToString(plaintext: string): string {
  const encrypted = encrypt(plaintext);
  return JSON.stringify(encrypted);
}

export function decryptFromString(encryptedString: string): string {
  if (!encryptedString) return '';
  try {
    const encrypted = JSON.parse(encryptedString) as EncryptedData;
    return decrypt(encrypted);
  } catch {
    return encryptedString;
  }
}

export function hashData(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, 'sha512');
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [saltHex, hashHex] = storedHash.split(':');
  if (!saltHex || !hashHex) return false;

  const salt = Buffer.from(saltHex, 'hex');
  const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, 'sha512');
  return hash.toString('hex') === hashHex;
}

export function maskSensitiveData(data: string, visibleStart: number = 2, visibleEnd: number = 2): string {
  if (data.length <= visibleStart + visibleEnd) {
    return '*'.repeat(data.length);
  }
  const start = data.substring(0, visibleStart);
  const end = data.substring(data.length - visibleEnd);
  const middle = '*'.repeat(Math.max(4, data.length - visibleStart - visibleEnd));
  return `${start}${middle}${end}`;
}

export function generateDataFingerprint(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
}

export interface SecureField {
  encrypted: string;
  fingerprint: string;
  encryptedAt: string;
}

export function createSecureField(plaintext: string): SecureField {
  return {
    encrypted: encryptToString(plaintext),
    fingerprint: generateDataFingerprint(plaintext),
    encryptedAt: new Date().toISOString()
  };
}

export function readSecureField(field: SecureField): string {
  return decryptFromString(field.encrypted);
}

export function secureWipe(data: Buffer | string): void {
  if (Buffer.isBuffer(data)) {
    crypto.randomFillSync(data);
    data.fill(0);
  }
}
