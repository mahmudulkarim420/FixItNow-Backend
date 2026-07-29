import { z } from "zod";

const registerValidationSchema = z.object({
  body: z
    .object({
      name: z.string({ message: "Name is required" }).trim().min(1, "Name cannot be empty"),
      email: z.string({ message: "Email is required" }).trim().email("Invalid email address"),
      password: z
        .string({ message: "Password is required" })
        .min(6, "Password must be at least 6 characters long"),
      role: z.enum(["CUSTOMER", "TECHNICIAN"], {
        message: "Role must be either CUSTOMER or TECHNICIAN",
      }),
    })
    .strict(),
});

const loginValidationSchema = z.object({
  body: z
    .object({
      email: z.string({ message: "Email is required" }).trim().email("Invalid email address"),
      password: z.string({ message: "Password is required" }).min(1, "Password cannot be empty"),
    })
    .strict(),
});

const updateProfileValidationSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(1, "Name cannot be empty").optional(),
      email: z.string().trim().email("Invalid email address").optional(),
      password: z.string().min(6, "Password must be at least 6 characters long").optional(),
      bio: z.string().optional(),
      skills: z.array(z.string()).optional(),
      experience: z.number().min(0, "Experience must be non-negative").optional(),
      hourlyRate: z.number().min(0, "Hourly rate must be non-negative").optional(),
      location: z.string().optional(),
    })
    .strict(),
});

export type TRegisterPayload = z.infer<typeof registerValidationSchema>["body"];
export type TLoginPayload = z.infer<typeof loginValidationSchema>["body"];
export type TUpdateProfilePayload = z.infer<typeof updateProfileValidationSchema>["body"];

export const AuthValidations = {
  registerValidationSchema,
  loginValidationSchema,
  updateProfileValidationSchema,
};
