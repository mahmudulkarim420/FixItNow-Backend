import { z } from "zod";

const createCheckoutSessionValidationSchema = z.object({
  body: z.object({
    bookingId: z.string({ message: "Booking ID is required" }),
  }),
});

export type TCreateCheckoutSessionPayload = z.infer<
  typeof createCheckoutSessionValidationSchema
>["body"];

export const PaymentValidations = {
  createCheckoutSessionValidationSchema,
};
