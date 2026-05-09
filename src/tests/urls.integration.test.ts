import "./setup";
import app from "../app";
import test from "node:test";
import jwt from "jsonwebtoken";
import request from "supertest";
import assert from "node:assert/strict";
import AuthModel from "../modules/auth/auth.model";
import UrlModel from "../modules/url/url.model";

let accessToken: string;
let userId: string;

test.beforeEach(async () => {
  const user = await AuthModel.create({
    name: "testuser",
    email: "test@example.com",
    password: "password123",
  });

  userId = user._id.toString();

  accessToken = jwt.sign(
    {
      userId: user._id.toString(),
    },
    process.env.ACCESS_TOKEN_SECRET as string,
  );
});

// ======================================================
// CREATE SHORT URL
// ======================================================

test("POST /api/url/shorten should create short URL", async () => {
  const response = await request(app)
    .post("/api/urls/shorten")
    .set("Authorization", `Bearer ${accessToken}`)
    .send({
      originalUrl: "https://google.com",
    });

  assert.equal(response.status, 201);
  assert.equal(response.body.success, true);
  assert.equal(response.body.message, "Short URL created successfully");

  assert.ok(response.body.data.shortCode);
  assert.ok(response.body.data.shortUrl);
});

// ======================================================
// VALIDATION
// ======================================================

test("POST /api/url/shorten should fail without originalUrl", async () => {
  const response = await request(app)
    .post("/api/urls/shorten")
    .set("Authorization", `Bearer ${accessToken}`)
    .send({});

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
  assert.equal(response.body.message, "Original URL is required");
});

// ======================================================
// GET USER URLS
// ======================================================

test("GET /api/url/my-urls should return user URLs", async () => {
  const response = await request(app)
    .get("/api/urls/my-urls")
    .set("Authorization", `Bearer ${accessToken}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);

  assert.ok(Array.isArray(response.body.data));
});

// ======================================================
// REDIRECT
// ======================================================

test("GET /api/url/:shortCode should redirect", async () => {
  const createdUrl = await UrlModel.create({
    userId,
    originalUrl: "https://github.com",
    shortCode: "redirect1",
    shortUrl: "http://localhost:3000/redirect1",
    status: "ACTIVE",
    expiresAt: new Date(Date.now() + 1000 * 60 * 60),
  });

  const response = await request(app)
    .get(`/api/urls/redirect/${createdUrl.shortCode}`)
    .redirects(0);

  assert.equal(response.status, 302);

  assert.equal(response.headers.location, "https://github.com");
});

// ======================================================
// INVALID SHORTCODE
// ======================================================

test("GET /api/url/:shortCode should fail for invalid shortCode", async () => {
  const response = await request(app)
    .get("/api/urls/redirect/invalid123")
    .redirects(0);

  assert.equal(response.status, 404);
});

// ======================================================
// DELETE URL
// ======================================================

test("DELETE /api/url/:shortCode should delete URL", async () => {
  await UrlModel.create({
    userId,
    originalUrl: "https://delete-test.com",
    shortCode: "delete123",
    shortUrl: "http://localhost:3000/delete123",
    status: "ACTIVE",
  });

  const response = await request(app)
    .delete("/api/urls/delete/delete123")
    .set("Authorization", `Bearer ${accessToken}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.message, "URL deleted successfully");

  const deletedUrl = await UrlModel.findOne({
    shortCode: "delete123",
  });

  assert.equal(deletedUrl, null);
});

// ======================================================
// DELETE WITHOUT TOKEN
// ======================================================

test("DELETE /api/url/:shortCode should fail without token", async () => {
  const response = await request(app).delete(
    "/api/urls/delete/delete123",
  );

  assert.equal(response.status, 401);
});