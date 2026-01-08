import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setIsAuthenticated(!!session);
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) return null; // oder Spinner

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
