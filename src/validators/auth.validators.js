import { body } from "express-validator";

const userRegisterValidator = (req, res, next) => {
  return [
    body("emailId")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Give the valid email"),
    body("username")
      .trim()
      .notEmpty()
      .withMessage("username should not be empty")
      .isLength({ min: 6, max: 15 })
      .withMessage(
        "The username should be of length minimum 6 characters and maximum 15 characters",
      )
      .isLowercase()
      .withMessage("username must be in lowercase"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("password should not be empty")
      .isLength({ min: 8 })
      .withMessage("Password should be of minimum 8 characters"),
  ];
};

const loginValidator = (req, res, next) => {
  return [
    body("emailId")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Give the valid email"),
    ,
    body("password")
      .trim()
      .notEmpty()
      .withMessage("password should not be empty")
      .isLength({ min: 8 })
      .withMessage("Password should be of minimum 8 characters"),
  ];
};

export { userRegisterValidator, loginValidator };
