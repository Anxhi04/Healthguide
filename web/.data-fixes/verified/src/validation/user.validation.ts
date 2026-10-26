import { z } from "zod";
import {
    Gender,
    Role,
    UserStatus
}from "../enums/enums";
export const createUserSchema= z.object({
    // id:z.string().min(1),
    firstName:z.string().min(2).max(20),
    lastname:z.string().min(2).max(20),
    // displayId:z.string(1),
    email:z.email(),
    phoneNumber:z.string(),
    dateOfBirth:z.string(),
    gender:z.enum(Gender),
    city:z.string(),
    // password:z.string().min(5),
    // role:z.enum(Role),
    // status:z.enum(UserStatus),
    settings: z.any().optional(),
    // createdAt: z.any(),
    // updatedAt: z.any()
});
export const createUserByAdminSchema= z.object({
    // id:z.string().min(1),
    firstName:z.string().min(2).max(20),
    lastname:z.string().min(2).max(20),
    // displayId:z.string(1),
    email:z.email(),
    phoneNumber:z.string(),
    dateOfBirth:z.string(),
    gender:z.enum(Gender),
    city:z.string(),
    password:z.string().min(5),
    role:z.enum(Role),
    // status:z.enum(UserStatus),
    photoUrl:z.string().optional(),
    settings: z.any().optional(),
    // createdAt: z.any(),
    // updatedAt: z.any()
});
const validBirthDateSchema = z.string().trim().refine(value => {
    const match = /^(\d{4})-(\d{2})-(\d{2})(?:$|T)/.exec(value);
    if (!match) return false;
    const [, year, month, day] = match.map(Number);
    const calendar = new Date(0); calendar.setUTCFullYear(year, month - 1, day); calendar.setUTCHours(0, 0, 0, 0);
    return year > 0 && calendar.getUTCFullYear() === year && calendar.getUTCMonth() === month - 1 && calendar.getUTCDate() === day &&
        !Number.isNaN(new Date(value).getTime()) && value.slice(0, 10) <= new Date().toISOString().slice(0, 10);
}, "Choose a valid date of birth that is not in the future.");
export const updateUserSchema = createUserSchema.partial().omit({ settings: true }).extend({ dateOfBirth: validBirthDateSchema.optional() }).strict();
