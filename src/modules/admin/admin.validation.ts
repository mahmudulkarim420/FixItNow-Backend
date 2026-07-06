import { z } from "zod";

const toggleUserStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum(["ACTIVE", "BANNED"], { message: "Invalid status" }),
  }),
});

const createCategoryValidationSchema = z.object({
  body: z.object({
    name: z.string({ message: "Category name is required" }),
    description: z.string().optional(),
  }),
});

const updateCategoryValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
  }),
});

export const AdminValidations = {
  toggleUserStatusValidationSchema,
  createCategoryValidationSchema,
  updateCategoryValidationSchema,
};
