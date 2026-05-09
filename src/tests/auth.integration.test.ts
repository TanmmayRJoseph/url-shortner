import "./setup";
import app from "../app";
import test from "node:test";
import request from "supertest";
import assert from "node:assert/strict";

// Integration tests for auth routes
test("POST /register should register user", async () => {
  const userData = {
    name: "Test User",
    email: "test@gmail.com",
    password: "password123",
  };

  const response = await request(app).post("/api/auth/register").send(userData);

  assert.strictEqual(response.status, 201);

  assert.strictEqual(response.body.success, true);

  assert.strictEqual(response.body.user.email, userData.email);
});

// LOGIN ROUTE TEST
test("POST /login should login user", async () => {
  const userData = {
    name: "Test User",
    email: "test@gmail.com",
    password: "password123",
  };

  // Register first

  await request(app).post("/api/auth/register").send(userData);

  // Login

  const response = await request(app).post("/api/auth/login").send({
    email: userData.email,
    password: userData.password,
  });

  assert.strictEqual(response.status, 200);

  assert.strictEqual(response.body.success, true);

  // Check cookies
  const cookies = response.headers["set-cookie"];

  assert.ok(cookies);
});

// PROFILE ROUTE TEST
test("GET /profile should return user profile", async () => {
  const userData = {
    name: "Test User",
    email: "test@gmail.com",
    password: "password123",
  };

  // Register

  await request(app).post("/api/auth/register").send(userData);

  // Login

  const loginResponse = await request(app).post("/api/auth/login").send({
    email: userData.email,
    password: userData.password,
  });

  // Extract cookies

  const cookies = loginResponse.headers["set-cookie"];

  // Access protected route

  const profileResponse = await request(app)
    .get("/api/auth/profile")
    .set("Cookie", cookies);

  assert.strictEqual(profileResponse.status, 200);

  assert.strictEqual(profileResponse.body.user.email, userData.email);
});

// REFRESH TOKEN TEST
test("POST /refresh-access-token should refresh token", async () => {
  const userData = {
    name: "Test User",
    email: "test@gmail.com",
    password: "password123",
  };

  // Register

  await request(app).post("/api/auth/register").send(userData);

  // Login

  const loginResponse = await request(app).post("/api/auth/login").send({
    email: userData.email,
    password: userData.password,
  });

  const cookies = loginResponse.headers["set-cookie"];

  // Refresh token

  const refreshResponse = await request(app)
    .post("/api/auth/refresh-access-token")
    .set("Cookie", cookies);

  assert.strictEqual(refreshResponse.status, 200);

  assert.strictEqual(refreshResponse.body.success, true);
});

// LOGOUT TEST
test("POST /logout should logout user", async () => {
  const userData = {
    name: "Test User",
    email: "test@gmail.com",
    password: "password123",
  };

  // Register

  await request(app).post("/api/auth/register").send(userData);

  // Login

  const loginResponse = await request(app).post("/api/auth/login").send({
    email: userData.email,
    password: userData.password,
  });

  const cookies = loginResponse.headers["set-cookie"];

  // Logout

  const logoutResponse = await request(app)
    .post("/api/auth/logout")
    .set("Cookie", cookies);

  assert.strictEqual(logoutResponse.status, 200);

  assert.strictEqual(logoutResponse.body.success, true);
});
