import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { getCourses, upsertCourse } from "../controllers/course.controller.js";
import { ROLES } from "../utils/roles.js";

const router = Router();

router.get("/", getCourses);

const upsertSchema = z.object({
  body: z.object({
    level: z.enum(["O Level", "A Level"]),
    subjects: z.array(z.object({
      name: z.enum(["Biology", "Physics", "Chemistry"]),
      chapters: z.array(z.object({ title: z.string().min(1), order: z.number().optional() }))
    }))
  })
});

router.put("/", requireAuth, requireRole(ROLES.ADMIN, ROLES.TEACHER), validate(upsertSchema), upsertCourse);

export default router;
