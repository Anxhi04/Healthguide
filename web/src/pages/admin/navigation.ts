import { Flag, User, Users } from "lucide-react";
import { adminPageUrl } from "@/endpoints/endpoints";

export const adminMenuItems = [
  { title: "Profile", url: `${adminPageUrl}/profile`, icon: User },
  { title: "Users", url: adminPageUrl, icon: Users },
  { title: "Doctor reviews", url: "/admin/reviews", icon: Flag },
  { title: "Reports", url: "/admin/reports", icon: Flag },
];
