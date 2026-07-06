import { Request, Response, NextFunction } from "express";
import { AuthServices } from "./auth.service";
import sendResponse from "../../utils/sendResponse";
import config from "../../config";

const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AuthServices.registerUser(req.body);

    sendResponse(res, {
      statusCode: 201,
      message: "User registered successfully!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AuthServices.loginUser(req.body);

    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: config.nodeEnv === "production",
      sameSite: "strict",
    });

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: config.nodeEnv === "production",
      sameSite: "strict",
    });

    sendResponse(res, {
      statusCode: 200,
      message: "User logged in successfully!",
      data: result.user,
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AuthServices.getMe(req.user!.id as string);

    sendResponse(res, {
      statusCode: 200,
      message: "User profile retrieved successfully!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const AuthControllers = {
  registerUser,
  loginUser,
  getMe,
};
