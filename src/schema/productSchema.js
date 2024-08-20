import { z } from "zod";

export const addProductSchema = z.object({
  name: z.string().min(1, "Product name can not be empty"),
  description: z.string().min(1, "Product description can not be empty"),
  images: z.string().optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(1, "Product name can not be empty"),
  description: z.string().min(1, "Product description can not be empty"),
  price: z.number().positive("Price must be greater than 0"),
  images: z.string().optional(),
});
