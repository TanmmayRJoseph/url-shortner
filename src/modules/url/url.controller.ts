import { Request, Response } from "express";
import {
  shortenUrlService,
  getUsersUrlsService,
  redirectUrlService,
  deleteUrlService,
} from "./url.service";

export const shortenUrlController = async (req: Request, res: Response) => {
  try {
    const { originalUrl } = req.body;

    const userId = req.user?._id;

    if (!originalUrl) {
      return res.status(400).json({
        success: false,
        message: "Original URL is required",
      });
    }

    const createdUrl = await shortenUrlService(originalUrl, userId);

    return res.status(201).json({
      success: true,
      message: "Short URL created successfully",
      data: createdUrl,
    });
  } catch (error: any) {
    console.error("Shorten URL Controller Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const redirectUrlController = async (req: Request, res: Response) => {
  try {
    const { shortCode } = req.params;

    if (!shortCode) {
      return res.status(400).json({
        success: false,
        message: "Short code is required",
      });
    }

    const originalUrl = await redirectUrlService(shortCode as string);

    return res.redirect(originalUrl);
  } catch (error: any) {
    console.error("Redirect URL Controller Error:", error);

    return res.status(404).json({
      success: false,
      message: error.message || "URL not found",
    });
  }
};

export const getUsersUrlsController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const urls = await getUsersUrlsService(userId as string);

    return res.status(200).json({
      success: true,
      message: "User URLs fetched successfully",
      data: urls,
    });
  } catch (error: any) {
    console.error("Get Users URLs Controller Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const deleteUrlController = async (req: Request, res: Response) => {
  try {
    const { shortCode } = req.params;

    const userId = req.user;

    if (!shortCode) {
      return res.status(400).json({
        success: false,
        message: "Short code is required",
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const deletedUrl = await deleteUrlService(
      shortCode as string,
      userId._id as string,
    );

    if (!deletedUrl) {
      return res.status(404).json({
        success: false,
        message: "URL not found or unauthorized",
      });
    }

    return res.status(200).json({
      success: true,
      message: "URL deleted successfully",
      data: deletedUrl,
    });
  } catch (error: any) {
    console.error("Delete URL Controller Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
