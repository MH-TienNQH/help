import { z } from "zod";
import {
  FieldOperationalErrorConstants,
  ProductOperationalErrorConstants,
} from "../constants/constants.js";
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
  name: z.string().min(1, FieldOperationalErrorConstants.EMPTY_FIELD_ERROR),
  description: z
    .string()
    .min(1, FieldOperationalErrorConstants.EMPTY_FIELD_ERROR),
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
      message:
        ProductOperationalErrorConstants.PRICE_PRICE_POSITIVE_INTEGER_REQUIRE_ERROR,
    }
  ),
  images: z.string().optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(1, FieldOperationalErrorConstants.EMPTY_FIELD_ERROR),
  description: z
    .string()
    .min(1, FieldOperationalErrorConstants.EMPTY_FIELD_ERROR),
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
      message:
        ProductOperationalErrorConstants.PRICE_PRICE_POSITIVE_INTEGER_REQUIRE_ERROR,
    }
  ),
  images: z.string().optional(),
});
