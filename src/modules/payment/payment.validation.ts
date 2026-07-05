import { z } from "zod";

const createPaymentIntentValidationSchema = z.object({
  body: z.object({
    bookingId: z.string({ message: "Booking ID is required" }),
  }),
});

const confirmPaymentValidationSchema = z.object({
  body: z.object({
    bookingId: z.string({ message: "Booking ID is required" }),
    transactionId: z.string({ message: "Transaction ID is required" }),
    amount: z.number({ message: "Amount is required" }).positive("Amount must be positive"),
  }),
});

export const PaymentValidations = {
  createPaymentIntentValidationSchema,
  confirmPaymentValidationSchema,
};
