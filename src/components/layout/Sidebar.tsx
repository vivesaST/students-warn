import { BarChart2, BookOpen, GraduationCap, Home, Users, LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";

interface AppSidebarProps {
  role: "instructor" | "student";
  session: Session | null;
}

const instructorNav = [
  { title: "Dashboard", url: "/instructor", icon: Home },
  { title: "Students", url: "/instructor/students", icon: Users },
  { title: "Analytics", url: "/instructor/analytics", icon: BarChart2 },
];

const studentNav = [
  { title: "My Dashboard", url: "/student", icon: Home },
  { title: "My Progress", url: "/student", icon: BarChart2 },
  { title: "Course Info", url: "/student", icon: BookOpen },
];

export function AppSidebar({ role, session }: AppSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { data: profile } = useProfile(session?.user?.id);

  const navItems = role === "instructor" ? instructorNav : studentNav;
  const displayName = profile?.full_name ?? (role === "instructor" ? "Dr. Sarah Mitchell" : "Student");
  const courseName = "Software Engineering 2025";

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate("/auth");
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="px-3 py-4">
        <div className={cn("flex items-center gap-2", collapsed && "justify-center")}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-foreground truncate leading-tight">EarlyWarn</span>
              <span className="text-[10px] text-muted-foreground truncate">Student Risk System</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Role badge */}
        <div className={cn("mx-3 mb-3 rounded-md px-2 py-1.5", collapsed && "mx-2 px-0 flex justify-center")}>
          {!collapsed ? (
            <div className={cn(
              "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium",
              role === "instructor"
                ? "bg-[hsl(var(--chart-1)/0.15)] text-[hsl(var(--chart-1))]"
                : "bg-[hsl(var(--risk-low-bg))] text-[hsl(var(--risk-low))]"
            )}>
              {role === "instructor" ? <BarChart2 className="h-3 w-3" /> : <GraduationCap className="h-3 w-3" />}
              {role === "instructor" ? "Instructor View" : "Student View"}
            </div>
          ) : (
            <div className={cn(
              "h-6 w-6 rounded-md flex items-center justify-center",
              role === "instructor"
                ? "bg-[hsl(var(--chart-1)/0.15)] text-[hsl(var(--chart-1))]"
                : "bg-[hsl(var(--risk-low-bg))] text-[hsl(var(--risk-low))]"
            )}>
              {role === "instructor" ? <BarChart2 className="h-3 w-3" /> : <GraduationCap className="h-3 w-3" />}
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground text-[10px] uppercase tracking-wider">
            {!collapsed ? "Navigation" : ""}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location.pathname === item.url || location.pathname.startsWith(item.url + "/");
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <NavLink to={item.url} end className="flex items-center gap-2" activeClassName="bg-accent text-primary font-medium">
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-2 py-2 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
            collapsed && "justify-center px-0"
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>

        {!collapsed && (
          <div className="mt-2 border-t border-border pt-2">
            <p className="text-[10px] text-muted-foreground truncate">{displayName}</p>
            <p className="text-[10px] text-muted-foreground/60 truncate">{courseName}</p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
