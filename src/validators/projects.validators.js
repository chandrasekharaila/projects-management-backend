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

export { addProjectValidator };
