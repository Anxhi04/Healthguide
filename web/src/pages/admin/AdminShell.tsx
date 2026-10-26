import type { ReactNode } from "react";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { adminMenuItems } from "./navigation";

export default function AdminShell({ children }: { children: ReactNode }) {
  return <SidebarProvider><AppSidebar menuItems={adminMenuItems} /><SidebarInset>
    <header className="border-b border-slate-200 bg-white px-6 py-4"><SidebarTrigger /></header>{children}
  </SidebarInset></SidebarProvider>;
}
