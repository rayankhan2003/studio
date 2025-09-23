
import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import * as testController from "../controllers/test.controller.js";
import { ROLES } from "../utils/roles.js";

const router = Router();

// Validation schema for test creation
const createSchema = z.object({
  body: z.object({
    title: z.string().min(3),
    level: z.enum(["O Level", "A Level", "MDCAT"]),
    subject: z.string(),
    chapterFilter: z.array(z.string()).optional(),
    difficulty: z.array(z.enum(["easy", "medium", "hard"])).optional(),
    questionCount: z.number().int().min(1).max(200),
    durationMin: z.number().int().positive(),
    section: z.string().optional(), // Section ID to assign the test to
  })
});

// Middleware to protect teacher/admin routes
const requireTeacherOrAdmin = [requireAuth, requireRole(ROLES.TEACHER, ROLES.ADMIN)];

// Routes for teachers/admins
router.post("/", ...requireTeacherOrAdmin, validate(createSchema), testController.createTest);
router.get("/teacher", ...requireTeacherOrAdmin, testController.getTestsForTeacher);
router.patch("/:id/publish", ...requireTeacherOrAdmin, testController.publishTest);
router.put("/:id", ...requireTeacherOrAdmin, testController.updateTest);
router.delete("/:id", ...requireTeacherOrAdmin, testController.deleteTest);
router.get("/:id/preview", ...requireTeacherOrAdmin, testController.getTestForPreview);


// Routes for students
router.get("/student", requireAuth, requireRole(ROLES.STUDENT), testController.getTestsForStudent);
router.get("/:id", requireAuth, testController.getTest); // Student can get a specific test to attempt

export default router;
