import { redisClient } from "./redis";

export const getCache = async (key: string) => {
  if (!redisClient.isOpen) {
    return null; // Skip caching if Redis is not available for test environment
  }

  const data = await redisClient.get(key);
  return data ? JSON.parse(data) : null;
};

export const setCache = async (key: string, value: unknown, ttl = 3600) => {
  if (!redisClient.isOpen) return; // Skip caching if Redis is not available for test environment
  await redisClient.set(key, JSON.stringify(value), { EX: ttl });
};

export const deleteCache = async (key: string) => {
  if (!redisClient.isOpen) return; // Skip caching if Redis is not available for test environment
  await redisClient.del(key);
};
