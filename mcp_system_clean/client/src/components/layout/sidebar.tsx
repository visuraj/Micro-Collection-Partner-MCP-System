import React from "react";
import { Link, useLocation } from "wouter";

const navItems = [
  { path: "/", icon: "ri-dashboard-line", label: "Dashboard" },
  { path: "/partners", icon: "ri-team-line", label: "Pickup Partners" },
  { path: "/wallet", icon: "ri-wallet-3-line", label: "Wallet" },
  { path: "/orders", icon: "ri-shopping-bag-line", label: "Orders" },
  { path: "/transactions", icon: "ri-exchange-funds-line", label: "Transactions" },
];

const settingsItems = [
  { path: "/account", icon: "ri-user-settings-line", label: "Account" },
  { path: "/preferences", icon: "ri-settings-3-line", label: "Preferences" },
];

const Sidebar: React.FC = () => {
  const [location] = useLocation();

  return (
    <div className="hidden md:flex md:w-64 flex-col bg-white border-r border-neutral-100 h-full">
      <div className="flex items-center justify-between p-4 border-b border-neutral-100">
        <div className="flex items-center space-x-2">
          <div className="bg-primary w-8 h-8 flex items-center justify-center rounded-md">
            <span className="text-white font-semibold">MCP</span>
          </div>
          <span className="font-medium text-lg">Dashboard</span>
        </div>
        <button className="text-neutral-400 hover:text-neutral-600">
          <i className="ri-menu-fold-line"></i>
        </button>
      </div>
      
      <div className="flex flex-col flex-grow overflow-y-auto">
        <div className="p-4">
          <div className="text-xs uppercase text-neutral-400 font-medium mb-2">Main</div>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-md ${
                  location === item.path
                    ? "bg-primary bg-opacity-10 text-primary"
                    : "text-neutral-500 hover:bg-neutral-50"
                }`}
              >
                <i className={`${item.icon} text-lg`}></i>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="p-4 mt-4">
          <div className="text-xs uppercase text-neutral-400 font-medium mb-2">Settings</div>
          <nav className="space-y-1">
            {settingsItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-md ${
                  location === item.path
                    ? "bg-primary bg-opacity-10 text-primary"
                    : "text-neutral-500 hover:bg-neutral-50"
                }`}
              >
                <i className={`${item.icon} text-lg`}></i>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
      
      <div className="p-4 border-t border-neutral-100">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center">
            <span className="text-sm font-medium text-neutral-700">JD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-neutral-700 truncate">John Doe</p>
            <p className="text-xs text-neutral-400 truncate">john.doe@example.com</p>
          </div>
          <button className="text-neutral-400 hover:text-neutral-600">
            <i className="ri-logout-box-r-line"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
