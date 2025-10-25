import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectMembers.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import { UserRolesEnum } from "../utils/constants.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";

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

const getProjects = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const projects = await ProjectMember.aggregate([
    {
      $match: {
        user: userId,
      },
    },
    {
      $lookup: {
        from: "Project",
        localField: "project",
        foreignField: "_id",
        as: "projectDetails",
        pipeline: [
          {
            $lookup: {
              from: "ProjectMember",
              localField: "_id",
              foreignField: "project",
              as: "projectMembers",
            },
          },
          {
            $addFields: {
              members: {
                $size: "$projectMembers",
              },
            },
          },
        ],
      },
    },
    {
      $unwind: "$projectDetails",
    },
    {
      $project: {
        projectDetails: {
          _id: 1,
          name: 1,
          description: 1,
          members: 1,
          projectMembers: 0,
        },
        role: 1,
        user: 0,
        _id: 0,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, projects, "Fetched the projects successfully"));
});

const getProjectById = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  if (!projectId) {
    throw new ApiError(404, "project id is required");
  }

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(400, "Project not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project fetched successfully"));
});

export { addProject, getProjects, getProjectById };
