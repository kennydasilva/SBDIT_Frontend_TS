
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function RouteGuard() {
 
  const {user, loading}= useAuth();

  

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  
  const currentPath = window.location.pathname;

 
  const hasPermission = () => {
    if (user.role === "SUPER_ADMIN") {
      return currentPath.startsWith("/super-admin");
    }
    if (user.role === "ADMIN") {
      return currentPath.startsWith("/admin");
    }
    if (user.role === "PT") {
      return currentPath.startsWith("/policial");
    }
    if (user.role === "CIDADAO") {
      return currentPath.startsWith("/cidadao");
    }
    return false;
  };

  if (!hasPermission()) {
    
    switch (user.role) {
      case "SUPER_ADMIN":
        return <Navigate to="/super-admin/dashboard" replace />;
      case "ADMIN":
        return <Navigate to="/admin/dashboard" replace />;
      case "PT":
        return <Navigate to="/policial/dashboard" replace />;
      case "CIDADAO":
        return <Navigate to="/cidadao/dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return <Outlet />;
}