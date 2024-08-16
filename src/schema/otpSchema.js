import { z } from "zod";

export const otpSchema = z.object({
  otp: z
    .number()
    .int() // Ensure the number is an integer
    .min(1000, "OTP must be at least 4 digits long") // Minimum value to ensure 4 digits
    .max(9999, "OTP must be at most 4 digits long") // Maximum value to ensure 4 digits
    .refine(
      (val) => {
        const strVal = val.toString();
        return strVal.length === 4; // Ensure length is exactly 4 digits
      },
      {
        message: "OTP must be exactly 4 digits long",
      }
    ),
});
