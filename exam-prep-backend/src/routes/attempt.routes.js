import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { startAttempt, submitAttempt, analyticsForUser } from "../controllers/attempt.controller.js";

const router = Router();

router.post(
  "/start",
  requireAuth,
  validate(z.object({ body: z.object({ testId: z.string(), startedAt: z.string().datetime().optional() }) })),
  startAttempt
);

router.post(
  "/submit",
  requireAuth,
  validate(z.object({
    body: z.object({
      attemptId: z.string(),
      responses: z.array(z.object({ questionId: z.string(), selected: z.string() })).min(1),
      completedAt: z.string().datetime().optional(),
      timeTakenSec: z.number().int().optional()
    })
  })),
  submitAttempt
);

router.get("/me/analytics", requireAuth, analyticsForUser);

export default router;
