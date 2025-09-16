
import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { ROLES } from "../utils/roles.js";
import * as teacherController from "../controllers/teacher.controller.js";

const router = Router();

// Routes for institution admin to manage teachers
router.post("/", requireAuth, requireRole(ROLES.INSTITUTION_ADMIN), teacherController.addTeacher);
router.get("/", requireAuth, requireRole(ROLES.INSTITUTION_ADMIN), teacherController.listTeachers);
router.delete("/:id", requireAuth, requireRole(ROLES.INSTITUTION_ADMIN), teacherController.removeTeacher);

// Routes for teachers themselves
router.get("/dashboard", requireAuth, requireRole(ROLES.TEACHER), teacherController.getTeacherDashboard);

export default router;
