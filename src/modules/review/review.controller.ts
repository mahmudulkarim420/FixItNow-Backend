import { Request, Response, NextFunction } from "express";
import { ReviewServices } from "./review.service";

const createReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await ReviewServices.createReview(
      req.user!.id as string,
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Review created successfully!",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

export const ReviewControllers = {
  createReview,
};
