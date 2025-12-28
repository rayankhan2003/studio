
import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { ROLES } from "../utils/roles.js";
import * as sectionController from "../controllers/section.controller.js";

const router = Router();

router.use(requireAuth, requireRole(ROLES.INSTITUTION_ADMIN, ROLES.TEACHER));

router.post("/", requireRole(ROLES.INSTITUTION_ADMIN), sectionController.createSection);
router.get("/", sectionController.listSections);
router.put("/:id", requireRole(ROLES.INSTITUTION_ADMIN), sectionController.updateSection);
router.delete("/:id", requireRole(ROLES.INSTITUTION_ADMIN), sectionController.deleteSection);

export default router;
