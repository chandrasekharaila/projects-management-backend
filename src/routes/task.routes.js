import { Router } from "express";
import {
  verifyJWT,
  verifyProjectPermission,
} from "../middlewares/auth.middleware";
import {
  createTaskValidator,
  updateTaskValidator,
} from "../validators/task.validator";
import { validate } from "../middlewares/validation.middlewares";
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
} from "../controllers/task.Controller";
import { UserRolesEnum } from "../utils/constants";

const router = Router();
router
  .route("/create-task/:projectId")
  .post(
    verifyJWT,
    verifyProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
    createTaskValidator(),
    validate,
    createTask,
  );

router
  .route("/get-tasks/:projectId")
  .get(
    verifyJWT,
    verifyProjectPermission([
      UserRolesEnum.ADMIN,
      UserRolesEnum.PROJECT_ADMIN,
      UserRolesEnum.MEMBER,
    ]),
    getTasks,
  );

router
  .route("/:projectId/:taskId")
  .get(
    verifyJWT,
    verifyProjectPermission([
      UserRolesEnum.ADMIN,
      UserRolesEnum.MEMBER,
      UserRolesEnum.PROJECT_ADMIN,
    ]),
    getTaskById,
  );

router
  .route("/update-task/:projectId/:taskId")
  .put(
    verifyJWT,
    verifyProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
    validate,
    updateTask,
  );
export default router;
