import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import config from "../../config";

const stripe = new Stripe(config.stripe.secretKey as string);

const createPaymentIntent = async (bookingId: string, userId: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new AppError(404, "Booking not found!");
  }

  if (booking.customerId !== userId) {
    throw new AppError(403, "You are not authorized to pay for this booking!");
  }

  if (booking.status !== "ACCEPTED") {
    throw new AppError(400, "Booking must be accepted before payment!");
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(booking.servicePrice * 100),
    currency: "usd",
    metadata: { bookingId: booking.id, customerId: userId },
  });

  return { clientSecret: paymentIntent.client_secret };
};

const confirmPayment = async (
  payload: { bookingId: string; transactionId: string; amount: number },
  userId: string
) => {
  const booking = await prisma.booking.findUnique({
    where: { id: payload.bookingId },
  });

  if (!booking) {
    throw new AppError(404, "Booking not found!");
  }

  if (booking.servicePrice !== payload.amount) {
    throw new AppError(400, 'Payment amount mismatch! The exact amount must be paid.');
  }

  if (booking.customerId !== userId) {
    throw new AppError(403, "You are not authorized to confirm this payment!");
  }

  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        bookingId: payload.bookingId,
        amount: payload.amount,
        transactionId: payload.transactionId,
        provider: "STRIPE",
        status: "COMPLETED",
        paidAt: new Date(),
      },
      include: {
        booking: {
          include: {
            service: true,
            customer: { select: { name: true, email: true } },
          },
        },
      },
    });

    await tx.booking.update({
      where: { id: payload.bookingId },
      data: { status: "PAID" },
    });

    return payment;
  });

  return result;
};

const getUserPaymentHistory = async (userId: string, role: string) => {
  let where: any = {};

  if (role === "CUSTOMER") {
    where.booking = { customerId: userId };
  }

  const result = await prisma.payment.findMany({
    where,
    include: {
      booking: {
        include: {
          service: true,
          customer: { select: { name: true, email: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return result;
};

const getPaymentById = async (paymentId: string, userId: string, role: string) => {
  const result = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      booking: {
        include: {
          service: true,
          customer: { select: { name: true, email: true } },
        },
      },
    },
  });

  if (!result) {
    throw new AppError(404, "Payment not found!");
  }

  if (role === "CUSTOMER" && result.booking.customerId !== userId) {
    throw new AppError(403, "You are not authorized to view this payment details");
  }

  return result;
};

export const PaymentServices = {
  createPaymentIntent,
  confirmPayment,
  getUserPaymentHistory,
  getPaymentById,
};
