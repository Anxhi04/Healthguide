import { Link, Outlet, useLocation } from "react-router-dom";
import LogoutButton from "@/components/auth/LogoutButton";
import { hospitalAdminMenuItems } from "./navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";


export default function HospitalAdminLayout() {
  const location = useLocation();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b">
          <div className="flex items-center gap-2 px-2 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-900 font-bold text-white">H</div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Hospital Admin</span>
              <span className="text-xs text-slate-500">Dashboard</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarMenu>
              {hospitalAdminMenuItems.map((item) => {
                const Icon = item.icon;
                return <SidebarMenuItem key={item.url}><SidebarMenuButton asChild isActive={location.pathname === item.url}><Link to={item.url}><Icon className="h-4 w-4" /><span>{item.title}</span></Link></SidebarMenuButton></SidebarMenuItem>;
              })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <LogoutButton />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center gap-2 border-b border-slate-200 bg-white px-6 py-4 shadow-sm"><SidebarTrigger /></header>
        <main className="flex-1 overflow-auto"><Outlet /></main>
      </SidebarInset>
    </SidebarProvider>
  );
}
