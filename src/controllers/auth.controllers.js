import { asyncHandler } from "../utils/AsyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { forgotPasswordMailGen, sendEmail } from "../utils/mail.js";
import { emailVerificationMailGenerator } from "../utils/mail.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";

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
      `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unHashedToken}`,
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

const logout = asyncHandler(async (req, res) => {
  const userID = req.user._id;

  const user = await User.findByIdAndUpdate(
    userID,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    },
  );

  const options = {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "productions",
  };

  res
    .status(200)
    .clearCookie(accessToken, options)
    .clearCookie(refreshToken, options)
    .json(new ApiResponse(200, {}, "logged out successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: req.user },
        "user details fetched successfully",
      ),
    );
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { verificationToken } = req.params;

  if (!verificationToken) {
    throw new ApiError(400, "email verification token is missing");
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationTokenExpiry: {
      $gt: Date.now(),
    },
  });

  if (!user) {
    throw new ApiError(400, "email verification token is expired");
  }

  user.emailVerificationToken = undefined;
  user.emailVerificationTokenExpiry = undefined;
  user.isEmailVerified = true;

  await user.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        isEmailVerified: true,
      },
      "Email verified successfully",
    ),
  );
});

const resendVerificationMail = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "user does not exist");
  }

  if (user.isEmailVerified) {
    throw new ApiError(400, "user already verified");
  }

  const { unHashedToken, hasedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.emailVerificationToken = hasedToken;
  user.emailVerificationTokenExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });

  await sendEmail({
    email: user.emailId,
    subject: "verify your email",
    mailGenContent: emailVerificationMailGenerator(
      user.username,
      `${req.protocol}://${req.host}/api/v1/auth/verify-email/${unHashedToken}`,
    ),
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Email verification mail sent"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  //get refreshtoken
  //if no rt error
  //decode rt to get id of user
  //gen at and rt
  //res at anf rt and set them in cookies

  const inputRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!inputRefreshToken) {
    throw new ApiError(401, "unauthorized access");
  }

  const decodedToken = jwt.verify(
    inputRefreshToken,
    process.env.REFRESH_TOKEN_SECRET,
  );

  const user = await User.findById(decodedToken._id);

  if (!user) {
    throw new ApiError("Invalid token");
  }

  if (user.refreshToken !== inputRefreshToken) {
    throw new ApiError("Unauthorized access");
  }

  const { accessToken, refreshToken } = await generateAccessRefreshTokens(
    user._id,
  );

  const options = {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, {
        accessToken,
        refreshToken,
      }),
      "successfully created the tokens",
    );
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { emailId } = req.body;

  const user = await User.findOne({ emailId }).select("-password");

  if (!user) {
    throw new ApiError("User not found");
  }

  const { unHashedToken, hasedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.forgotPasswordToken = hasedToken;
  user.forgotPasswordExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  const mailOptions = {
    email: user.emailId,
    subject: "Reset your password",
    mailGenContent: forgotPasswordMailGen(
      user.username,
      `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashedToken}`,
    ),
  };

  await sendEmail(mailOptions);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset mail has been sent "));
});

const resetPassword = asyncHandler(async (req, res) => {
  const { unHashedToken } = req.params;

  if (!unHashedToken) {
    throw new ApiError(400, "unauthorized access");
  }

  const { emailId, newPassword } = req.body;

  if (!newPassword) {
    throw new ApiError(400, "new password is required");
  }

  const hasedToken = crypto
    .createHash("sha256")
    .update(unHashedToken)
    .digest("hex");

  const user = await User.findOne({
    emailId,
    forgotPasswordToken: hasedToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Invalid Credentials");
  }

  user.password = newPassword;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200), {}, "password changed successfully");
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  console.log("received data", oldPassword, newPassword);
  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Incomplete input");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(400, "user not found");
  }

  console.log("recieved user", user.toObject());
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid Password");
  }

  user.password = newPassword;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password has been changed successfully"));
});

export {
  registerUser,
  login,
  logout,
  getCurrentUser,
  verifyEmail,
  resendVerificationMail,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
  changePassword,
};
