import bcrypt from 'bcrypt';
import { PASSWORD_MIN_LENGTH } from '@es-mono/shared';

const SALT_ROUNDS = 12;

/**
 * Hashes a plain text password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  if (password.length < PASSWORD_MIN_LENGTH) {
    throw new Error(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
  }
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verifies a plain text password against a hashed password
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
