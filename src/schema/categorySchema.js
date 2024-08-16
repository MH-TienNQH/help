import { z } from "zod";

export const categorySchema = z.object({
  categoryName: z.string().min(1, "Please enter category name"),
});
