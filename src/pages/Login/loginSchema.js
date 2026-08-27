import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .pipe(z.email("Enter a valid email")),

  password: z.string().min(1, "Password is required"),
  // .min(8, "Password must be atlease 8 characters")
  // .regex(/[A-Z]/, "Must containe an uppercase letter")
  // .regex(/[a-z]/, "Must contain a lowercase letter")
  // .regex(/[0-9]/, "Must contain a number")
  // .regex(/[^A-Za-z0-9]/, "Must contain a special character"),
});
