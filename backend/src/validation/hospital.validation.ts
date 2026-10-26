import { z } from "zod";
import { HospitalType } from "../enums/enums";

export const createHospitalSchema= z.object({
    name:z.string().min(2).max(20),
    type:z.enum(HospitalType),
    city:z.string().min(2),
    address:z.string().min(5),
    phoneNumber:z.string(),
    email:z.string().email(),
    description:z.string().optional(),
    photoUrl:z.string().optional(),
})