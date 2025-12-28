
import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { ROLES } from "../utils/roles.js";
import * as institutionController from "../controllers/institution.controller.js";

const router = Router();

// Super admin routes
router.post("/", requireAuth, requireRole(ROLES.ADMIN), institutionController.createInstitution);
router.get("/", requireAuth, requireRole(ROLES.ADMIN), institutionController.listInstitutions);

// Institution admin routes
router.get("/my-dashboard", requireAuth, requireRole(ROLES.INSTITUTION_ADMIN), institutionController.getDashboard);

export default router;
