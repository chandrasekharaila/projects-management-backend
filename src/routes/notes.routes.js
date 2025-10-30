import { Router } from "express";
import {
  createNotesValidator,
  updateNotesValidator,
} from "../validators/notes.validators.js";
import {
  createNotes,
  updateNotes,
  deleteNote,
  getNotes,
  getNotesById,
} from "../controllers/notes.controller.js";
import {
  verifyJWT,
  verifyProjectPermission,
} from "../middlewares/auth.middleware.js";
import { UserRolesEnum } from "../utils/constants.js";
import { validate } from "../middlewares/validation.middlewares.js";
const router = Router();

router
  .route("/:projectId")
  .get(
    verifyJWT,
    verifyProjectPermission([
      UserRolesEnum.PROJECT_ADMIN,
      UserRolesEnum.ADMIN,
      UserRolesEnum.MEMBER,
    ]),
    validate,
    getNotes,
  )
  .post(
    verifyJWT,
    verifyProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
    createNotesValidator(),
    validate,
    createNotes,
  );

router
  .route("/projectId/:noteId")
  .get(
    verifyJWT,
    verifyProjectPermission([
      UserRolesEnum.PROJECT_ADMIN,
      UserRolesEnum.ADMIN,
      UserRolesEnum.MEMBER,
    ]),
    validate,
    getNotesById,
  )
  .post(
    verifyJWT,
    verifyProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
    updateNotesValidator(),
    validate,
    updateNotes,
  )
  .delete(
    verifyJWT,
    verifyProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
    deleteNote,
  );

export default router;
