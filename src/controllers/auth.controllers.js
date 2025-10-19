import { asyncHandler } from "../utils/AsyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { sendEmail } from "../utils/mail.js";
import { emailVerificationMailGenerator } from "../utils/mail.js";

const generateAccessRefreshTokens = async (userId) => {
  try {
    const existedUser = await User.findById(userId);
    const accessToken = existedUser.generateAccessToken();
    const refreshToken = existedUser.generateRefreshToken();
    existedUser.refreshToken = refreshToken;
    await existedUser.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "something went wrong");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, emailId, password } = req.body;

  const userExist = await User.findOne({
    $or: [{ username }, { emailId }],
  });

  if (userExist) {
    return res.status(409).json(new ApiError(400, "user already exists"));
  }

  const user = await User.create({
    emailId,
    password,
    username,
    isEmailVerified: false,
  });

  const { unHashedToken, hasedToken, tokenExpiry } =
    user.generateTemporaryToken();
  user.emailVerificationToken = hasedToken;
  user.emailVerificationTokenExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });

  await sendEmail({
    email: user.emailId,
    subject: "Verify your email",
    mailGenContent: emailVerificationMailGenerator(
      user.username,
      `${req.protocol}://${req.get("host")}/verify-email/${unHashedToken}`,
    ),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry",
  );

  if (!createdUser) {
    throw new ApiError(500, "something went wrong");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { user: createdUser },
        "user registered successfully and verification email has been sent",
      ),
    );
});

const login = asyncHandler(async (req, res) => {
  const { emailId, password } = req.body;

  if (!emailId || !password) {
    return res.status(400).json(new ApiError(400, "All fields are required"));
  }

  const user = await User.findOne({ emailId });

  if (!user) {
    return res.status(400).json(new ApiError(400, "User doesn't exist"));
  }

  const passwordCorrect = await user.isPasswordCorrect(password);

  if (!passwordCorrect) {
    return res.status(400).json(new ApiError(400, "Password incorrect"));
  }

  const { accessToken, refreshToken } = await generateAccessRefreshTokens(
    user._id,
  );

  const options = {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: false,
  };

  const sanitizedUser = user.toObject();
  delete sanitizedUser.password;
  delete sanitizedUser.refreshToken;

  return res
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: sanitizedUser, accessToken },
        "Successfully logged in",
      ),
    );
});

export { registerUser, login };
