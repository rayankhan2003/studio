
import express from "express";
import { getCourses, upsertCourse } from "../controllers/course.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { ROLES } from "../utils/roles.js";

const router = express.Router();

router.get("/", getCourses);
router.post("/", requireAuth, requireRole(ROLES.ADMIN, ROLES.TEACHER), upsertCourse);

export default router;
