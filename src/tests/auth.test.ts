import "./setup";
import test from "node:test";
import assert from "node:assert/strict";
import AuthModel from "../modules/auth/auth.model";
import {registerService,loginService,profileService,refreshAccessTokenService,logoutService,} from "../modules/auth/auth.service";
import {registerController, loginController,profileController,refreshAccessTokenController,logoutController} from "../modules/auth/auth.controller";

// ======================================================
// UNIT TESTS FOR AUTH SERVICES
// ======================================================

// REGISTER SERVICE TEST
test("Register Service - should register a new user", async () => {
  // ARRANGE
  const userData = {
    name: "Test User",
    email: "testUser@gmail.com",
    password: "testPassword",
  };

  // ACT
  const registeredUser = await registerService(
    userData.name,
    userData.email,
    userData.password,
  );

  // ASSERT
  assert.strictEqual(registeredUser.name, userData.name);

  assert.strictEqual(registeredUser.email, userData.email.toLowerCase().trim());

  // Password should be hashed
  assert.notStrictEqual(registeredUser.password, userData.password);

  // User should have MongoDB _id
  assert.ok(registeredUser._id);
});

// LOGIN SERVICE TEST
test("Login Service - should login existing user", async () => {
  // ARRANGE
  const userData = {
    name: "Test User",
    email: "testUser@gmail.com",
    password: "testPassword",
  };

  // Register user first
  await registerService(userData.name, userData.email, userData.password);

  // ACT
  const { user, accessToken, refreshToken } = await loginService(
    userData.email,
    userData.password,
  );

  // ASSERT
  assert.strictEqual(user?.name, userData.name);

  assert.strictEqual(user?.email, userData.email.toLowerCase().trim());

  assert.ok(accessToken);

  assert.ok(refreshToken);
});

// PROFILE SERVICE TEST
test("Profile Service - should return user profile", async () => {
  // ARRANGE
  const userData = {
    name: "Test User",
    email: "testUser@gmail.com",
    password: "testPassword",
  };

  const registeredUser = await registerService(
    userData.name,
    userData.email,
    userData.password,
  );

  // ACT
  const userProfile = await profileService(registeredUser._id.toString());

  // ASSERT
  assert.strictEqual(userProfile?.name, userData.name);

  assert.strictEqual(userProfile?.email, userData.email.toLowerCase().trim());
});

// REFRESH ACCESS TOKEN TEST
test("Refresh Access Token Service - should rotate refresh token", async () => {
  // ARRANGE
  const userData = {
    name: "Test User",
    email: "testUser@gmail.com",
    password: "testPassword",
  };

  await registerService(userData.name, userData.email, userData.password);

  const loginResponse = await loginService(userData.email, userData.password);

  const oldRefreshToken = loginResponse.refreshToken;

  await new Promise((resolve) => setTimeout(resolve, 1000));
  // ACT
  const refreshedTokens = await refreshAccessTokenService(oldRefreshToken);

  // ASSERT
  assert.ok(refreshedTokens.accessToken);

  assert.ok(refreshedTokens.refreshToken);

  // Token rotation check
  assert.notStrictEqual(refreshedTokens.refreshToken, oldRefreshToken);
});

// LOGOUT SERVICE TEST
test("Logout Service - should remove refresh token", async () => {
  // ARRANGE
  const userData = {
    name: "Test User",
    email: "testUser@gmail.com",
    password: "testPassword",
  };

  const registeredUser = await registerService(
    userData.name,
    userData.email,
    userData.password,
  );

  const loginResponse = await loginService(userData.email, userData.password);

  const refreshToken = loginResponse.refreshToken;

  // ACT
  const logoutResponse = await logoutService(
    registeredUser._id.toString(),
    refreshToken,
  );

  // ASSERT

  assert.strictEqual(logoutResponse.success, true);

  assert.strictEqual(logoutResponse.message, "Logged out successfully");

  // Verify token removed from DB

  const userInDb = await AuthModel.findById(registeredUser._id);

  const tokenStillExists = userInDb?.refreshTokens.some(
    (tokenObj) => tokenObj.token === refreshToken,
  );

  assert.strictEqual(tokenStillExists, false);
});


// ======================================================
// INTEGRATION TESTS FOR AUTH CONTROLLER [ APIs ]
// ======================================================

