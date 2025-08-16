
import express from "express";
import * as questionController from "../controllers/question.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { ROLES } from "../utils/roles.js";

const router = express.Router();

router.post("/", requireAuth, requireRole(ROLES.ADMIN, ROLES.TEACHER), questionController.createQuestion);
router.get("/", questionController.listQuestions);
router.put("/:id", requireAuth, requireRole(ROLES.ADMIN, ROLES.TEACHER), questionController.updateQuestion);
router.delete("/:id", requireAuth, requireRole(ROLES.ADMIN, ROLES.TEACHER), questionController.deleteQuestion);

export default router;
