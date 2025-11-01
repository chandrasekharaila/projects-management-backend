import { getRedisClient } from "../db/redisClient";
import { Note } from "../models/notes.models";
import { Project } from "../models/project.models";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import { asyncHandler } from "../utils/AsyncHandler";
const redisClient = getRedisClient();

const createNotes = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { description } = req.body;

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const note = await Note.create({
    description,
    project: projectId,
    createdBy: req.user._id,
  });

  if (!note) {
    throw new ApiError(404, "Failed to create the note");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, note, "Created the note successfully"));
});

const updateNotes = asyncHandler(async (req, res) => {
  const { notesId, projectId } = req.params;
  const { description } = req.body;

  const note = await Note.findOneAndUpdate(
    {
      _id: notesId,
      project: projectId,
      createdBy: req.user._id,
    },
    {
      $set: {
        description,
      },
    },
    {
      new: true,
    },
  );
  if (!note) {
    throw new ApiError(404, "Note not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, note, "Updated the note successfully"));
});

const deleteNote = asyncHandler(async (req, res) => {
  const { noteId, projectId } = req.params;

  const note = await Note.findOneAndDelete({
    _id: noteId,
    project: projectId,
    createdBy: req.user._id,
  });

  if (!note) {
    throw new ApiError(400, "Failed to delete the note");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, note, "Project note has been deleted successfully"),
    );
});

const getNotesById = asyncHandler(async (req, res) => {
  const { noteId } = req.params;

  const casheKey = `note:${noteId}`;

  try {
    const cacheData = await redisClient.get(casheKey);

    if (cacheData) {
      const note = JSON.parse(cacheData);
      return res
        .status(200)
        .json(new ApiResponse(200, note, "Note fetched successfully"));
    }
  } catch (error) {
    console.error("redis client interaction failed", error);
  }

  const note = await Note.findById(noteId);
  if (!note) {
    throw new ApiError(404, "Project note not found");
  }

  try {
    const cacheData = JSON.stringify(note);
    await redisClient.set(casheKey, cacheData, { EX: 3600 });
  } catch (error) {
    console.error("redis client interaction failed", error);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, note, "fetched project note successfully"));
});

const getNotes = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const notes = await Note.find({
    project: projectId,
  });

  if (!notes) {
    throw new ApiError(404, "Project notes not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, notes, "notes fetched successfully"));
});
export { createNotes, updateNotes, deleteNote, getNotesById, getNotes };
