import AuthModel from "./auth.model";
import jwt from "jsonwebtoken";
import { hashPassword, comparePassword } from "../../utils/passwordHash";
import {generateAccessToken,generateAccessAndRefreshTokens,generateRefreshToken,} from "../../utils/token";

export const registerService = async ( name: string, email: string,password: string,) => {
  try {
    // Check if user already exists
    const existingUser = await AuthModel.findOne({ email });
    if (existingUser) {
      throw new Error("User already exists");
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const newUser = new AuthModel({
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });

    console.log("New user created");
    // Save user to database
    const savedUser = await newUser.save();

    return savedUser;
  } catch (error) {
    console.error("Error in registerService:", error);
    throw error;
  }
};

export const loginService = async (email: string, password: string) => {
  try {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

      const normalizedEmail =
      email.toLowerCase().trim();
    //   find user by email
    const user = await AuthModel.findOne({ email: normalizedEmail });
    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    //   generate access token and refresh token
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id.toString(),
    );

    const loggedInUser = await AuthModel.findById(user._id).select("-password");
    return { user: loggedInUser, accessToken, refreshToken };
  } catch (error) {
    console.error("Error in loginService:", error);
    throw error;
  }
};

export const refreshAccessTokenService = async (refreshToken: string) => {
  try {
    if (!refreshToken) {
      throw new Error("Refresh token is required");
    }
    const decodedToken = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string,
    ) as jwt.JwtPayload;

    const userId = decodedToken.userId;

    const user = await AuthModel.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    // ======================================================
    // STEP 1:
    // Check if refresh token exists in DB
    // ======================================================
    // IMPORTANT SECURITY STEP
    //
    // Even if JWT is valid,
    // we only trust refresh tokens stored in DB.
    //
    // This allows:
    // - logout
    // - session revocation
    // - token rotation
    // ======================================================

    const tokenExists = user.refreshTokens.some(
      (tokenObj:any) => tokenObj.token === refreshToken,
    );

    if (!tokenExists) {
      throw new Error("Invalid refresh token");
    }

    // ======================================================
    // STEP 2:
    // REFRESH TOKEN ROTATION
    // ======================================================
    // Remove OLD refresh token from database
    //
    // Why?
    // So stolen old tokens cannot be reused.
    // ======================================================

    user.refreshTokens = user.refreshTokens.filter(
      (rt:any) => rt.token !== refreshToken,
    );

    // ======================================================
    // STEP 3:
    // Generate NEW refresh token
    // ======================================================
    // Every refresh request gets a brand new
    // refresh token.
    // ======================================================

    const newRefreshToken = generateRefreshToken(userId as string);

    // ======================================================
    // STEP 4:
    // Save NEW refresh token in database
    // ======================================================
    // This becomes the user's active session token.
    // ======================================================

    user.refreshTokens.push({
      token: newRefreshToken,
      createdAt: new Date(),
    });

    // ======================================================
    // STEP 5:
    // Save updated user document
    // ======================================================

    await user.save();

    // ======================================================
    // STEP 6:
    // Generate NEW access token
    // ======================================================
    // Access token is short-lived and used
    // for protected API requests.
    // ======================================================

    const newAccessToken = generateAccessToken(userId as string);

    // ======================================================
    // STEP 7:
    // Return new tokens to client
    // ======================================================

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    console.error("Error in refreshAccessTokenService:", error);
    throw error;
  }
};
export const logoutService = async (userId: string, refreshToken: string) => {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    if (!refreshToken) {
      throw new Error("Refresh token is required");
    }

    const user = await AuthModel.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    // ======================================================
    // STEP 1:
    // Remove refresh token from database
    // ======================================================
    // This logs out ONLY the current device/session.
    //
    // Example:
    // User logged in from:
    // - Phone
    // - Laptop
    //
    // Removing one refresh token logs out
    // only that specific session.
    // ======================================================

    user.refreshTokens = user.refreshTokens.filter(
      (tokenObj:any) => tokenObj.token !== refreshToken,
    );

    // ======================================================
    // STEP 2:
    // Save updated user document
    // ======================================================

    await user.save();

    // ======================================================
    // STEP 3:
    // Return success response
    // ======================================================

    return {
      success: true,
      message: "Logged out successfully",
    };
  } catch (error) {
    console.error("Error in logoutService:", error);
    throw error;
  }
};

export const profileService = async (userId: string) => {
  const user = await AuthModel.findById(userId).select(
    "-password -refreshTokens",
  );

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};
