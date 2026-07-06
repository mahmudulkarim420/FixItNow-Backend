import { Request, Response } from "express";
import { PaymentServices } from "./payment.service";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";

const createPaymentIntent = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentServices.createPaymentIntent(
    req.body.bookingId,
    req.user!.id as string
  );

  sendResponse(res, {
    statusCode: 200,
    message: "Payment intent created successfully!",
    data: result,
  });
});

const confirmPayment = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentServices.confirmPayment(req.body, req.user!.id as string);

  sendResponse(res, {
    statusCode: 200,
    message: "Payment confirmed successfully!",
    data: result,
  });
});

const getUserPaymentHistory = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentServices.getUserPaymentHistory(
    req.user!.id as string,
    req.user!.role as string
  );

  sendResponse(res, {
    statusCode: 200,
    message: "Payment history retrieved successfully!",
    data: result,
  });
});

const getPaymentById = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentServices.getPaymentById(
    req.params.id as string,
    req.user!.id as string,
    req.user!.role as string
  );

  sendResponse(res, {
    statusCode: 200,
    message: "Payment details retrieved successfully!",
    data: result,
  });
});

export const PaymentControllers = {
  createPaymentIntent,
  confirmPayment,
  getUserPaymentHistory,
  getPaymentById,
};
