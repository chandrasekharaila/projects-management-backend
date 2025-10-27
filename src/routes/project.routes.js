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
} from "../controllers/project.controllers.js";
import {
  addProjectValidator,
  projectUpdateValidator,
  addProjectMemberValidator,
} from "../validators/projects.validators.js";
import { AvailableUSerRole, UserRolesEnum } from "../utils/constants.js";
const router = Router();

router
  .route("/add-project")
  .post(verifyJWT, addProjectValidator(), validate, addProject);

router.route("/get-projects").get(verifyJWT, getProjects);
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

router
  .route("/update-project/:projectId")
  .put(
    verifyJWT,
    verifyProjectPermission(UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN),
    projectUpdateValidator(),
    validate,
    updateProject,
  );

router
  .route("/delete-project/:projectId")
  .delete(
    verifyJWT,
    verifyProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
    deleteProject,
  );

router
  .route("/add-project-member/:projectId")
  .post(
    verifyJWT,
    verifyProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
    addProjectMemberValidator(),
    validate,
    addProjectMember,
  );

router
  .route("/change-role/:projectId/:userId")
  .put(
    verifyJWT,
    verifyProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
    changeProjectMemberRole,
  );

router
  .route("/delete-member/:projectId/:userId")
  .delete(
    verifyJWT,
    verifyProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
    deleteProject,
  );

router
  .route("/get-project-members/:projectId")
  .get(
    verifyJWT,
    verifyProjectPermission(AvailableUSerRole),
    getProjectMembers,
  );
export default router;
