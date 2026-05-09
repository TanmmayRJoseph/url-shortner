import { Request, Response } from "express";
import {
  registerService,
  loginService,
  refreshAccessTokenService,
  logoutService,
  profileService,
} from "./auth.service";

export const registerController = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const user = await registerService(name, email, password);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error: any) {
    console.error("Error in registerController:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Registration failed",
    });
  }
};

export const loginController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await loginService(
      email,
      password,
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 mins
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user,
    });
  } catch (error: any) {
    console.error("Error in loginController:", error);

    return res.status(401).json({
      success: false,
      message: error.message || "Login failed",
    });
  }
};

export const refreshAccessTokenController = async (
  req: Request,
  res: Response,
) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    const { accessToken, refreshToken: newRefreshToken } =
      await refreshAccessTokenService(refreshToken);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Access token refreshed successfully",
    });
  } catch (error: any) {
    console.error("Error in refreshAccessTokenController:", error);

    return res.status(401).json({
      success: false,
      message: error.message || "Failed to refresh token",
    });
  }
};

export const logoutController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id.toString();

    const refreshToken = req.cookies?.refreshToken;
    const response = await logoutService(userId as string, refreshToken);

    res.clearCookie("accessToken");

    res.clearCookie("refreshToken");

    return res.status(200).json(response);
  } catch (error: any) {
    console.error("Error in logoutController:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Logout failed",
    });
  }
};

export const profileController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id.toString();

    const user = await profileService(userId as string);

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error: any) {
    console.error("Error in profileController:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch profile",
    });
  }
};
