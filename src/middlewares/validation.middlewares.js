import { validationResult } from "express-validator";
import ApiError from "../utils/ApiError.js";

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const errorsArray = errors.array().map((err) => {
    return {
      msg: err.msg,
      param: err.param,
    };
  });

  return res
    .status(400)
    .json(new ApiError(400, "something went wrong", errorsArray));
};

export { validate };
