import { z } from "zod";
import { Gender } from "@/enums/enums";

const registerBaseSchema = z.object({
    firstName: z.string()
        .min(1, { message: "First name should not be empty" })
        .regex(/^[A-Za-z\s'-]+$/, { message: "First name should contain valid letters only" }),
    lastname: z.string()
        .min(1, { message: "Lastname should not be empty" })
        .regex(/^[A-Za-z\s'-]+$/, { message: "Lastname should contain valid letters only" }),
    dateOfBirth: z.string().min(1, {
        message: "Date of birth is required",
    }),
    email: z.string()
        .min(1, { message: "Email is required" })
        .email({ message: "This field should have a valid email" }),
    password: z.string()
        .min(8, { message: "Password should contain at least 8 characters" })
        .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/, { message: "Password should contain at least 1 uppercase letter, lowercase letters and numbers" }),
    confirmPassword: z.string()
        .min(1, { message: "Confirm Password is required" }),
    gender: z.nativeEnum(Gender, {
        errorMap: () => ({ message: "Please select a valid gender" }),
    }),
    phoneNumber: z.string().min(1, { message: "Phone number is required" }),
    city: z.string().min(1, { message: "City is required" }),
});

export const registerSchema = registerBaseSchema.refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});
export const profileCompletionSchema = registerBaseSchema.extend({ password: z.string(), confirmPassword: z.string() });

export const addUserSchema = registerBaseSchema.extend({
    role: z.enum(["USER", "ADMIN", "HOSPITAL_ADMIN"]).default("USER"),
}).omit({
    confirmPassword: true,
});

export const editUserSchema = registerBaseSchema.omit({
    confirmPassword: true,
    password: true,
}).extend({
    role: z.enum(["USER", "ADMIN", "HOSPITAL_ADMIN"]).optional(),
});


export type RegisterFormData = z.infer<typeof registerSchema>;
export type AddUserFormInput = z.input<typeof addUserSchema>;
export type AddUserFormData = z.infer<typeof addUserSchema>;
export type EditUserFormData = z.infer<typeof editUserSchema>;
