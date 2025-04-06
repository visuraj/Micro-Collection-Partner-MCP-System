import { useState } from "react";
import { useSidebar } from "@/context/SidebarContext";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

type HeaderProps = {
  title?: string;
};

const Header = ({ title = "Dashboard" }: HeaderProps) => {
  const { toggleSidebar } = useSidebar();
  const [showDropdown, setShowDropdown] = useState(false);
  
  const { data: notificationsData } = useQuery({
    queryKey: ["/api/notifications/unread-count"],
  });

  return (
    <header className="bg-white border-b border-neutral-200">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center md:hidden">
          <button 
            onClick={toggleSidebar} 
            className="text-neutral-500 hover:text-neutral-700"
            aria-label="Toggle sidebar menu"
          >
            <i className="ri-menu-line text-2xl"></i>
          </button>
          <h1 className="ml-3 text-lg font-semibold">{title}</h1>
        </div>
        
        <div className="hidden md:block">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search..." 
              className="pl-10 pr-4 py-2 rounded-md border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-64"
            />
            <i className="ri-search-line absolute left-3 top-2.5 text-neutral-400"></i>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="relative">
            <button 
              className="relative text-neutral-500 hover:text-neutral-700 p-2"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <i className="ri-notification-2-line text-xl"></i>
              {notificationsData?.count > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-error-500 rounded-full text-white text-xs flex items-center justify-center">
                  {notificationsData.count > 9 ? '9+' : notificationsData.count}
                </span>
              )}
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-20">
                <div className="p-3 border-b border-neutral-200 flex justify-between items-center">
                  <h3 className="font-medium">Notifications</h3>
                  <Link 
                    href="/notifications" 
                    className="text-primary-500 text-sm"
                    onClick={() => setShowDropdown(false)}
                  >
                    View All
                  </Link>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  <NotificationDropdown />
                </div>
              </div>
            )}
          </div>
          
          <button className="md:hidden text-neutral-500 hover:text-neutral-700 p-2 ml-2">
            <i className="ri-search-line text-xl"></i>
          </button>
        </div>
      </div>
    </header>
  );
};

// Helper component for notification dropdown
const NotificationDropdown = () => {
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["/api/notifications"],
  });
  
  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse flex items-start">
            <div className="w-8 h-8 bg-neutral-200 rounded-full"></div>
            <div className="ml-3 flex-1">
              <div className="h-3 bg-neutral-200 rounded w-3/4"></div>
              <div className="h-2 bg-neutral-200 rounded w-1/2 mt-2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  const recentNotifications = notifications?.slice(0, 5) || [];
  
  if (recentNotifications.length === 0) {
    return (
      <div className="p-6 text-center text-neutral-500">
        No new notifications
      </div>
    );
  }
  
  return (
    <div className="divide-y divide-neutral-200">
      {recentNotifications.map(notification => (
        <div 
          key={notification.id} 
          className={`p-3 hover:bg-neutral-50 cursor-pointer ${!notification.isRead ? 'bg-neutral-50' : ''}`}
        >
          <div className="flex items-start">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center 
              ${notification.type === 'order' ? 'bg-warning-50 text-warning-500' :
                notification.type === 'wallet' ? 'bg-primary-50 text-primary-500' : 
                'bg-success-50 text-success-500'}`}
            >
              <i className={`${
                notification.type === 'order' ? 'ri-shopping-bag-line' :
                notification.type === 'wallet' ? 'ri-wallet-3-line' : 
                'ri-user-line'
              } text-sm`}></i>
            </div>
            <div className="ml-3">
              <p className={`text-sm ${!notification.isRead ? 'font-medium' : ''}`}>
                {notification.message}
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                {new Date(notification.createdAt).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Header;
