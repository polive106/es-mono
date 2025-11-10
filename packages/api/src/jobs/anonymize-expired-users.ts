/**
 * Scheduled Job: Anonymize Expired Users
 *
 * Purpose: Implement FR-044 - Automatic anonymization after 3 years of inactivity
 *
 * This job runs periodically (daily recommended) to:
 * 1. Find users inactive for 3+ years
 * 2. Anonymize their personal data
 * 3. Preserve aggregate statistics for analytics
 * 4. Log all anonymizations for audit trail
 *
 * Schedule: Run via cron job at 2 AM daily (off-peak time)
 * Example crontab: 0 2 * * * cd /app && npm run job:anonymize
 */

import { eq, lt, isNull, and } from 'drizzle-orm';
import type { DB } from '@es-mono/database';
import { users } from '@es-mono/database/schema';
import { logger } from '../middleware/logger';

export interface AnonymizationResult {
  anonymizedCount: number;
  skippedCount: number;
  errors: Array<{
    userId: string;
    error: string;
  }>;
  totalRecords: number;
  duration: number;
}

/**
 * Main job function for anonymizing expired users
 */
export async function anonymizeExpiredUsers(
  db: DB,
  daysInactive: number = 365 * 3 // 3 years default
): Promise<AnonymizationResult> {
  const startTime = Date.now();
  const result: AnonymizationResult = {
    anonymizedCount: 0,
    skippedCount: 0,
    errors: [],
    totalRecords: 0,
    duration: 0,
  };

  try {
    // Calculate cutoff date
    const threeYearsAgo = new Date();
    threeYearsAgo.setDate(threeYearsAgo.getDate() - daysInactive);

    logger.info('Starting user anonymization job', {
      cutoffDate: threeYearsAgo.toISOString(),
      daysInactive,
    });

    // Find users inactive for 3+ years and not yet anonymized
    const expiredUsers = await db
      .select()
      .from(users)
      .where(
        and(
          lt(users.lastActivityAt, threeYearsAgo),
          isNull(users.anonymizedAt)
        )
      );

    result.totalRecords = expiredUsers.length;

    logger.info('Found expired users to anonymize', {
      count: expiredUsers.length,
    });

    // Process each user in a transaction
    for (const user of expiredUsers) {
      try {
        await anonymizeUserTransaction(db, user);
        result.anonymizedCount++;
      } catch (error) {
        result.errors.push({
          userId: user.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        result.skippedCount++;
        logger.error('Failed to anonymize user', {
          userId: user.id,
          error,
        });
      }
    }

    result.duration = Date.now() - startTime;

    logger.info('User anonymization job completed', {
      anonymizedCount: result.anonymizedCount,
      skippedCount: result.skippedCount,
      totalRecords: result.totalRecords,
      durationMs: result.duration,
      errors: result.errors,
    });

    return result;
  } catch (error) {
    result.duration = Date.now() - startTime;
    logger.error('User anonymization job failed', {
      error,
      duration: result.duration,
    });
    throw error;
  }
}

/**
 * Anonymize a single user in a transaction
 *
 * Steps:
 * 1. Capture aggregate statistics
 * 2. Clear personal data
 * 3. Record anonymization timestamp
 * 4. Commit atomically
 */
async function anonymizeUserTransaction(
  db: DB,
  user: typeof users.$inferSelect
): Promise<void> {
  await db.transaction(async (tx: Parameters<Parameters<DB['transaction']>[0]>[0]) => {
    // Step 1: Preserve aggregate statistics
    // (skipped for MVP - implement when analytics needed)

    // Step 2: Anonymize personal data
    const anonymizationTimestamp = new Date();
    const anonymizedEmail = `anon_${user.id.slice(0, 8)}@anonymized.local`;
    const anonymizedName = `Anonymized_${user.id.slice(0, 8)}`;

    await tx
      .update(users)
      .set({
        // Clear personal identifiers
        name: anonymizedName,
        email: anonymizedEmail,
        languagePref: 'en', // Reset to default

        // Mark as anonymized
        isAnonymized: true,
        anonymizedAt: anonymizationTimestamp,

        // Update activity timestamp (prevents re-processing)
        lastActivityAt: anonymizationTimestamp,
        updatedAt: anonymizationTimestamp,
      })
      .where(eq(users.id, user.id));

    logger.info('User anonymized successfully', {
      userId: user.id,
      anonymizedAt: anonymizationTimestamp.toISOString(),
      originalEmail: user.email,
      anonymizedEmail,
    });
  });
}

/**
 * Verify anonymization was successful
 */
export async function verifyAnonymization(
  db: DB,
  userId: string
): Promise<boolean> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    return false;
  }

  // Check that personal data is anonymized
  const isAnonymized =
    user.isAnonymized &&
    user.anonymizedAt !== null &&
    !user.email.includes('@') || user.email.endsWith('@anonymized.local');

  return isAnonymized;
}

/**
 * CLI entry point for manual execution
 * Usage: npx tsx packages/api/src/jobs/anonymize-expired-users.ts
 */
if (require.main === module) {
  (async () => {
    try {
      // Import database after checking if running as main module
      const { db } = await import('@es-mono/database');

      const result = await anonymizeExpiredUsers(db);

      console.log('Anonymization job result:', result);

      process.exit(result.errors.length > 0 ? 1 : 0);
    } catch (error) {
      console.error('Job failed:', error);
      process.exit(1);
    }
  })();
}

export default anonymizeExpiredUsers;
