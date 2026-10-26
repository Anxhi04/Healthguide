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
export const updateUserSchema = createUserSchema.partial().omit({ settings: true }).strict();
