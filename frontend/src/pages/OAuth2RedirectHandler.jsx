import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OAuth2RedirectHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const token = searchParams.get('token');
    if (token) {
      login(token).then(() => navigate('/dashboard', { replace: true }));
    } else {
      navigate('/login', { replace: true });
    }
  }, [searchParams, login, navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-paper gap-3">
      <div className="w-5 h-5 border-2 border-send border-t-transparent rounded-full animate-spin" />
      <p className="text-muted text-sm">Signing you in...</p>
    </div>
  );
};

export default OAuth2RedirectHandler;
