import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();

  // 1. Kung hindi naka-login, itapon sa Login page
  if (!user) {
    return <Navigate to="/login" />;
  }

  // 2. Kung ang page ay pang-ADMIN lang (role='admin') pero MEMBER lang ang user
  if (role === 'admin' && user.role !== 'admin') {
    return <Navigate to="/home" />; // Ibalik sa home kung hindi admin
  }

  // 3. Kung OK lahat, ipakita ang page
  return children;
};

export default ProtectedRoute;