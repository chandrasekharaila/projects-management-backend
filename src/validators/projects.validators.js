import { body } from "express-validator";

const addProjectValidator = () => {
  return [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Project name should not be empty"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Project name should not be empty"),
  ];
};

const projectUpdateValidator = () => {
  return [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Project name should not be empty"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Project name should not be empty"),
  ];
};

const addProjectMemberValidator = () => {
  return [
    body("emailId")
      .trim()
      .notEmpty()
      .withMessage("Project name should not be empty"),
  ];
};

export {
  addProjectValidator,
  projectUpdateValidator,
  addProjectMemberValidator,
};
