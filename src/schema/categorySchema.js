import { z } from "zod";

import { FieldOperationalErrorConstants } from "../constants/constants.js";

export const categorySchema = z.object({
  categoryName: z
    .string()
    .min(1, FieldOperationalErrorConstants.EMPTY_FIELD_ERROR),
});
