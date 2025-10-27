import { body } from "express-validator";
import { asyncHandler } from "../utils/AsyncHandler";

const createTaskValidator = () => {
  return [
    body("title").trim().notEmpty().withMessage("Task Title is required"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description Title is required"),
    body("emailId")
      .trim()
      .notEmpty()
      .withMessage("EmailId is required")
      .isEmail()
      .withMessage("Not an email format"),
  ];
};

const updateTaskValidator = () => {
  return [
    body("title").trim().notEmpty().withMessage("Task Title is required"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description Title is required"),
    body("emailId")
      .trim()
      .notEmpty()
      .withMessage("EmailId is required")
      .isEmail()
      .withMessage("Not an email format"),
  ];
};

export { createTaskValidator, updateTaskValidator };
