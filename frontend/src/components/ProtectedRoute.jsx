import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-paper">
        <div className="flex items-center gap-3 text-muted">
          <div className="w-4 h-4 border-2 border-send border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
