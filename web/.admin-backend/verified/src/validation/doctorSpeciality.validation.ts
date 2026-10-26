import { z } from "zod";

export const createdoctorSpecialitySchema= z.object({
    doctorId:z.string().min(1),
    specialityId:z.string().min(1),
})