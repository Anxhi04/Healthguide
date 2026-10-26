import { z } from "zod";

export const hospitalDirectoryIdSchema = z.string().trim().min(1).max(1500)
    .refine(value => !value.includes("/"), "Invalid document ID");

export const createHospitalSpecialitySchema = z.object({
    hospitalId: z.string().min(1),
    specialityId: z.string().min(1),
});
