import { Redis } from '@upstash/redis';

const redis = new Redis({
    url: process.env.REDIS_URL,
    token: process.env.REDIS_TOKEN,
});

export async function rateLimit(identifier, limit = 10, window = 60) {
    const key = `rate_limit:${identifier}`;
    
    try {
        const requests = await redis.incr(key);
        
        if (requests === 1) {
            await redis.expire(key, window);
        }
        
        if (requests > limit) {
            return { success: false };
        }
        
        return { success: true, remaining: limit - requests };
    } catch (error) {
        console.error('Rate limiting error:', error);
        // Fail open - allow the request if rate limiting fails
        return { success: true, remaining: 1 };
    }
} 