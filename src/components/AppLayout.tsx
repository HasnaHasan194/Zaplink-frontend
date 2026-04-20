import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  const { user, token, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthPage =
    location.pathname === '/login' || location.pathname === '/register';

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="brand-link" aria-label="Zaplink home">
          Zaplink
        </Link>
        <nav className="app-header-nav" aria-label="Main">
          {token && user ? (
            <>
              <span className="app-header-user">{user.email}</span>
              <button
                type="button"
                className="ghost"
                onClick={() => void handleLogout()}
              >
                Log out
              </button>
            </>
          ) : location.pathname === '/login' ? (
            <Link to="/register" className="header-link">
              Create account
            </Link>
          ) : location.pathname === '/register' ? (
            <Link to="/login" className="header-link">
              Sign in
            </Link>
          ) : null}
        </nav>
      </header>
      <main
        className={
          isAuthPage ? 'app-main app-main--auth' : 'app-main app-main--default'
        }
      >
        {children}
      </main>
    </div>
  );
}
