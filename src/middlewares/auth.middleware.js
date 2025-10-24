import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/AsyncHandler.js ";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectMembers.model.js";
import mongoose, { Schema } from "mongoose";
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

const verifyProjectPermission = (roles = []) => {
  return asyncHandler(async (req, res, next) => {
    const projectId = req.params;
    if (!projectId) {
      throw new ApiError(400, "Project Id is required");
    }
    const project = await ProjectMember.findOne({
      project: projectId,
      user: req.user._id,
    });

    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    const projectRole = project?.role;
    if (!roles.includes(projectRole)) {
      throw new ApiError(400, "You are not allowed to access the project");
    }

    next();
  });
};

export { verifyJWT, verifyProjectPermission };
