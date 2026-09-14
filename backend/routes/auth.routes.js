import { Router } from "express" ; 
import { loginController , registerController , refreshTokenController, logoutController } from "../controllers/auth.controller.js";


const router = Router();

router.post("/login", loginController);



router.post("/register", registerController);


router.post("/refresh-token", refreshTokenController);
router.post("/logout", logoutController);

export default router;