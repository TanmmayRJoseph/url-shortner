import { Router } from "express";
import { registerController, loginController, logoutController, refreshAccessTokenController, profileController } from "./auth.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

router.post("/register", registerController)
router.post("/login", loginController)
router.post("/refresh-access-token", authMiddleware,refreshAccessTokenController)
router.post("/logout", authMiddleware,logoutController)
router.get("/profile",authMiddleware, profileController)


export default router;