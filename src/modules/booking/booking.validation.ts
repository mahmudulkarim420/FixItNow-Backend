import { z } from "zod";

const createBookingValidationSchema = z.object({
  body: z.object({
    serviceId: z.string({ message: "Service ID is required" }),
    technicianProfileId: z.string({ message: "Technician profile ID is required" }),
    scheduledDate: z.string({ message: "Scheduled date is required" }).refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid scheduled date",
    }),
    timeSlot: z.string({ message: "Time slot is required" }),
    contactNumber: z.string({ message: "Contact number is required" }),
  }),
});

export const BookingValidations = {
  createBookingValidationSchema,
};
