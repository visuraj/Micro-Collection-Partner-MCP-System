import { useLocation, Link } from "wouter";
import { useSidebar } from "@/context/SidebarContext";
import { useQuery } from "@tanstack/react-query";
import { useMobile } from "@/hooks/use-mobile";

const Sidebar = () => {
  const [location] = useLocation();
  const { isOpen, closeSidebar } = useSidebar();
  const isMobile = useMobile();
  
  const { data: userData } = useQuery({
    queryKey: ["/api/user/current"],
  });

  const { data: notificationsData } = useQuery({
    queryKey: ["/api/notifications/unread-count"],
  });

  const navItems = [
    { path: "/", icon: "ri-dashboard-line", label: "Dashboard" },
    { path: "/partners", icon: "ri-user-line", label: "Pickup Partners" },
    { path: "/wallet", icon: "ri-wallet-3-line", label: "Wallet" },
    { path: "/orders", icon: "ri-shopping-bag-line", label: "Orders" },
    { path: "/transactions", icon: "ri-exchange-funds-line", label: "Transactions" },
    { path: "/notifications", icon: "ri-notification-2-line", label: "Notifications", count: notificationsData?.count },
    { path: "/settings", icon: "ri-settings-line", label: "Settings" }
  ];

  const sidebarClasses = `
    bg-white w-64 shadow-md flex-shrink-0 overflow-y-auto
    ${isMobile ? "fixed inset-y-0 left-0 z-20" : "hidden md:block"}
    ${isMobile && !isOpen ? "hidden" : ""}
  `;

  return (
    <>
      {/* Backdrop for mobile sidebar */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={closeSidebar}
        ></div>
      )}
    
      <div id="sidebar" className={sidebarClasses}>
        <div className="p-4 border-b border-neutral-200">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center">
              <i className="ri-recycle-line text-xl"></i>
            </div>
            <h1 className="ml-3 text-lg font-semibold">MCP Dashboard</h1>
          </div>
        </div>

        <nav className="py-4">
          <ul>
            {navItems.map((item) => (
              <li 
                key={item.path} 
                className={`nav-item ${location === item.path ? 'active' : ''}`}
              >
                <Link 
                  href={item.path} 
                  className={`flex items-center py-3 px-4 ${location === item.path ? 'text-primary-600' : 'text-neutral-600 hover:bg-neutral-100'}`}
                  onClick={isMobile ? closeSidebar : undefined}
                >
                  <i className={`${item.icon} mr-3 text-xl`}></i>
                  <span>{item.label}</span>
                  {item.count !== undefined && item.count > 0 && (
                    <span className="ml-auto w-5 h-5 bg-error-500 rounded-full text-white text-xs flex items-center justify-center">
                      {item.count > 99 ? '99+' : item.count}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto p-4 border-t border-neutral-200">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-500 font-medium">
              {userData?.name ? userData.name.substring(0, 2).toUpperCase() : 'MCP'}
            </div>
            <div className="ml-3">
              <p className="font-medium text-sm">{userData?.name || 'Loading...'}</p>
              <p className="text-xs text-neutral-500">{userData?.email || 'Loading...'}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
