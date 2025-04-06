import React, { useState } from "react";
import Sidebar from "./sidebar";
import MobileSidebar from "./mobile-sidebar";
import Header from "./header";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background-light text-neutral-700">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />

      {/* Mobile Header (visible on small screens) */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-neutral-100 z-10">
        <div className="flex items-center justify-between p-4">
          <button
            className="text-neutral-400 hover:text-neutral-600"
            onClick={toggleMobileSidebar}
          >
            <i className="ri-menu-line text-xl"></i>
          </button>
          <div className="flex items-center space-x-2">
            <div className="bg-primary w-8 h-8 flex items-center justify-center rounded-md">
              <span className="text-white font-semibold">MCP</span>
            </div>
            <span className="font-medium">Dashboard</span>
          </div>
          <div className="relative">
            <button className="text-neutral-400 hover:text-neutral-600 relative">
              <i className="ri-notification-3-line text-xl"></i>
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header (hidden on small screens) */}
        <Header />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 mt-14 md:mt-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
