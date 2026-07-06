import { z } from "zod";

const idParamValidationSchema = z.object({
  id: z.string().uuid({ message: "Invalid UUID format for id parameter" }),
});

export { idParamValidationSchema };
