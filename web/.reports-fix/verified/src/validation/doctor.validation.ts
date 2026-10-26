import { z } from "zod";

export const createDoctorSchema = z.object({
    name: z.string().min(2).max(30),
    lastName: z.string().min(2).max(30),
    phoneNumber: z.string().optional(),
    photoUrl: z.string().optional(),
    biography: z.string().max(1000).optional(),
    experienceYears: z.number().int().min(0).optional(),
    licenseNumber: z.string().optional(),
});