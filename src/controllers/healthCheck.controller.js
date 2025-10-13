import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
const healthCheck = asyncHandler((req, res) => {
  res.status(200).json(new ApiResponse(200, { message: "Server is running" }));
});

export { healthCheck };
