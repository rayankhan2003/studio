
import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { ROLES } from "../utils/roles.js";
import * as sectionController from "../controllers/section.controller.js";

const router = Router();

router.use(requireAuth, requireRole(ROLES.INSTITUTION_ADMIN, ROLES.TEACHER));

router.post("/", sectionController.createSection);
router.get("/", sectionController.listSections);
router.put("/:id", sectionController.updateSection);
router.delete("/:id", sectionController.deleteSection);

export default router;
