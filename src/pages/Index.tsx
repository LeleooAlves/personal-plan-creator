
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to login or workouts page based on authentication status
    if (isAuthenticated) {
      navigate("/workouts");
    } else {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirecionando...</p>
    </div>
  );
};

export default Index;
