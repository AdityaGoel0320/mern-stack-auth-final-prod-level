import { Router } from "express" ; 
const router = Router();

import { getProfileController } from "../controllers/user.controller.js";

router.get("/getProfile", getProfileController);




export default router;