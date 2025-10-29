import mongoose, { Mongoose } from "mongoose";
import { Project } from "../models/project.models.js";
import { Task } from "../models/task.model.js";
import { User } from "../models/user.models.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { TaskStatusEnum } from "../utils/constants.js";
import { Subtask } from "../models/subTasks.models.js";

const createTask = asyncHandler(async (req, res) => {
  const { title, description, emailId } = req.body;
  const { projectId } = req.params;

  if (!title || !description || !emailId) {
    throw new ApiError(400, "All fields are required");
  }

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(400, "Project not found");
  }

  const user = await User.findOne({ emailId });

  if (!user) {
    throw new ApiError(400, "Assigned user not found");
  }

  const files = req.files || [];

  const attachments = files.map((file) => {
    return {
      url: `${process.env.SERVER_URL}/images/${file.filename}`,
      mimetype: file.mimetype,
      size: file.size,
    };
  });

  const task = await Task.create({
    title,
    description,
    assignedTo: user._id,
    assignedBy: req.user._id,
    project: projectId,
    status: TaskStatusEnum.TODO,
    attachments,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, task, "Task has been created successfully"));
});

const getTasks = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  if (!projectId) {
    throw new ApiError(400, "project id is required");
  }

  const tasks = await Task.aggregate([
    {
      $match: {
        project: projectId,
      },
    },
    {
      $lookup: {
        from: "Subtask",
        localField: "_id",
        foreignField: "Task",
        as: "subtasks",
      },
    },
    {
      $project: {
        _id: 1,
        title: 1,
        description: 1,
        project: 1,
        subtasks: 1,
      },
    },
  ]);

  if (tasks.length === 0) {
    throw new ApiError(404, "No tasks found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tasks, "Successfully fetched the tasks"));
});

const getTaskById = asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;

  const task = await Task.findOne({
    _id: taskId,
    project: projectId,

    $or: [{ assignedBy: req.user._id }, { assignedTo: req.user._id }],
  });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, task, "Fetched the task details"));
});

const updateTask = asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;
  const { title, description, emailId } = req.body;

  const user = await User.findOne({
    emailId,
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const task = await Task.findOneAndUpdate(
    { _id: taskId, project: projectId, assignedBy: req.user._id },
    {
      $set: {
        title,
        description,
        assignedTo: user._id,
      },
    },
    { new: true },
  );

  if (!task) {
    throw new ApiError(400, "Failed to update the task");
  }

  return res.status(200).json(new ApiResponse(200, task, "Task updated"));
});

const deleteTask = asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;

  const task = await Task.findOneAndDelete({
    project: projectId,
    task: taskId,
    assignedBy: req.user._id,
  });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  return res
    .status(200)
    .json(new ApiResponse("Task has been deleted successfully!"));
});

const createSubtask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { title } = req.body;

  const task = await Task.findById(taskId);

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  const subtask = await Subtask.create({
    title,
    task: task._id,
    createdBy: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, subtask, "Subtask created successfuly"));
});

const updateSubtask = asyncHandler(async (req, res) => {
  const { taskId, subtaskId } = req.params;
  const { title, isCompleted } = req.body;

  const subtask = await Subtask.findOneAndUpdate(
    {
      _id: subtaskId,
      task: taskId,
      createdBy: req.user._id,
    },
    {
      $set: {
        title,
        isCompleted,
      },
    },
    {
      new: true,
    },
  );

  if (!subtask) {
    throw new ApiError(404, "subtask not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, subtask, "Updated subtask successfully"));
});

const deleteSubtask = asyncHandler(async (req, res) => {
  const { subtaskId, taskId } = req.params;

  const subtask = await findOneAndDelete({
    _id: subtaskId,
    task: taskId,
    createdBy: req.user._id,
  });

  if (!subtask) {
    throw new ApiError(404, "subtask not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, subtask, "Subtask deleted successfully"));
});
export {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  createSubtask,
  updateSubtask,
  deleteSubtask,
};
