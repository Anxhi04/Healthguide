import { z } from "zod";

export const MAX_PROFILE_PHOTO_BYTES = 5 * 1024 * 1024;
export const profilePhotoUidSchema = z.string().min(1).max(128).refine(value => !/[\\/]/.test(value));
export const profilePhotoSchema = z.object({
  contentType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  bytes: z.custom<Buffer>(value => Buffer.isBuffer(value) && value.length > 0 && value.length <= MAX_PROFILE_PHOTO_BYTES,
    "Choose an image smaller than 5 MB"),
}).superRefine(({ bytes, contentType }, context) => {
  if (!Buffer.isBuffer(bytes)) return;
  const valid = contentType === "image/jpeg" ? bytes.length > 4 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 :
    contentType === "image/png" ? bytes.length >= 24 && bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) :
    bytes.length >= 16 && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";
  if (!valid) context.addIssue({ code: "custom", message: "The file does not match its image format" });
});
