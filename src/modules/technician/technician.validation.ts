import { z } from "zod";

const updateBookingStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum(["ACCEPTED", "DECLINED", "IN_PROGRESS", "COMPLETED"], {
      message: "Invalid status",
    }),
  }),
});

const updateProfileValidationSchema = z.object({
  body: z.object({
    bio: z.string().optional(),
    skills: z.array(z.string()).optional(),
    experience: z.number().int().optional(),
    hourlyRate: z.number().optional(),
    location: z.string().optional(),
  }),
});

const updateAvailabilityValidationSchema = z.object({
  body: z.object({
    availability: z.record(z.string(), z.array(z.string())),
  }),
});

export const TechnicianValidations = {
  updateBookingStatusValidationSchema,
  updateProfileValidationSchema,
  updateAvailabilityValidationSchema,
};
