import { z } from "zod";

export const addProductSchema = z.object({
  name: z.string().min(1, "Product name can not be empty"),
  description: z.string().min(1, "Product description can not be empty"),
  price: z
    .number()
    .int("Price must be a whole number")
    .positive("Price must be greater than 0"),
});

export const updateProductSchema = z.object({
  name: z.string().min(1, "Product name can not be empty"),
  description: z.string().min(1, "Product description can not be empty"),
  price: z.number().positive("Price must be greater than 0"),
});
