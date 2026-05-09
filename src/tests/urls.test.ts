import "./setup";
import test from "node:test";
import assert from "node:assert/strict";
import UrlModel from "../modules/url/url.model";
import { shortenUrlService,deleteUrlService,getUsersUrlsService,redirectUrlService } from "../modules/url/url.service";



// SHORTEN URL SERVICE
test("shortenUrlService should create a short URL", async () => {
  const originalUrl = "https://google.com";
  const userId = "681234567890123456789012";

  const createdUrl = await shortenUrlService(
    originalUrl,
    userId
  );

  assert.ok(createdUrl);

  assert.equal(createdUrl.originalUrl, originalUrl);

  assert.equal(createdUrl.userId.toString(), userId);

  assert.ok(createdUrl.shortCode);

  assert.ok(createdUrl.shortUrl);

  assert.equal(createdUrl.status, "ACTIVE");
});


// REDIRECT URL SERVICE
test("redirectUrlService should return original URL", async () => {
  const urlDoc = await UrlModel.create({
    userId: "681234567890123456789012",
    originalUrl: "https://github.com",
    shortCode: "test1234",
    shortUrl: "http://localhost:3000/test1234",
    status: "ACTIVE",
    expiresAt: new Date(Date.now() + 1000 * 60 * 60),
  });

  const originalUrl = await redirectUrlService(
    "test1234"
  );

  assert.equal(originalUrl, "https://github.com");
});


// REDIRECT EXPIRED URL
test("redirectUrlService should throw for expired URL", async () => {
  await UrlModel.create({
    userId: "681234567890123456789012",
    originalUrl: "https://expired.com",
    shortCode: "expired1",
    shortUrl: "http://localhost:3000/expired1",
    status: "ACTIVE",
    expiresAt: new Date(Date.now() - 1000),
  });

  await assert.rejects(
    async () => {
      await redirectUrlService("expired1");
    },
    {
      message: "Short URL expired",
    }
  );
});


// GET USER URLS SERVICE
test("getUsersUrlsService should return all URLs for user", async () => {
  const userId = "681234567890123456789099";

  await UrlModel.create([
    {
      userId,
      originalUrl: "https://site1.com",
      shortCode: "user001",
      shortUrl: "http://localhost:3000/user001",
      status: "ACTIVE",
    },
    {
      userId,
      originalUrl: "https://site2.com",
      shortCode: "user002",
      shortUrl: "http://localhost:3000/user002",
      status: "ACTIVE",
    },
  ]);

  const urls = await getUsersUrlsService(userId);

  assert.ok(Array.isArray(urls));

  assert.equal(urls.length, 2);
});


// DELETE URL SERVICE
test("deleteUrlService should delete URL", async () => {
  const userId = "681234567890123456789777";

  await UrlModel.create({
    userId,
    originalUrl: "https://delete.com",
    shortCode: "delete01",
    shortUrl: "http://localhost:3000/delete01",
    status: "ACTIVE",
  });

  const deletedUrl = await deleteUrlService(
    "delete01",
    userId
  );

  assert.ok(deletedUrl);

  const foundUrl = await UrlModel.findOne({
    shortCode: "delete01",
  });

  assert.equal(foundUrl, null);
});


// DELETE NON EXISTENT URL
test("deleteUrlService should throw if URL not found", async () => {
  await assert.rejects(
    async () => {
      await deleteUrlService(
        "notfound123",
        "681234567890123456789012"
      );
    },
    {
      message: "URL not found",
    }
  );
});