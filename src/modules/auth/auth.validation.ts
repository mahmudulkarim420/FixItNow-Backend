import { z } from "zod";

const registerValidationSchema = z.object({
  body: z.object({
    name: z.string({ message: "Name is required" }).min(1, "Name is required"),
    email: z.string({ message: "Email is required" }).email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    role: z.enum(["CUSTOMER", "TECHNICIAN"], {
      message: "Role must be either CUSTOMER or TECHNICIAN",
    }),
  }),
});

const loginValidationSchema = z.object({
  body: z.object({
    email: z.string({ message: "Email is required" }).email("Invalid email address"),
    password: z.string({ message: "Password is required" }),
  }),
});

export type TRegisterPayload = z.infer<typeof registerValidationSchema>["body"];
export type TLoginPayload = z.infer<typeof loginValidationSchema>["body"];

export const AuthValidations = {
  registerValidationSchema,
  loginValidationSchema,
};
