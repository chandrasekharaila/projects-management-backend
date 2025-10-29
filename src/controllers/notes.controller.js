import { Note } from "../models/notes.models";
import { Project } from "../models/project.models";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import { asyncHandler } from "../utils/AsyncHandler";

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

export { createNotes, updateNotes, deleteNote };
