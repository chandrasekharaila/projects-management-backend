import { Router } from "express";
import { validate } from "../middlewares/validation.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addProject } from "../controllers/project.controllers.js";
import { addProjectValidator } from "../validators/projects.validators.js";
const router = Router();

router
  .route("/add-project")
  .post(verifyJWT, addProjectValidator(), validate, addProject);
export default router;
