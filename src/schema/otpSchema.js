import { z } from "zod";
import { OTPOperationalErrorConstants } from "../constants/constants.js";

export const otpSchema = z.object({
  otp: z
    .number()
    .int() // Ensure the number is an integer
    .min(1000, OTPOperationalErrorConstants.OTP_PROMPT_4_DIGIT) // Minimum value to ensure 4 digits
    .max(9999, OTPOperationalErrorConstants.OTP_PROMPT_4_DIGIT) // Maximum value to ensure 4 digits
    .refine(
      (val) => {
        const strVal = val.toString();
        return strVal.length === 4; // Ensure length is exactly 4 digits
      },
      {
        message: OTPOperationalErrorConstants.OTP_PROMPT_4_DIGIT,
      }
    ),
});
