import { Request, Response, NextFunction } from "express";
import { PaymentServices } from "./payment.service";
import sendResponse from "../../utils/sendResponse";

const createPaymentIntent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await PaymentServices.createPaymentIntent(
      req.body.bookingId,
      req.user!.id as string
    );

    sendResponse(res, {
      statusCode: 200,
      message: "Payment intent created successfully!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const confirmPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await PaymentServices.confirmPayment(req.body, req.user!.id as string);

    sendResponse(res, {
      statusCode: 200,
      message: "Payment confirmed successfully!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getUserPaymentHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await PaymentServices.getUserPaymentHistory(
      req.user!.id as string,
      req.user!.role as string
    );

    sendResponse(res, {
      statusCode: 200,
      message: "Payment history retrieved successfully!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getPaymentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
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
  } catch (error) {
    next(error);
  }
};

export const PaymentControllers = {
  createPaymentIntent,
  confirmPayment,
  getUserPaymentHistory,
  getPaymentById,
};
