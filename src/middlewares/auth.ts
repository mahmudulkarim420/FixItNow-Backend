import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const auth = (...requiredRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies.accessToken;

      if (!token) {
        throw new Error('You are not authorized! Token missing.');
      }

      // ২. টোকেন ভেরিফাই করা
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

      // ৩. রোল বেইজড অথরাইজেশন চেক (যদি নির্দিষ্ট রোল রিকোয়ার্ড থাকে)
      if (requiredRoles.length && !requiredRoles.includes(decoded.role)) {
        throw new Error('You have no permission to access this route!');
      }

      // ৪. রিকোয়েস্ট অবজেক্টে ইউজার ডেটা পাস করে দেওয়া (যেন পরে কন্ট্রোলারে ইউজ করা যায়)
      req.user = decoded as JwtPayload;
      
      next();
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message || 'Unauthorized access!',
        errorDetails: error,
      });
    }
  };
};