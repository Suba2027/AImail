import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

/**
 * The shared page layout: a top navbar, a sidebar, and the page content.
 *
 * On a desktop-width screen the sidebar is always visible on the left.
 * On a phone/tablet-width screen there isn't room for that, so the sidebar
 * becomes a "drawer" that's hidden until the person taps the menu button in
 * the navbar - `mobileNavOpen` is the on/off switch for that drawer, owned
 * here so both Navbar (which opens it) and Sidebar (which IS it) can share it.
 */
const AppShell = ({ children }) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-paper">
      <Navbar onMenuClick={() => setMobileNavOpen(true)} />
      <div className="flex pt-16">
        <Sidebar open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
        <main className="flex-1 w-full lg:ml-64 p-4 sm:p-6 lg:p-8 max-w-6xl">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppShell;
