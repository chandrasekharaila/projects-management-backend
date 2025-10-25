import { Router } from "express";
import { validate } from "../middlewares/validation.middlewares.js";
import {
  verifyJWT,
  verifyProjectPermission,
} from "../middlewares/auth.middleware.js";
import {
  addProject,
  getProjects,
  getProjectById,
} from "../controllers/project.controllers.js";
import { addProjectValidator } from "../validators/projects.validators.js";
import { UserRolesEnum } from "../utils/constants.js";
const router = Router();

router
  .route("/add-project")
  .post(verifyJWT, addProjectValidator(), validate, addProject);

router
  .route("/get-projects")
  .get(
    verifyJWT,
    verifyProjectPermission([
      UserRolesEnum.PROJECT_ADMIN,
      UserRolesEnum.MEMBER,
      UserRolesEnum.ADMIN,
    ]),
    getProjects,
  );
router
  .route("/get-project/:projectId")
  .get(
    verifyJWT,
    verifyProjectPermission([
      UserRolesEnum.PROJECT_ADMIN,
      UserRolesEnum.MEMBER,
      UserRolesEnum.ADMIN,
    ]),
    getProjectById,
  );
export default router;
