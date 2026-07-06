import { z } from "zod";

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

export type TCreateCategoryPayload = z.infer<
  typeof createCategoryValidationSchema
>["body"];
export type TUpdateCategoryPayload = z.infer<
  typeof updateCategoryValidationSchema
>["body"];

export const CategoryValidations = {
  createCategoryValidationSchema,
  updateCategoryValidationSchema,
};
