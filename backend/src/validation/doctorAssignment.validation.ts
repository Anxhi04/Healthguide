import { z } from "zod";

export const createDoctorAssignmentSchema = z.object({
    doctorId: z.string().min(1, "Doctor is required"),
    position: z.string().trim().max(100).optional(),
    hospitalId: z.string().min(1, "Hospital is required"),
});