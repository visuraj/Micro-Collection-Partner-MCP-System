import { useState } from "react";
import { useLocation } from "wouter";

interface TopbarProps {
  userName: string;
}

export function Topbar({ userName }: TopbarProps) {
  const [location] = useLocation();
  const [notificationCount, setNotificationCount] = useState(3); // Sample notification count

  // Get the current page title based on location
  const getPageTitle = () => {
    const path = location === "/" ? "Dashboard" : location.substring(1);
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center">
      <h2 className="text-xl font-semibold text-neutral-dark">{getPageTitle()}</h2>
      <div className="flex items-center space-x-4">
        <button className="relative p-1 text-gray-600 hover:text-primary focus:outline-none">
          <span className="material-icons">notifications</span>
          {notificationCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 bg-danger text-white text-xs rounded-full flex items-center justify-center">
              {notificationCount}
            </span>
          )}
        </button>
        <div className="hidden md:flex items-center space-x-2">
          <span className="material-icons text-primary">account_circle</span>
          <span>{userName}</span>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
