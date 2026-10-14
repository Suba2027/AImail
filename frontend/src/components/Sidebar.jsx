import { NavLink } from 'react-router-dom';
import { LayoutGrid, Mail, PlusCircle, HelpCircle, X } from 'lucide-react';
import { NAV_STYLES } from '../theme/categories';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/campaigns', label: 'Campaigns', icon: Mail },
  { to: '/campaigns/new', label: 'Create Campaign', icon: PlusCircle },
  { to: '/how-to-use', label: 'How to Use', icon: HelpCircle },
];

/**
 * `open` and `onClose` only matter below the `lg` breakpoint, where this
 * renders as a slide-in drawer instead of a permanently visible sidebar.
 * At `lg` and above, the drawer classes are overridden back to "always
 * visible, in the normal document flow" by the `lg:` variants below.
 */
const Sidebar = ({ open, onClose }) => {
  const linksList = (
    <nav className="space-y-1">
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/campaigns'}
          onClick={onClose}
          className={({ isActive }) => {
            const nav = NAV_STYLES[to];
            return `relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
              isActive
                ? nav.active
                : 'text-ink/70 hover:bg-ink/[0.04] hover:text-ink active:bg-ink/[0.06]'
            }`;
          }}
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className={`absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full ${NAV_STYLES[to].bar}`} />
              )}
              <Icon size={17} />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile-only dark backdrop behind the drawer - tapping it closes the menu */}
      {open && (
        <div
          className="fixed inset-0 top-16 bg-ink/30 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-line py-6 px-3 z-40
                    transition-transform duration-200 ease-out
                    lg:translate-x-0 lg:z-0
                    ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <button
          onClick={onClose}
          className="lg:hidden mb-3 ml-1 text-muted hover:text-ink p-1.5 rounded-lg hover:bg-ink/[0.05] transition-colors duration-150"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
        {linksList}
      </aside>
    </>
  );
};

export default Sidebar;
