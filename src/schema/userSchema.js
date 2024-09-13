import { z } from "zod";
import {
  FieldOperationalErrorConstants,
  OTPOperationalErrorConstants,
} from "../constants/constants.js";

export const signUpSchema = z.object({
  username: z
    .string()
    .min(2, FieldOperationalErrorConstants.USERNAME_LENGTH_REQUIREMENT_ERROR)
    .max(20, FieldOperationalErrorConstants.USERNAME_LENGTH_REQUIREMENT_ERROR),

  email: z
    .string()
    .email(FieldOperationalErrorConstants.EMAIL_REQUIREMENT_ERROR)
    .min(1, FieldOperationalErrorConstants.EMPTY_FIELD_ERROR),

  name: z
    .string()
    .min(2, FieldOperationalErrorConstants.NAME_LENGTH_REQUIREMENT_ERROR)
    .max(30, FieldOperationalErrorConstants.NAME_LENGTH_REQUIREMENT_ERROR),

  password: z
    .string()
    .min(8, FieldOperationalErrorConstants.PASSWORD_MIN_LENGTH_MESSAGE)
    .regex(/[A-Z]/, FieldOperationalErrorConstants.PASSWORD_UPPERCASE_MESSAGE)
    .regex(/[a-z]/, FieldOperationalErrorConstants.PASSWORD_LOWERCASE_MESSAGE)
    .regex(/[0-9]/, FieldOperationalErrorConstants.PASSWORD_DIGIT_MESSAGE)
    .regex(
      /[\W_]/,
      FieldOperationalErrorConstants.PASSWORD_SPECIAL_CHAR_MESSAGE
    ),
  avatar: z.string().optional(),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email(FieldOperationalErrorConstants.EMAIL_REQUIREMENT_ERROR)
    .min(1, FieldOperationalErrorConstants.EMPTY_FIELD_ERROR),
  password: z.string().min(1, FieldOperationalErrorConstants.EMPTY_FIELD_ERROR),
});

export const updateSchema = z.object({
  username: z
    .string()
    .min(2, FieldOperationalErrorConstants.USERNAME_LENGTH_REQUIREMENT_ERROR)
    .max(20, FieldOperationalErrorConstants.USERNAME_LENGTH_REQUIREMENT_ERROR),

  email: z
    .string()
    .email(FieldOperationalErrorConstants.EMAIL_REQUIREMENT_ERROR)
    .min(1, FieldOperationalErrorConstants.EMPTY_FIELD_ERROR),

  name: z
    .string()
    .min(2, FieldOperationalErrorConstants.NAME_LENGTH_REQUIREMENT_ERROR)
    .max(30, FieldOperationalErrorConstants.NAME_LENGTH_REQUIREMENT_ERROR),

  password: z
    .string()
    .min(8, FieldOperationalErrorConstants.PASSWORD_MIN_LENGTH_MESSAGE)
    .regex(/[A-Z]/, FieldOperationalErrorConstants.PASSWORD_UPPERCASE_MESSAGE)
    .regex(/[a-z]/, FieldOperationalErrorConstants.PASSWORD_LOWERCASE_MESSAGE)
    .regex(/[0-9]/, FieldOperationalErrorConstants.PASSWORD_DIGIT_MESSAGE)
    .regex(
      /[\W_]/,
      FieldOperationalErrorConstants.PASSWORD_SPECIAL_CHAR_MESSAGE
    ),
});

export const emailSchema = z.object({
  email: z
    .string()
    .email(FieldOperationalErrorConstants.EMAIL_REQUIREMENT_ERROR)
    .min(1, FieldOperationalErrorConstants.EMPTY_FIELD_ERROR),
});

export const passwordSchema = z.object({
  password: z
    .string()
    .min(8, FieldOperationalErrorConstants.PASSWORD_MIN_LENGTH_MESSAGE)
    .regex(/[A-Z]/, FieldOperationalErrorConstants.PASSWORD_UPPERCASE_MESSAGE)
    .regex(/[a-z]/, FieldOperationalErrorConstants.PASSWORD_LOWERCASE_MESSAGE)
    .regex(/[0-9]/, FieldOperationalErrorConstants.PASSWORD_DIGIT_MESSAGE)
    .regex(
      /[\W_]/,
      FieldOperationalErrorConstants.PASSWORD_SPECIAL_CHAR_MESSAGE
    ),
});

export const setPasswordSchema = z.object({
  email: z
    .string()
    .email(FieldOperationalErrorConstants.EMAIL_REQUIREMENT_ERROR)
    .min(1, FieldOperationalErrorConstants.EMPTY_FIELD_ERROR),
  password: z
    .string()
    .min(8, FieldOperationalErrorConstants.PASSWORD_MIN_LENGTH_MESSAGE)
    .regex(/[A-Z]/, FieldOperationalErrorConstants.PASSWORD_UPPERCASE_MESSAGE)
    .regex(/[a-z]/, FieldOperationalErrorConstants.PASSWORD_LOWERCASE_MESSAGE)
    .regex(/[0-9]/, FieldOperationalErrorConstants.PASSWORD_DIGIT_MESSAGE)
    .regex(
      /[\W_]/,
      FieldOperationalErrorConstants.PASSWORD_SPECIAL_CHAR_MESSAGE
    ),
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
