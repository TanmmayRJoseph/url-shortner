import jwt, { SignOptions } from "jsonwebtoken";
import AuthModel from "../modules/auth/auth.model";

export const generateAccessToken = (userId: string) => {
  const secret = process.env.ACCESS_TOKEN_SECRET;
  const expiry = process.env.ACCESS_TOKEN_EXPIRATION || "1d";

  if (!secret || !expiry) {
    throw new Error("Missing JWT env variables");
  }
  const options: SignOptions = {
    expiresIn: expiry as SignOptions["expiresIn"],
  };

  return jwt.sign({ userId }, secret, options);
};

export const generateRefreshToken = (userId: string) => {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  const expiry = process.env.REFRESH_TOKEN_EXPIRATION || "7d";

  if (!secret || !expiry) {
    throw new Error("Missing JWT env variables");
  }

  const options: SignOptions = {
    expiresIn: expiry as SignOptions["expiresIn"],
  };

  return jwt.sign({ userId }, secret, options);
};

export const generateAccessAndRefreshTokens = async (userId: string) => {
  // find the user in the database
  const user = await AuthModel.findById(userId);

  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);

  if (!user) {
    throw new Error("User not found");
  }
  // saving the refresh token in the database
  user?.refreshTokens.push({ token: refreshToken, createdAt: new Date() });
  await user?.save();

  // return both tokens

  return { accessToken, refreshToken };
};

export const getCurrentUserIdFromToken = (token: string) => {
  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) {
    throw new Error("Missing JWT env variables");
  }

  try {
    // verify the token and extract the user ID
    const decodedToken = jwt.verify(token, secret) as jwt.JwtPayload & {
      userId: string;
    };

    // find the user in the database and return the full user object
    return decodedToken.userId;
  } catch (error) {
    console.error("Error decoding token:", error);
    throw new Error("Invalid token");
  }
};
