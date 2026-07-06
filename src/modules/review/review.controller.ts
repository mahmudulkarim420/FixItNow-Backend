import { Request, Response, NextFunction } from "express";
import { ReviewServices } from "./review.service";
import sendResponse from "../../utils/sendResponse";

const createReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await ReviewServices.createReview(req.user!.id as string, req.body);

    sendResponse(res, {
      statusCode: 201,
      message: "Review created successfully!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const ReviewControllers = {
  createReview,
};
