import { z } from "zod";
import { FieldOperationalErrorConstants } from "../constants/constants.js";

export const requestSchema = z.object({
  message: z.string().min(1, FieldOperationalErrorConstants.EMPTY_FIELD_ERROR),
  offer: z.number().min(1, FieldOperationalErrorConstants.EMPTY_FIELD_ERROR),
});
export const messageSchema = z.object({
  message: z.string().min(1, FieldOperationalErrorConstants.EMPTY_FIELD_ERROR),
});
