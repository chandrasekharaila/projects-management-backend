import { body } from "express-validator";

const createNotesValidator = () => {
  return [
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description is important to create notes"),
  ];
};

const updateNotesValidator = () => {
  return [
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description is important to create notes"),
  ];
};
export { createNotesValidator, updateNotesValidator };
