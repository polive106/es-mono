import { createHash } from 'crypto';

/**
 * Check if a password has been compromised in known data breaches
 * using the Have I Been Pwned API with k-anonymity model
 *
 * @param password - The password to check
 * @returns Number of times the password has appeared in breaches (0 = safe)
 * @throws Error if the API request fails
 */
export async function checkPasswordBreach(password: string): Promise<number> {
  // Hash the password with SHA-1 (HIBP requirement)
  const hash = createHash('sha1').update(password).digest('hex').toUpperCase();

  // Use k-anonymity: send only first 5 characters
  const prefix = hash.substring(0, 5);
  const suffix = hash.substring(5);

  // Query HIBP API
  const response = await fetch(
    `https://api.pwnedpasswords.com/range/${prefix}`,
    {
      headers: {
        'User-Agent': 'SkillSwap-Platform',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`HIBP API error: ${response.status} ${response.statusText}`);
  }

  const text = await response.text();

  // Parse response - format is "SUFFIX:COUNT\r\n"
  const lines = text.split('\r\n');

  for (const line of lines) {
    const [hashSuffix, countStr] = line.split(':');
    if (hashSuffix === suffix) {
      return parseInt(countStr, 10);
    }
  }

  // Password not found in breaches
  return 0;
}

/**
 * Validates if a password is safe to use (not in breach database)
 *
 * @param password - The password to validate
 * @returns true if password is safe, false if compromised
 */
export async function isPasswordSafe(password: string): Promise<boolean> {
  try {
    const breachCount = await checkPasswordBreach(password);
    return breachCount === 0;
  } catch (error) {
    // Log error but don't block registration if HIBP is down
    console.warn('HIBP check failed, allowing password:', error);
    return true;
  }
}
