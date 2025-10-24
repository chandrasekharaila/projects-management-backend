import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectMembers.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import { UserRolesEnum } from "../utils/constants.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
const addProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const project = await Project.create({
    name,
    description,
    createdBy: req.user._id,
  });

  await ProjectMember.create({
    project: project._id,
    user: req.user._id,
    role: UserRolesEnum.ADMIN,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, project, "Project created successfully"));
});

export { addProject };
