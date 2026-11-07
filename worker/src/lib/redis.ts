import { Redis, type RedisOptions } from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

export function createRedisConnection(overrides?: Partial<RedisOptions>): Redis {
  const options: RedisOptions = {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    ...overrides,
  };

  return new Redis(redisUrl, options);
}

export const defaultRedisConnection = createRedisConnection();
