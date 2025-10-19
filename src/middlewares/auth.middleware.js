import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/AsyncHandler.js ";
const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(400, "no token unauthorized access");
    }

    const decodedJWT = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedJWT._id).select("-password");

    if (!user) {
      throw new ApiError(400, "unauthorized access");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(400, "no try unauthorized access");
  }
});

export { verifyJWT };
