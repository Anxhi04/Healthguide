import { Link, useLocation } from "react-router-dom"
import { type LucideIcon } from "lucide-react"
import LogoutButton from "@/components/auth/LogoutButton";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"


type MenuItem = {
  title: string;
  url: string;
  icon: LucideIcon;
};

type AppSidebarProps = {
  menuItems: MenuItem[];
};

export function AppSidebar({ menuItems }: AppSidebarProps) {
  const location = useLocation()

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-900 text-white font-bold">H</div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Admin</span>
            <span className="text-xs text-slate-500">Dashboard</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarMenu>
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.url
              return (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <LogoutButton />
        <div className="flex items-center justify-center text-xs text-slate-500">
          <p>© 2026  Admin</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
