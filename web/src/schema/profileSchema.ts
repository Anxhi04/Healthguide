import { editUserSchema } from "@/schema/auth/registerSchema";
import { isValidBirthDate } from "@/lib/date";

export const profileUpdateSchema = editUserSchema.omit({ email: true, role: true }).partial().refine(
  data => !data.dateOfBirth || isValidBirthDate(data.dateOfBirth),
  { message: "Choose a valid date of birth that is not in the future.", path: ["dateOfBirth"] },
);
