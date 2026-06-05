import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

let ratelimit: Ratelimit | null = null;

try {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (redisUrl && redisToken) {
    const redisClient = new Redis({
      url: redisUrl,
      token: redisToken,
    });

    ratelimit = new Ratelimit({
      redis: redisClient,
      limiter: Ratelimit.slidingWindow(5, '1 m'),
      analytics: true,
      prefix: 'hariyana-opticals-ratelimit',
    });
  } else {
    console.warn(
      'WARNING: UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are not defined. Rate limiting will be disabled (always allow).'
    );
  }
} catch (error) {
  console.error('Failed to initialize Upstash Redis rate limiter:', error);
}

/**
 * Checks if the request should be rate-limited.
 * Returns { success: boolean, limit: number, remaining: number, reset: number }
 */
export async function checkRateLimit(ip: string) {
  if (!ratelimit) {
    return { success: true, limit: 5, remaining: 5, reset: Date.now() };
  }
  
  try {
    const result = await ratelimit.limit(ip);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    console.error('Rate limiting check failed, allowing request anyway:', error);
    return { success: true, limit: 5, remaining: 5, reset: Date.now() };
  }
}
