
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { useEffect } from "react";
import { initializeStorage } from "./utils/localStorage";

import LoginPage from "./pages/LoginPage";
import WorkoutsPage from "./pages/WorkoutsPage";
import ExercisesPage from "./pages/ExercisesPage";
import ProfilePage from "./pages/ProfilePage";
import MainLayout from "./components/MainLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const AppContent = () => {
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    // Initialize localStorage with default values
    initializeStorage();
  }, []);
  
  return (
    <Routes>
      <Route path="/" element={
        isAuthenticated ? <Navigate to="/workouts" replace /> : <LoginPage />
      } />
      
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route path="/workouts" element={<WorkoutsPage />} />
        <Route path="/exercises" element={<ExercisesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
