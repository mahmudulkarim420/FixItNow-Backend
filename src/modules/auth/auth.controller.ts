import { Request, Response, NextFunction } from "express";
import { AuthServices } from "./auth.service";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";
import AppError from "../../utils/AppError";
import config from "../../config";

const getCookieOptions = () => {
  const isProduction =
    process.env.NODE_ENV === "production" ||
    config.nodeEnv === "production" ||
    Boolean(process.env.BACKEND_URL && !process.env.BACKEND_URL.includes("localhost"));

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? ("lax" as const) : ("lax" as const),
    path: "/",
  };
};

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.registerUser(req.body);

  sendResponse(res, {
    statusCode: 201,
    message: "User registered successfully!",
    data: result,
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.loginUser(req.body);
  const cookieOptions = getCookieOptions();

  res.cookie("accessToken", result.accessToken, cookieOptions);
  res.cookie("refreshToken", result.refreshToken, cookieOptions);

  sendResponse(res, {
    statusCode: 200,
    message: "User logged in successfully!",
    data: result.user,
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.getMe(req.user!.id);

  sendResponse(res, {
    statusCode: 200,
    message: "User profile retrieved successfully!",
    data: result,
  });
});

const logout = catchAsync(async (_req: Request, res: Response) => {
  const cookieOptions = getCookieOptions();

  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);

  sendResponse(res, {
    statusCode: 200,
    message: "User logged out successfully!",
    data: null,
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const token =
    req.cookies?.refreshToken ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : req.headers.authorization);

  if (!token) {
    throw new AppError(401, "Refresh token is missing!");
  }

  const result = await AuthServices.refreshToken(token);
  const cookieOptions = getCookieOptions();

  res.cookie("accessToken", result.accessToken, cookieOptions);
  res.cookie("refreshToken", result.refreshToken, cookieOptions);

  sendResponse(res, {
    statusCode: 200,
    message: "Access token refreshed successfully!",
    data: {
      refreshed: true,
    },
  });
});

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.updateProfile(req.user!.id, req.body);

  sendResponse(res, {
    statusCode: 200,
    message: "Profile updated successfully!",
    data: result,
  });
});

const deleteProfile = catchAsync(async (req: Request, res: Response) => {
  await AuthServices.deleteProfile(req.user!.id);
  const cookieOptions = getCookieOptions();

  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);

  sendResponse(res, {
    statusCode: 200,
    message: "User account deleted successfully!",
    data: null,
  });
});

export const AuthControllers = {
  registerUser,
  loginUser,
  getMe,
  logout,
  refreshToken,
  updateProfile,
  deleteProfile,
};
