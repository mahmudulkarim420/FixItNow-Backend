import { z } from "zod";

const updateBookingStatusValidationSchema = z.object({
  body: z
    .object({
      status: z.enum(["ACCEPTED", "DECLINED", "IN_PROGRESS", "COMPLETED"], {
        message: "Invalid status",
      }),
    })
    .strict(),
});

const updateProfileValidationSchema = z.object({
  body: z
    .object({
      bio: z
        .string({ message: "Bio must be a string" })
        .trim()
        .min(1, "Bio cannot be empty")
        .optional(),
      skills: z
        .array(
          z.string({ message: "Skill must be a string" }).trim().min(1, "Skill cannot be empty"),
        )
        .min(1, "Skills array must contain at least one skill")
        .optional(),
      experience: z
        .number({ message: "Experience must be a number" })
        .int("Experience must be an integer")
        .nonnegative("Experience cannot be negative")
        .optional(),
      hourlyRate: z
        .number({ message: "Hourly rate must be a number" })
        .nonnegative("Hourly rate must be a positive number")
        .optional(),
      location: z
        .string({ message: "Location must be a string" })
        .trim()
        .min(1, "Location cannot be empty")
        .optional(),
    })
    .strict(),
});

const updateAvailabilityValidationSchema = z.object({
  body: z
    .object({
      availability: z.record(z.string(), z.array(z.string().trim().min(1))),
    })
    .strict(),
});

const applyTechnicianValidationSchema = z.object({
  body: z
    .object({
      bio: z.string().trim().min(5, "Bio must be at least 5 characters"),
      skills: z.array(z.string().trim().min(1)).min(1, "At least one skill is required"),
      experience: z.number().nonnegative("Experience must be a positive number"),
      hourlyRate: z.number().positive("Hourly rate must be greater than 0"),
      location: z.string().trim().min(2, "Location is required"),
      availability: z.record(z.string(), z.array(z.string())).optional(),
    })
    .passthrough(),
});

export type TUpdateBookingStatusPayload = z.infer<
  typeof updateBookingStatusValidationSchema
>["body"];
export type TUpdateProfilePayload = z.infer<typeof updateProfileValidationSchema>["body"];
export type TUpdateAvailabilityPayload = z.infer<typeof updateAvailabilityValidationSchema>["body"];
export type TApplyTechnicianPayload = z.infer<typeof applyTechnicianValidationSchema>["body"];

export const TechnicianValidations = {
  updateBookingStatusValidationSchema,
  updateProfileValidationSchema,
  updateAvailabilityValidationSchema,
  applyTechnicianValidationSchema,
};

