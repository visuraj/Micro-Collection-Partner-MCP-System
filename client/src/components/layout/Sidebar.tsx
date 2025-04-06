import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";

interface SidebarProps {
  userName: string;
  userRole: string;
}

export function Sidebar({ userName, userRole }: SidebarProps) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when location changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navItems = [
    { path: "/", label: "Dashboard", icon: "dashboard" },
    { path: "/partners", label: "Pickup Partners", icon: "group" },
    { path: "/orders", label: "Orders", icon: "assignment" },
    { path: "/wallet", label: "Wallet", icon: "account_balance_wallet" },
    { path: "/transactions", label: "Transactions", icon: "receipt_long" },
    { path: "/analytics", label: "Analytics", icon: "analytics" },
    { path: "/settings", label: "Settings", icon: "settings" },
  ];

  return (
    <aside className="bg-neutral-dark text-white w-full md:w-64 md:fixed md:h-full z-10">
      <div className="flex items-center justify-between p-4 border-b border-gray-700 md:justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="material-icons text-sm">recycling</span>
          </div>
          <h1 className="text-xl font-semibold">EpiCircle MCP</h1>
        </div>
        <button 
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span className="material-icons">
            {isMobileMenuOpen ? "close" : "menu"}
          </span>
        </button>
      </div>
      
      <nav className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block`}>
        <ul className="py-4">
          {navItems.map((item) => (
            <li 
              key={item.path} 
              className={`px-4 py-2 hover:bg-gray-700 ${
                location === item.path ? 'bg-gray-700' : ''
              }`}
            >
              <Link href={item.path} className="flex items-center space-x-3">
                <span className={`material-icons ${
                  location === item.path ? 'text-primary' : 'text-gray-300'
                }`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700 hidden md:block">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center">
            <span className="material-icons text-white">person</span>
          </div>
          <div>
            <h3 className="font-medium">{userName}</h3>
            <p className="text-sm text-gray-400">{userRole}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
