
import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createTest, getTest, publishTest } from "../controllers/test.controller.js";
import { ROLES } from "../utils/roles.js";

const router = Router();

const createSchema = z.object({
  body: z.object({
    title: z.string().min(3),
    level: z.enum(["O Level", "A Level"]),
    subject: z.enum(["Biology", "Physics", "Chemistry"]),
    chapterFilter: z.array(z.string()).optional(),
    durationMin: z.number().int().positive().optional(),
    size: z.number().int().min(1).max(200).optional()
  })
});

router.post("/", requireAuth, requireRole(ROLES.TEACHER, ROLES.ADMIN), validate(createSchema), createTest);
router.get("/:id", requireAuth, getTest);
router.patch("/:id/publish", requireAuth, requireRole(ROLES.TEACHER, ROLES.ADMIN), publishTest);

export default router;
