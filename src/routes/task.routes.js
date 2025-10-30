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
} from "../controllers/task.controller.js";
import { UserRolesEnum } from "../utils/constants.js";

const router = Router();

router
  .route("/:projectId")
  .get(
    verifyJWT,
    verifyProjectPermission([
      UserRolesEnum.ADMIN,
      UserRolesEnum.PROJECT_ADMIN,
      UserRolesEnum.MEMBER,
    ]),
    getTasks,
  )
  .post(
    verifyJWT,
    verifyProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
    createTaskValidator(),
    validate,
    createTask,
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
  )
  .put(
    verifyJWT,
    verifyProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
    updateTaskValidator(),
    validate,
    updateTask,
  )
  .delete(
    verifyJWT,
    verifyProjectPermission([UserRolesEnum.PROJECT_ADMIN]),
    deleteTask,
  );

router
  .route("/:projectId/:taskId/subtasks")
  .post(
    verifyJWT,
    verifyProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
    createSubtaskValidator(),
    validate,
    createSubtask,
  );

router
  .router(":projectId/:taskId/substasks/:subtaskId")
  .patch(
    verifyJWT,
    verifyProjectPermission([UserRolesEnum.PROJECT_ADMIN, UserRolesEnum.ADMIN]),
    updateSubtaskValidator(),
    validate,
    updateSubtask,
  )
  .delete(
    verifyJWT,
    verifyProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
    deleteSubtask,
  );

export default router;
