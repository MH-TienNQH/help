import { z } from "zod";

export const signUpSchema = z.object({
  username: z
    .string()
    .min(2, "Username must be at least 2 characters long")
    .max(20, "Username must be at most 20 characters long"),

  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email can not be empty"),

  name: z
    .string()
    .min(2, "Name must be at least 2 characters long")
    .max(30, "Name must be at most 30 characters long"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one digit")
    .regex(/[\W_]/, "Password must contain at least one special character"),
  avatar: z.string().optional(),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email can not be empty"),
  password: z.string().min(1, "Password can not be empty"),
});

export const updateSchema = z.object({
  username: z
    .string()
    .min(2, "Username must be at least 2 characters long")
    .max(20, "Username must be at most 20 characters long"),

  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email can not be empty"),

  name: z
    .string()
    .min(2, "Name must be at least 2 characters long")
    .max(30, "Name must be at most 30 characters long"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one digit")
    .regex(/[\W_]/, "Password must contain at least one special character"),
});

export const emailSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email can not be empty"),
});

export const passwordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one digit")
    .regex(/[\W_]/, "Password must contain at least one special character"),
});

export const setPasswordSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email can not be empty"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one digit")
    .regex(/[\W_]/, "Password must contain at least one special character"),
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
