import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppIndex from "./pages/AppIndex"; // Renamed from Index
import LandingPage from "./pages/LandingPage"; // New public landing page
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { MusicPlayerProvider } from "./context/MusicPlayerContext";
import { SidebarProvider } from "./context/SidebarContext";
import { AuthProvider } from "./integrations/supabase/auth";
import AdminDashboard from "./pages/AdminDashboard";
import BannedPage from "./pages/BannedPage";
import ProfilePage from "./pages/ProfilePage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <MusicPlayerProvider>
          <SidebarProvider>
            <div className="dark min-h-screen">
              <BrowserRouter>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/banned" element={<BannedPage />} />
                  
                  {/* Protected Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/app" element={<AppIndex />} /> {/* Main app content moved to /app */}
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/profile" element={<ProfilePage />} />
                  </Route>
                  
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </div>
          </SidebarProvider>
        </MusicPlayerProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;