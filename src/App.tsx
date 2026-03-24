import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import InstructorDashboard from "./pages/InstructorDashboard.tsx";
import StudentProfile from "./pages/StudentProfile.tsx";
import StudentDashboard from "./pages/StudentDashboard.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

export default function App() {
  const [role, setRole] = useState<"instructor" | "student">("instructor");

  function handleRoleSwitch() {
    const next = role === "instructor" ? "student" : "instructor";
    setRole(next);
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index onSelectRole={setRole} />} />
            <Route path="/instructor" element={<InstructorDashboard onRoleSwitch={handleRoleSwitch} />} />
            <Route path="/instructor/student/:id" element={<StudentProfile onRoleSwitch={handleRoleSwitch} />} />
            <Route path="/student" element={<StudentDashboard onRoleSwitch={handleRoleSwitch} />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
