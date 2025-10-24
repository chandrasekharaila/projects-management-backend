import mongoose from "mongoose";
import { Schema } from "mongoose";
import { AvailableUSerRole, UserRolesEnum } from "../utils/constants.js";

const projectMemberSchema = new Schema(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
  },
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: AvailableUSerRole,
      default: UserRolesEnum.MEMBER,
    },
  },
  { timestamps: true },
);

export const ProjectMember = mongoose.model(
  "ProjectMember",
  projectMemberSchema,
);
