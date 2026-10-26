import { Ban, Flag, Hospital, Star, Stethoscope, User } from "lucide-react";
import { hospitalAdminPageUrl } from "@/endpoints/endpoints";

export const hospitalAdminReviewsUrl = `${hospitalAdminPageUrl}/reviews`;
export const hospitalAdminMenuItems = [
  { title: "Profile", url: `${hospitalAdminPageUrl}/profile`, icon: User },
  { title: "My Hospital", url: hospitalAdminPageUrl, icon: Hospital },
  { title: "Specialities & Doctors", url: `${hospitalAdminPageUrl}/specialities`, icon: Stethoscope },
  { title: "Review Moderation", url: hospitalAdminReviewsUrl, icon: Star },
  { title: "Banned Words", url: `${hospitalAdminPageUrl}/banned-words`, icon: Ban },
  { title: "Reports", url: `${hospitalAdminPageUrl}/reports`, icon: Flag },
];
