import { Router } from "express";
import {
  createNotesValidator,
  updateNotesValidator,
} from "../validators/notes.validators.js";
import {
  createNotes,
  updateNotes,
  deleteNote,
} from "../controllers/notes.controller.js";
import {
  verifyJWT,
  verifyProjectPermission,
} from "../middlewares/auth.middleware.js";
import { UserRolesEnum } from "../utils/constants.js";
import { validate } from "../middlewares/validation.middlewares.js";
const router = Router();

router
  .route("/create-route")
  .post(
    verifyJWT,
    verifyProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
    createNotesValidator(),
    validate,
    createNotes,
  );

router
  .route("/delete-notes/:projectId/:noteId")
  .post(
    verifyJWT,
    verifyProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
    updateNotesValidator(),
    validate,
    updateNotes,
  );

router
  .route("/delete-note/:projectId/:noteId")
  .delete(
    verifyJWT,
    verifyProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
    deleteNote,
  );
export default router;
