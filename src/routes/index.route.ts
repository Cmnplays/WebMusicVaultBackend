import { Router } from "express";
import { getAboutDetails } from "../controllers/index.controller";
const router = Router();

router.route("/about").get(getAboutDetails);
export default router;
