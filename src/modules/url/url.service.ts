import UrlModel from "./url.model";
import { generateShortCode, buildShortUrl } from "../../utils/urls";
import { getCache, setCache, deleteCache } from "../../configs/cache";

export const shortenUrlService = async (
  originalUrl: string,
  userId?: string,
) => {
  let shortCode;
  let existingUrl;

  try {
    // collison handling
    do {
      shortCode = generateShortCode();
      existingUrl = await UrlModel.findOne({ shortCode });
    } while (existingUrl);

    const shortUrl = buildShortUrl(shortCode);

    const createdUrl = await UrlModel.create({
      userId,
      originalUrl,
      shortCode,
      shortUrl,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours expiration
      status: "ACTIVE",
    });

    // Cache Invalidation
    if (userId) {
      await deleteCache(`user_urls:${userId}`);
    }

    return createdUrl;
  } catch (error) {
    console.error("Error in shortenUrlService:", error);
    throw error;
  }
};

// Cached and optimized
export const redirectUrlService = async (shortCode: string) => {
  try {
    const cacheKey = `shorturl:${shortCode}`;

    // CHECK REDIS CACHE
    const cachedUrl = await getCache(cacheKey);

    if (cachedUrl) {
      console.log("Cache Hit");

      return cachedUrl.originalUrl;
    }

    console.log("Cache Miss");

    // DATABASE QUERY

    const urlEntry = await UrlModel.findOne({ shortCode }).lean();

    if (!urlEntry) {
      throw new Error("Short URL not found");
    }

    // STATUS CHECK
    if (urlEntry.status !== "ACTIVE") {
      throw new Error("Short URL is disabled");
    }

    // EXPIRY CHECK
    if (urlEntry.expiresAt && new Date(urlEntry.expiresAt) < new Date()) {
      throw new Error("Short URL expired");
    }

    // SAVE TO REDIS
    await setCache(cacheKey, urlEntry, 60 * 60);

    // RETURN ORIGINAL URL
    return urlEntry.originalUrl;
  } catch (error) {
    console.error("Redirect URL Service Error:", error);

    throw error;
  }
};

// Cached and optimized
export const getUsersUrlsService = async (userId: string) => {
  try {
    const cacheKey = `user_urls:${userId}`;

    // 1. Cache Check
    const cachedUrls = await getCache(cacheKey);

    if (cachedUrls) {
      return cachedUrls;
    }

    // 2. DB Query
    const urls = await UrlModel.find({ userId }).lean();

    // 3. Save Cache
    await setCache(cacheKey, urls, 600);

    // 4. Return
    return urls;
  } catch (error) {
    console.error("Error in getUsersUrlsService:", error);

    throw error;
  }
};

// Soft delete with cache invalidation
export const deleteUrlService = async (shortCode: string, userId: string) => {
  try {
    const deletedUrl = await UrlModel.findOneAndDelete({
      shortCode,
      userId,
    });

    if (!deletedUrl) {
      throw new Error("URL not found");
    }

    // invalidate redis cache
    await Promise.all([
      deleteCache(`shorturl:${shortCode}`),
      deleteCache(`user_urls:${userId}`),
    ]);

    return deletedUrl;
  } catch (error) {
    console.error("Error in deleteUrlService:", error);

    throw error;
  }
};
