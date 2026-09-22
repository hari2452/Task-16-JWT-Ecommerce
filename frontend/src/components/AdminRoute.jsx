import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminRoute({ children }) {

  const { user, loading } = useAuth();

  if (loading) {
  return (
    <div className="route-loading-page">
      <div className="route-loading-spinner"></div>
      <h2>Loading ShopZone</h2>
      <p>Checking your account...</p>
    </div>
  );
}

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AdminRoute;