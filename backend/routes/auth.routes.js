import { Router } from "express";
import { loginController, registerController, refreshTokenController, logoutController } from "../controllers/auth.controller.js";
import { multerImageUploadMiddleware } from "../middlewares/multer.middleware.js";


const router = Router();

router.post("/register", multerImageUploadMiddleware.fields([
    {
        name: "avatar",
        maxCount: 1
    },
]), registerController);
router.post("/login", loginController);
router.post("/refresh-token", refreshTokenController);
router.post("/logout", logoutController);

export default router;