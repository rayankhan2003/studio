
import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { checkExpirations } from "../controllers/subscription.controller.js";
import { ROLES } from "../utils/roles.js";

const router = Router();

// This is a protected route for an admin to manually trigger an expiration check.
// In a real production app, this endpoint would be called by a scheduled job (cron job).
router.post(
  "/check-expirations",
  requireAuth,
  requireRole(ROLES.ADMIN),
  checkExpirations
);

export default router;
