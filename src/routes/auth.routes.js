import { Router } from "express";
import { registerUser } from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validation.middlewares.js";
import { userRegisterValidator } from "../validators/auth.validators.js";
import {
  login,
  logout,
  getCurrentUser,
  verifyEmail,
  resendVerificationMail,
} from "../controllers/auth.controllers.js";
import { loginValidator } from "../validators/auth.validators.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(userRegisterValidator(), validate, registerUser);
router.route("/login").post(loginValidator(), validate, login);
router.route("/logout").post(verifyJWT, logout);
router.route("/get-user").get(verifyJWT, getCurrentUser);
router.route("/verify-email/:verificationToken").get(verifyEmail);
router
  .route("/resend-email-verification")
  .get(verifyJWT, resendVerificationMail);

export default router;
