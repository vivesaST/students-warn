import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import Auth from "./pages/Auth.tsx";
import Index from "./pages/Index.tsx";
import InstructorDashboard from "./pages/InstructorDashboard.tsx";
import InstructorStudents from "./pages/InstructorStudents.tsx";
import InstructorAnalytics from "./pages/InstructorAnalytics.tsx";
import InstructorCourses from "./pages/InstructorCourses.tsx";
import StudentProfile from "./pages/StudentProfile.tsx";
import StudentDashboard from "./pages/StudentDashboard.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener BEFORE calling getSession
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={session ? <Navigate to="/" replace /> : <Auth />} />
            <Route
              path="/"
              element={
                <AuthGuard session={session} loading={loading}>
                  <Index session={session} />
                </AuthGuard>
              }
            />
            <Route
              path="/instructor"
              element={
                <AuthGuard session={session} loading={loading}>
                  <InstructorDashboard session={session} />
                </AuthGuard>
              }
            />
            <Route
              path="/instructor/students"
              element={
                <AuthGuard session={session} loading={loading}>
                  <InstructorStudents session={session} />
                </AuthGuard>
              }
            />
            <Route
              path="/instructor/analytics"
              element={
                <AuthGuard session={session} loading={loading}>
                  <InstructorAnalytics session={session} />
                </AuthGuard>
              }
            />
            <Route
              path="/instructor/courses"
              element={
                <AuthGuard session={session} loading={loading}>
                  <InstructorCourses session={session} />
                </AuthGuard>
              }
            />
            <Route
              path="/instructor/student/:id"
              element={
                <AuthGuard session={session} loading={loading}>
                  <StudentProfile session={session} />
                </AuthGuard>
              }
            />
            <Route
              path="/student"
              element={
                <AuthGuard session={session} loading={loading}>
                  <StudentDashboard session={session} />
                </AuthGuard>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
