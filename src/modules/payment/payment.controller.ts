import { Request, Response } from "express";
import type Stripe from "stripe";
import { PaymentServices } from "./payment.service";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";
import config from "../../config";
import AppError from "../../utils/AppError";
import stripe from "../../lib/stripe";

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

const stripeWebhook = catchAsync(async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"] as string;
  const endpointSecret = config.stripe.webhookSecret as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body as Buffer,
      signature,
      endpointSecret
    );
  } catch (err) {
    throw new AppError(400, `Webhook signature verification failed: ${(err as Error).message}`);
  }

  await PaymentServices.handleStripeEvent(event);

  sendResponse(res, {
    statusCode: 200,
    message: "Webhook received successfully!",
    data: null,
  });
});

export const PaymentControllers = {
  createPaymentIntent,
  confirmPayment,
  getUserPaymentHistory,
  getPaymentById,
  stripeWebhook,
};
