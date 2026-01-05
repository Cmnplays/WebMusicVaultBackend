import { Router } from "express";
import { getAboutDetails } from "../controllers/index.controller";
const router = Router();

router.get("/about", getAboutDetails);

export default router;
