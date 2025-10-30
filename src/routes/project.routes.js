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
  updateProject,
  deleteProject,
  addProjectMember,
  changeProjectMemberRole,
  getProjectMembers,
  removeProjectMember,
} from "../controllers/project.controllers.js";
import {
  addProjectValidator,
  projectUpdateValidator,
  addProjectMemberValidator,
} from "../validators/projects.validators.js";
import { AvailableUSerRole, UserRolesEnum } from "../utils/constants.js";
const router = Router();

router
  .route("/")
  .get(verifyJWT, getProjects)
  .post(verifyJWT, addProjectValidator(), validate, addProject);

router
  .route("/:projectId")
  .get(
    verifyJWT,
    verifyProjectPermission([
      UserRolesEnum.ADMIN,
      UserRolesEnum.PROJECT_ADMIN,
      UserRolesEnum.MEMBER,
    ]),
    getProjectById,
  )
  .patch(
    verifyJWT,
    verifyProjectPermission([UserRolesEnum.PROJECT_ADMIN, UserRolesEnum.ADMIN]),
    projectUpdateValidator(),
    validate,
    updateProject,
  )
  .delete(
    verifyJWT,
    verifyProjectPermission([UserRolesEnum.PROJECT_ADMIN, UserRolesEnum.ADMIN]),
    deleteProject,
  );

router
  .route("/:projectId/member")
  .get(verifyJWT, verifyProjectPermission(AvailableUSerRole), getProjectMembers)
  .post(
    verifyJWT,
    verifyProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
    addProjectMemberValidator(),
    validate,
    addProjectMember,
  );

router
  .route("/:projectId/members/:userId")
  .patch(
    verifyJWT,
    verifyProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
    changeProjectMemberRole,
  )
  .delete(
    verifyJWT,
    verifyProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
    removeProjectMember,
  );

export default router;
