import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectMembers.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import { UserRolesEnum } from "../utils/constants.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
const redisClient = getRedisClient();

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
  const cacheKey = `userProjects:${userId}`;

  try {
    let cacheData = await redisClient.get(cacheKey);
    if (cacheData) {
      let projects = JSON.parse(cacheData);
      return res
        .status(200)
        .json(new ApiResponse(200, projects, "Fetched projects successfully"));
    }
  } catch (error) {
    console.error("redis client interaction failed", error);
  }

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

  if (!projects) {
    throw new ApiError(404, "Projects not found");
  }

  try {
    let cacheData = JSON.stringify(projects);
    await redisClient.set(cacheKey, cacheData, { EX: 3600 });
  } catch (error) {
    console.error("redis client interaction failed", error);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, projects, "Fetched the projects successfully"));
});

const getProjectById = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const casheKey = `project:${projectId}`;
  let project = null;

  try {
    let cashedProject = await redisClient.get(casheKey);
    if (cashedProject) {
      project = JSON.parse(cashedProject);

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            project,
            "project has been fetched successfully",
          ),
        );
    }
  } catch (error) {
    console.error("redis client interaction failed", error);
  }

  project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  try {
    let cashedProject = JSON.stringify(project);
    await redisClient.set(casheKey, cashedProject, { EX: 3600 });
  } catch (error) {
    console.error("redis client interaction failed", error);
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, project, "Project has been fetched successfully"),
    );
});

const updateProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  if (!projectId) {
    throw new ApiError(400, "Project Id is required");
  }

  const { name, description } = req.body;

  const project = await Project.findByIdAndUpdate(
    projectId,
    {
      name,
      description,
    },
    {
      new: true,
    },
  );

  if (!project) {
    throw new ApiError(400, "Failed to update the project");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project updated successfully"));
});

const deleteProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  if (!projectId) {
    throw new ApiError(400, "Project Id is required to delete the project");
  }

  const project = await Project.findByIdAndDelete(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, project, "Project has been deleted successfully"),
    );
});

const addProjectMember = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { emailId } = req.body;

  const newProjectMember = await User.findOne({ emailId });

  if (!newProjectMember) {
    throw new ApiError("New Project memeber is not registered user");
  }

  const projectMember = await ProjectMember.create({
    project: projectId,
    user: newProjectMember._id,
    role: UserRolesEnum.MEMBER,
  });

  if (!projectMember) {
    throw new ApiError("Failed to add a member");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        projectMember,
        "Successfully added a member to the project",
      ),
    );
});

const changeProjectMemberRole = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;
  const { newRole } = req.body;

  const projectMember = await ProjectMember.find({
    project: projectId,
    user: userId,
  });

  const updatedProjectMemberRole = await ProjectMember.findByIdAndUpdate(
    projectMember._id,
    {
      role: newRole,
    },
    {
      new: true,
    },
  );

  if (!updatedProjectMemberRole) {
    throw new ApiError(400, "Failed to update the role");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedProjectMemberRole,
        "Successfully updated the role",
      ),
    );
});

const removeProjectMember = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;

  const projectMember = await ProjectMember.findOne({
    project: projectId,
    user: userId,
  });

  if (!projectMember) {
    throw new ApiError(404, "Project member not found");
  }

  const deletedProjectMember = await ProjectMember.findByIdAndDelete(
    projectMember._id,
  );

  if (!deletedProjectMember) {
    throw new ApiError(404, "Failed to remove the user from project");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        deletedProjectMember,
        "Successfully removed the user from user",
      ),
    );
});

const getProjectMembers = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  if (!projectId) {
    throw new ApiError(404, "Project id is required");
  }

  const projectMembers = await ProjectMember.aggregate([
    {
      $match: {
        project: projectId,
      },
    },
    {
      $lookup: {
        from: "User",
        localField: "user",
        foreignField: "_id",
        as: "userDetails",
      },
    },
    {
      $unwind: "$userDetails",
    },
    {
      $project: {
        _id: 0,
        project: 1,
        user: 0,
        userDetails: 1,
        role: 1,
      },
    },
  ]);

  if (!projectMembers) {
    throw new ApiError(400, "No project members found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        projectMembers,
        "Fetched project members successfully",
      ),
    );
});
export {
  addProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addProjectMember,
  changeProjectMemberRole,
  removeProjectMember,
  getProjectMembers,
};
