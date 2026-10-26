import { z } from "zod"; 

export const loginSchema = z.object({
    email: z.string()
        .min(1, { message: "Email is required" })
        .email({ message: "Put a valid email address" }),
    password: z.string()
        .min(8, { message: "Password must be at least 8 characters long" })
        .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/, { message: "Password should contain at least 1 uppercase letter, lowercase letters and numbers" })
})

export type LoginFormData = z.infer<typeof loginSchema>