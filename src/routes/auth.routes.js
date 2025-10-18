import { Router } from "express";
import { registerUser } from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validation.middlewares.js";
import { userRegisterValidator } from "../validators/auth.validators.js";
import { login } from "../controllers/auth.controllers.js";
import { loginValidator } from "../validators/auth.validators.js";
const router = Router();

router.route("/register").post(userRegisterValidator(), validate, registerUser);
router.route("/login").post(loginValidator(), validate, login);

export default router;
