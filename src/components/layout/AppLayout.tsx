import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./Sidebar";
import { ChevronRight } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useCourse } from "@/hooks/useCourse";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AppLayoutProps {
  children: ReactNode;
  role: "instructor" | "student";
  session: Session | null;
  breadcrumbs?: BreadcrumbItem[];
}

export function AppLayout({ children, role, session, breadcrumbs }: AppLayoutProps) {
  const navigate = useNavigate();
  const { data: profile } = useProfile(session?.user?.id);
  const { data: course } = useCourse(profile?.course_id);

  const displayRole = profile?.role ?? role;
  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : displayRole === "instructor" ? "IN" : "ST";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar role={displayRole} session={session} />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <header className="h-12 flex items-center gap-3 border-b border-border px-4 bg-card/80 backdrop-blur-sm shrink-0">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />

            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav className="flex items-center gap-1 text-sm">
                {breadcrumbs.map((crumb, i) => (
                  <span key={i} className="flex items-center gap-1">
                    {i > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                    {crumb.href ? (
                      <button
                        onClick={() => navigate(crumb.href!)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {crumb.label}
                      </button>
                    ) : (
                      <span className="text-foreground font-medium">{crumb.label}</span>
                    )}
                  </span>
                ))}
              </nav>
            )}

            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden sm:block">
                {course?.name ?? ""}
              </span>
              <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                {initials}
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
