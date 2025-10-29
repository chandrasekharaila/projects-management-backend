import { body } from "express-validator";
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

const createSubtaskValidator = () => {
  return [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Subtask title should not be empty"),
  ];
};

const updateSubtaskValidator = () => {
  return [
    body("title").trim().notEmpty().withMessage("title should not be empty"),
    body("isCompleted")
      .trim()
      .isBoolean()
      .withMessage("isCompleted value should be boolean "),
  ];
};
export {
  createTaskValidator,
  updateTaskValidator,
  createSubtaskValidator,
  updateSubtaskValidator,
};
