import { z } from "zod";

const createServiceValidationSchema = z.object({
  body: z.object({
    title: z.string({ message: "Title is required" }).min(3, "Title must be at least 3 characters"),
    description: z.string({ message: "Description is required" }),
    price: z.number({ message: "Price is required" }).nonnegative("Price must be a positive number"),
    categoryId: z.string({ message: "Category ID is required" }),
  }),
});

const updateServiceValidationSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title must be at least 3 characters").optional(),
    description: z.string().optional(),
    price: z.number().nonnegative("Price must be a positive number").optional(),
    categoryId: z.string().optional(),
  }),
});

export type TCreateServicePayload = z.infer<typeof createServiceValidationSchema>["body"];
export type TUpdateServicePayload = z.infer<typeof updateServiceValidationSchema>["body"];

export const ServiceValidations = {
  createServiceValidationSchema,
  updateServiceValidationSchema,
};
