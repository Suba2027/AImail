import { useState } from 'react';
import { LogOut, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const showInitial = !user?.avatar || avatarError;

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-line z-30 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Hamburger only shows below the lg breakpoint - above that, the
            sidebar is always visible so there's nothing to open. */}
        <button
          onClick={onMenuClick}
          className="lg:hidden text-ink/70 hover:text-ink p-1.5 -ml-1.5 rounded-lg hover:bg-ink/[0.05] transition-colors duration-150"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <div className="w-7 h-7 rounded-md bg-send flex items-center justify-center shrink-0">
          <span className="text-white font-display font-bold text-sm">R</span>
        </div>
        <span className="font-display font-semibold text-lg tracking-tight">ReachAI</span>
      </div>

      {user && (
        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full hover:bg-ink/[0.04] active:scale-[0.98] transition-all duration-150"
          >
            {showInitial ? (
              <div className="w-7 h-7 rounded-full bg-send-light text-send-dark flex items-center justify-center text-xs font-semibold shrink-0">
                {user.name?.[0]?.toUpperCase() || '?'}
              </div>
            ) : (
              <img
                src={user.avatar}
                alt={user.name}
                referrerPolicy="no-referrer"
                onError={() => setAvatarError(true)}
                className="w-7 h-7 rounded-full object-cover"
              />
            )}
            <span className="text-sm font-medium text-ink hidden sm:block">{user.name}</span>
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 bg-white border border-line rounded-lg shadow-lg z-20 animate-fadeIn overflow-hidden">
                <div className="px-4 py-3 border-b border-line">
                  <p className="text-sm font-medium text-ink truncate">{user.name}</p>
                  <p className="text-xs text-muted truncate">{user.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-coral hover:bg-coral-light transition-colors duration-150"
                >
                  <LogOut size={15} />
                  Log out
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
