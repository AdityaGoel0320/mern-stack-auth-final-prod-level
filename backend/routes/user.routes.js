import { Router } from "express" ; 
import { multerImageUploadMiddleware } from "../middlewares/multer.middleware.js";
const router = Router();

import { getProfileController , updateAvatarController } from "../controllers/user.controller.js";

router.get("/getProfile", getProfileController);
router.put("/updateAvatar", multerImageUploadMiddleware.fields([
    {
        name: "avatar",
        maxCount: 1
    },
]), updateAvatarController);    



export default router;