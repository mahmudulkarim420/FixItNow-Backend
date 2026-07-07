import { z } from "zod";

const createBookingValidationSchema = z.object({
  body: z.object({
    serviceId: z.string({ message: "Service ID is required" }),
    scheduledDate: z.string({ message: "Scheduled date is required" }).refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid scheduled date",
    }),
    timeSlot: z.string({ message: "Time slot is required" }),
    contactNumber: z.string({ message: "Contact number is required" }),
  }),
});

export type TCreateBookingPayload = z.infer<typeof createBookingValidationSchema>["body"];

const cancelBookingValidationSchema = z.object({
  body: z.object({
    reason: z
      .string({ message: "Cancellation reason is required" })
      .min(1, "Cancellation reason is required"),
  }),
});

export type TCancelBookingPayload = z.infer<typeof cancelBookingValidationSchema>["body"];

export const BookingValidations = {
  createBookingValidationSchema,
  cancelBookingValidationSchema,
};
