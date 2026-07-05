import { Request, Response, NextFunction } from 'express';
import { AuthServices } from './auth.service';

const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AuthServices.registerUser(req.body);

    res.status(201).json({
      success: true,
      message: 'User registered successfully!',
      data: result,
    });
  } catch (error: any) {
    next(error); // গ্লোবাল এরর হ্যান্ডলারে চলে যাবে
  }
};

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AuthServices.loginUser(req.body);

    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(200).json({
      success: true,
      message: 'User logged in successfully!',
      data: result.user,
    });
  } catch (error: any) {
    next(error);
  }
};
const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AuthServices.getMe(req.user!.id as string);

    res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully!',
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

export const AuthControllers = {
  registerUser,
  loginUser,
  getMe,
};