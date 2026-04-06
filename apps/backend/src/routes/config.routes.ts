import { Router } from "express";
import { ConfigController } from "../controllers/config.controller";

const router = Router();
const controller = new ConfigController();

router.get("/", (req, res) => controller.getConfig(req, res));
router.post("/", (req, res) => controller.setConfig(req, res));

export default router;
