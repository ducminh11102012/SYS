import { Router } from "express";
import multer from "multer";
import { ExamController } from "../controllers/exam.controller";

const router = Router();
const upload = multer();
const controller = new ExamController();

router.post("/upload", upload.single("file"), (req, res) => controller.uploadExam(req, res));
router.get("/", (req, res) => controller.listExams(req, res));
router.get("/:examId", (req, res) => controller.getExam(req, res));
router.post("/submit", (req, res) => controller.submitExam(req, res));
router.get("/grades/:submissionId", (req, res) => controller.getGrade(req, res));

export default router;
