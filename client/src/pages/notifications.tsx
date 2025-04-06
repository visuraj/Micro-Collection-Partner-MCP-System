import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useSidebar } from "@/context/SidebarContext";
import Header from "@/components/layouts/header";
import { useToast } from "@/hooks/use-toast";

type Notification = {
  id: number;
  type: "order" | "wallet" | "partner";
  message: string;
  isRead: boolean;
  createdAt: string;
  mcpId: number;
};

const Notifications = () => {
  const { toggleSidebar } = useSidebar();
  const { toast } = useToast();
  const [filterType, setFilterType] = useState<string | null>(null);
  
  const { data: notifications, isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PUT", `/api/notifications/${id}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
      toast({
        title: "Notification marked as read",
      });
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      if (diffInHours === 0) {
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
      }
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    }
    
    if (diffInDays === 1) {
      return 'Yesterday';
    }
    
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order":
        return "ri-shopping-bag-line";
      case "wallet":
        return "ri-wallet-3-line";
      case "partner":
        return "ri-user-line";
      default:
        return "ri-notification-2-line";
    }
  };
  
  const getNotificationColor = (type: string) => {
    switch (type) {
      case "order":
        return "bg-warning-50 text-warning-500";
      case "wallet":
        return "bg-primary-50 text-primary-500";
      case "partner":
        return "bg-success-50 text-success-500";
      default:
        return "bg-neutral-100 text-neutral-500";
    }
  };
  
  const filteredNotifications = filterType 
    ? notifications?.filter(n => n.type === filterType) 
    : notifications;

  return (
    <>
      <Header title="Notifications" />
      
      <main className="p-4 md:p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">Notifications</h2>
          <p className="text-neutral-500">Stay updated with all activities</p>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-neutral-200 flex flex-wrap gap-2">
            <button 
              className={`px-3 py-1.5 rounded-md text-sm ${!filterType ? 'bg-primary-500 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
              onClick={() => setFilterType(null)}
            >
              All
            </button>
            <button 
              className={`px-3 py-1.5 rounded-md text-sm ${filterType === 'order' ? 'bg-primary-500 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
              onClick={() => setFilterType('order')}
            >
              Orders
            </button>
            <button 
              className={`px-3 py-1.5 rounded-md text-sm ${filterType === 'wallet' ? 'bg-primary-500 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
              onClick={() => setFilterType('wallet')}
            >
              Wallet
            </button>
            <button 
              className={`px-3 py-1.5 rounded-md text-sm ${filterType === 'partner' ? 'bg-primary-500 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
              onClick={() => setFilterType('partner')}
            >
              Partners
            </button>
          </div>
          
          {isLoading ? (
            <div className="p-4">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-start">
                    <div className="w-10 h-10 bg-neutral-200 rounded-full"></div>
                    <div className="ml-3 flex-1">
                      <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                      <div className="h-3 bg-neutral-200 rounded w-1/4 mt-2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="divide-y divide-neutral-200">
              {filteredNotifications && filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-4 hover:bg-neutral-50 transition-colors ${!notification.isRead ? 'bg-neutral-50' : ''}`}
                  >
                    <div className="flex items-start">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                        <i className={`${getNotificationIcon(notification.type)} text-lg`}></i>
                      </div>
                      <div className="ml-3 flex-1">
                        <p className={`${!notification.isRead ? 'font-semibold' : 'font-medium'}`}>
                          {notification.message}
                        </p>
                        <div className="flex justify-between mt-1">
                          <p className="text-xs text-neutral-500">{formatDate(notification.createdAt)}</p>
                          {!notification.isRead && (
                            <button 
                              className="text-xs text-primary-500 hover:text-primary-700"
                              onClick={() => markAsReadMutation.mutate(notification.id)}
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-neutral-500">
                  {filterType 
                    ? `No ${filterType} notifications found` 
                    : 'No notifications found'}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Notifications;
