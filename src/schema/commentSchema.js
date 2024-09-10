import { z } from "zod";
import { FieldOperationalErrorConstants } from "../constants/constants.js";

export const commentSchema = z.object({
  content: z.string().min(1, FieldOperationalErrorConstants.EMPTY_FIELD_ERROR),
});
