import { Router } from "express";
import {shortenUrlController,redirectUrlController,getUsersUrlsController,deleteUrlController,} from "./url.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

router.post("/shorten", authMiddleware, shortenUrlController);

router.get("/my-urls", authMiddleware, getUsersUrlsController);

router.delete("/delete/:shortCode", authMiddleware, deleteUrlController);

router.get("/redirect/:shortCode", redirectUrlController);

export default router;
