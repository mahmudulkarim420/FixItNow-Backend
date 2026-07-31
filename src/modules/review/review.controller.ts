import { Request, Response } from "express";
import { ReviewServices } from "./review.service";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";

const createReview = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewServices.createReview(req.user!.id, req.body);

  sendResponse(res, {
    statusCode: 201,
    message: "Review created successfully!",
    data: result,
  });
});

const getMyReviews = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewServices.getMyReviews(req.user!.id, req.user!.role);

  sendResponse(res, {
    statusCode: 200,
    message: "Reviews retrieved successfully!",
    data: result,
  });
});

const getTopReviews = catchAsync(async (req: Request, res: Response) => {
  const limit = req.query.limit ? Number(req.query.limit) : 6;
  const result = await ReviewServices.getTopReviews(limit);

  sendResponse(res, {
    statusCode: 200,
    message: "Top reviews retrieved successfully!",
    data: result,
  });
});

export const ReviewControllers = {
  createReview,
  getMyReviews,
  getTopReviews,
};

