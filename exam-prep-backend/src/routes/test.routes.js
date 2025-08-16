
import express from "express";
import * as testController from "../controllers/test.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { ROLES } from "../utils/roles.js";

const router = express.Router();

router.post("/", requireAuth, requireRole(ROLES.ADMIN, ROLES.TEACHER), testController.createTest);
router.get("/:id", requireAuth, testController.getTest);
router.patch("/:id/publish", requireAuth, requireRole(ROLES.ADMIN, ROLES.TEACHER), testController.publishTest);

export default router;
