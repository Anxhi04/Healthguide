import { z } from "zod";

export const createHospitalServiceSchema = z.object({
    hospitalId: z.string().min(1, "Hospital is required"),
    serviceId: z.string().min(1, "Service is required"),
});