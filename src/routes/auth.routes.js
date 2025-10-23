import { Router } from "express";
import {
  changePassword,
  forgotPassword,
  registerUser,
  resetPassword,
} from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validation.middlewares.js";
import {
  changePasswordValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  userRegisterValidator,
} from "../validators/auth.validators.js";
import {
  login,
  logout,
  getCurrentUser,
  verifyEmail,
  resendVerificationMail,
  refreshAccessToken,
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
router.route("/refresh-token").post(verifyJWT, refreshAccessToken);
router
  .route("/forgot-password")
  .post(forgotPasswordValidator(), validate, forgotPassword);
router
  .route("/reset-password/:unHashedToken")
  .post(resetPasswordValidator(), validate, resetPassword);
router
  .route("/change-password")
  .post(verifyJWT, changePasswordValidator(), validate, changePassword);
export default router;
