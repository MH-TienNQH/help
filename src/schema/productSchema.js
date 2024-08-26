import { z } from "zod";
const parsePrice = (value) => {
  if (typeof value === "string") {
    const parsedValue = parseFloat(value);
    if (isNaN(parsedValue)) {
      throw new Error("Invalid number format for price");
    }
    return parsedValue;
  }
  return value;
};

export const addProductSchema = z.object({
  name: z.string().min(1, "Product name can not be empty"),
  description: z.string().min(1, "Product description can not be empty"),
  price: z.union([z.string(), z.number()]).refine(
    (value) => {
      if (typeof value === "string") {
        const parsedValue = parseFloat(value);
        return (
          !isNaN(parsedValue) &&
          parsedValue > 0 &&
          Number.isInteger(parsedValue)
        );
      }
      return typeof value === "number" && value > 0 && Number.isInteger(value);
    },
    {
      message: "Price must be a positive whole number",
    }
  ),
  images: z.string().optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(1, "Product name can not be empty"),
  description: z.string().min(1, "Product description can not be empty"),
  price: z.union([z.string(), z.number()]).refine(
    (value) => {
      if (typeof value === "string") {
        const parsedValue = parseFloat(value);
        return (
          !isNaN(parsedValue) &&
          parsedValue > 0 &&
          Number.isInteger(parsedValue)
        );
      }
      return typeof value === "number" && value > 0 && Number.isInteger(value);
    },
    {
      message: "Price must be a positive whole number",
    }
  ),
  images: z.string().optional(),
});
