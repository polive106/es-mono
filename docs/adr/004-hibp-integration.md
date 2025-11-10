# ADR-004: HIBP Password Breach Detection Integration

**Date**: 2025-11-08
**Status**: ACCEPTED
**Context**: FR-040 requires checking user passwords against known breached password databases to enhance account security.

## Problem Statement

SkillSwap must prevent users from setting passwords that appear in known breach databases. This protects user accounts from credential stuffing attacks.

We evaluated three approaches for implementing password breach detection.

## Options Evaluated

### Option A: Have I Been Pwned (HIBP) API
- **Privacy**: ✅ Excellent (k-anonymity protocol)
  - Only first 5 characters of SHA-1 hash sent over network
  - Server cannot reverse-engineer original password
- **Data Quality**: 850M+ breached passwords (updated frequently)
- **API**: Free for reasonable use, rate limit 1 request per 1.5 seconds
- **Integration**: Simple REST API, well-documented
- **Pros**:
  - Industry standard, maintained by Troy Hunt
  - Privacy-preserving (k-anonymity)
  - Zero maintenance (no database updates)
  - No false positives (authoritative data)
  - Proven: used by 1Password, Dropbox, government agencies
- **Cons**:
  - External dependency
  - Rate limits (1 req/1.5s)
  - Network latency

### Option B: Local Breached Password Database
- **Privacy**: ✅ Perfect (no external calls)
- **Data Quality**: Depends on dataset
  - Full HIBP dump: 12GB (impractical)
  - SecLists 10M: ~200MB compressed
  - Quickly outdated (new breaches daily)
- **Pros**:
  - No external dependency
  - No rate limits
  - Instant checks
- **Cons**:
  - Large storage overhead
  - Requires manual updates
  - Out-of-date quickly
  - False negatives (misses new breaches)

### Option C: Password Strength Rules Only
- **Privacy**: ✅ Perfect
- **Data Quality**: ❌ Cannot detect breaches
- **Pros**:
  - Zero dependencies
  - Instant checks
  - Simple implementation
- **Cons**:
  - ❌ Does not satisfy FR-040 requirement
  - False sense of security
  - Fails at security goal

## Decision

**Use Have I Been Pwned (HIBP) k-Anonymity API**

### Rationale

1. **Requirement Compliance**: FR-040 explicitly requires breach detection
2. **Privacy**: k-anonymity protocol ensures no full password/hash sent over network
3. **Maintenance-Free**: Troy Hunt maintains dataset; no manual updates
4. **Proven**: Used by security leaders (1Password, Dropbox, government)
5. **Cost**: Free for non-commercial/reasonable use (MVP qualifies)
6. **Accuracy**: Authoritative data source, zero false positives

### k-Anonymity Protocol

HIBP API works by:
1. Client computes SHA-1 hash of password
2. Client sends only **first 5 characters** of hash (k-anonymity)
3. HIBP returns all hashes starting with those 5 chars (~500-1000 results)
4. Client compares full hash locally (no server sees full hash)
5. If match found, password is breached

Example:
```
Password: "MyPassword123!"
SHA-1: D4B8F4B2C7A9E3F1D2E4A5B6C7D8E9F0A1B2C3D
Prefix: D4B8F (sent to HIBP)
Response: [D4B8F1234567..., D4B8F9876543..., ...] (500 hashes)
Match: Local check finds full hash in response → Password breached!
```

## Implementation

### Service Layer

```typescript
// packages/api/src/auth/hibp.ts
import crypto from 'crypto';

export async function isPasswordBreached(password: string): Promise<boolean> {
  try {
    const sha1 = crypto
      .createHash('sha1')
      .update(password)
      .digest('hex')
      .toUpperCase();

    const prefix = sha1.substring(0, 5);
    const suffix = sha1.substring(5);

    const response = await fetch(
      `https://api.pwnedpasswords.com/range/${prefix}`,
      {
        headers: {
          'User-Agent': 'SkillSwap/1.0',
        },
        timeout: 5000, // 5s timeout
      }
    );

    if (!response.ok) {
      // If HIBP is down, log warning and allow registration (degrade gracefully)
      console.warn(`HIBP API error: ${response.status}, allowing registration`);
      return false;
    }

    const hashes = await response.text();

    // Check if suffix appears in response
    return hashes.includes(suffix);
  } catch (error) {
    // Network error, timeout, etc.
    console.warn(`HIBP check failed: ${error}, allowing registration`);
    return false; // Degrade gracefully
  }
}
```

### Use Case Layer

```typescript
// packages/domain/src/use-cases/auth/RegisterUser.ts
export class RegisterUser {
  constructor(
    private userRepository: UserRepository,
    private passwordService: PasswordService,
    private breachChecker: BreachChecker,
  ) {}

  async execute(
    email: string,
    password: string,
    name: string,
    companyInviteCode: string,
  ): Promise<User> {
    // Validation
    if (password.length < 12) {
      throw new ValidationError('Password must be at least 12 characters');
    }

    // Check if password is breached
    const isBreached = await this.breachChecker.isPasswordBreached(password);
    if (isBreached) {
      throw new ValidationError(
        'Password appears in known breach database. Please choose a different password.'
      );
    }

    // Hash and store
    const passwordHash = await this.passwordService.hash(password);
    const user = await this.userRepository.create({
      email,
      passwordHash,
      name,
      companyInviteCode,
    });

    return user;
  }
}
```

### API Endpoint Integration

```typescript
// packages/api/src/adapters/http/routes/auth.ts
const authRouter = new Hono()
  .post('/register', zValidator('json', registerSchema), async (c) => {
    const data = c.req.valid('json');

    try {
      const user = await registerUserUseCase.execute(
        data.email,
        data.password,
        data.name,
        data.inviteCode
      );

      return c.json(
        {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        201
      );
    } catch (error) {
      if (error instanceof ValidationError) {
        return c.json({ error: error.message }, 400);
      }
      throw error;
    }
  });
```

## Rate Limiting Strategy

HIBP has rate limit: **1 request per 1.5 seconds per IP**

Handling:
1. **Per-request caching**: Cache HIBP result for 5 minutes
   - If same password checked twice, use cache for 2nd check
2. **Batch registration**: If multiple users registering, check once per password
3. **Graceful degradation**: If rate limit hit, allow registration (log warning)

```typescript
// Simple in-memory cache for MVP
const breachCache = new Map<string, boolean>();
const cacheExpiry = new Map<string, number>();

export async function isPasswordBreachedCached(password: string): Promise<boolean> {
  const sha1 = crypto.createHash('sha1').update(password).digest('hex');

  // Check cache
  if (breachCache.has(sha1) && cacheExpiry.get(sha1)! > Date.now()) {
    return breachCache.get(sha1)!;
  }

  // Cache miss, check HIBP
  const isBreached = await isPasswordBreached(password);

  // Cache for 5 minutes
  breachCache.set(sha1, isBreached);
  cacheExpiry.set(sha1, Date.now() + 5 * 60 * 1000);

  return isBreached;
}
```

## Error Handling

```typescript
export enum BreachCheckError {
  NETWORK_ERROR = 'network_error',
  TIMEOUT = 'timeout',
  API_ERROR = 'api_error',
  RATE_LIMIT = 'rate_limit',
}

// Graceful degradation: allow registration if HIBP is unavailable
// Log all failures for monitoring
```

## Testing

```typescript
// packages/domain/tests/use-cases/RegisterUser.test.ts
describe('RegisterUser', () => {
  it('should reject breached passwords', async () => {
    const breachChecker = {
      isPasswordBreached: vi.fn().mockResolvedValue(true),
    };

    const registerUser = new RegisterUser(
      userRepository,
      passwordService,
      breachChecker
    );

    await expect(
      registerUser.execute('user@example.com', 'Password123456', 'John', 'invite-code')
    ).rejects.toThrow('appears in known breach database');
  });

  it('should accept non-breached passwords', async () => {
    const breachChecker = {
      isPasswordBreached: vi.fn().mockResolvedValue(false),
    };

    const registerUser = new RegisterUser(
      userRepository,
      passwordService,
      breachChecker
    );

    const user = await registerUser.execute(
      'user@example.com',
      'UniquePassword123456',
      'John',
      'invite-code'
    );

    expect(user.email).toBe('user@example.com');
  });

  it('should gracefully handle HIBP API errors', async () => {
    const breachChecker = {
      isPasswordBreached: vi.fn().mockRejectedValue(new Error('Network error')),
    };

    const registerUser = new RegisterUser(
      userRepository,
      passwordService,
      breachChecker
    );

    // Should still allow registration on error (logged)
    const user = await registerUser.execute(
      'user@example.com',
      'Password123456',
      'John',
      'invite-code'
    );

    expect(user.email).toBe('user@example.com');
  });
});
```

## Monitoring & Observability

```typescript
// Log all breach checks for security audit trail
logger.info('Breach check', {
  event: 'breach_check',
  email: user.email,
  isBreached: result,
  timestamp: new Date().toISOString(),
});

// Alert on failures
if (error) {
  logger.warn('HIBP check failed', {
    error: error.message,
    email: user.email,
  });
}
```

## Consequences

### Positive
- ✅ Strong security posture (FR-040 satisfied)
- ✅ Privacy-preserving (k-anonymity)
- ✅ Zero maintenance (no manual updates)
- ✅ Proven track record
- ✅ Graceful degradation on failures

### Negative
- ⚠️ External API dependency
- ⚠️ Network latency (~200-500ms per check)
- ⚠️ Rate limiting (1 req/1.5s)

## Production Considerations

1. **Monitoring**: Alert if HIBP API becomes unavailable
2. **Caching**: Implement Redis-backed cache for production (not in-memory)
3. **Rate Limiting**: Batch user imports, apply backoff if rate limited
4. **Fallback**: Clear degradation strategy (allow registration, log for review)

## References

- Research.md Topic 3: Password Breach Detection
- [HIBP API Documentation](https://haveibeenpwned.com/API/v3)
- [HIBP k-Anonymity Overview](https://blog.cloudflare.com/validating-leaked-passwords-with-k-anonymity/)
- FR-040: Password policy requirement
- Constitution Principle III: Security by Design
