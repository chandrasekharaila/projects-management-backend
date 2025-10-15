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
    return res.status(409).json(new ApiError(409, "user already exist"));
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

export { registerUser };
