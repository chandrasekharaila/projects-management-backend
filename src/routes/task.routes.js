import { Router } from "express";
import {
  verifyJWT,
  verifyProjectPermission,
} from "../middlewares/auth.middleware.js";
import {
  createTaskValidator,
  updateTaskValidator,
  createSubtaskValidator,
  updateSubtaskValidator,
} from "../validators/task.validator.js";
import { validate } from "../middlewares/validation.middlewares.js";
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  createSubtask,
  updateSubtask,
  deleteSubtask,
} from "../controllers/task.Controller.js";
import { UserRolesEnum } from "../utils/constants.js";

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
    updateTaskValidator(),
    validate,
    updateTask,
  );

router
  .route("/delete-task/:projectId/:taskId")
  .delete(
    verifyJWT,
    verifyProjectPermission([UserRolesEnum.PROJECT_ADMIN]),
    deleteTask,
  );

router
  .route("/create-subtask/:projectId/:taskId")
  .post(
    verifyJWT,
    verifyProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
    createSubtaskValidator(),
    validate,
    createSubtask,
  );

router
  .router("update-subtask/:projectId/:taskId/:subtaskId")
  .post(
    verifyJWT,
    verifyProjectPermission([UserRolesEnum.PROJECT_ADMIN, UserRolesEnum.ADMIN]),
    updateSubtaskValidator(),
    validate,
    updateSubtask,
  );

router
  .route("/delete-subtask/projectId/taskId/subtaskId")
  .delete(
    verifyJWT,
    verifyProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
    deleteSubtask,
  );
export default router;
