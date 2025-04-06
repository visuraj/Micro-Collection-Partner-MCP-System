import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest } from "@/lib/queryClient";
import { type Notification } from "@shared/schema";

export function Header() {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  const { data: notifications = [], refetch: refetchNotifications } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllAsRead = async () => {
    try {
      await apiRequest("POST", "/api/notifications/mark-all-read");
      refetchNotifications();
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await apiRequest("PATCH", `/api/notifications/${id}/read`);
      refetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const getNotificationClassName = (type: string, isRead: boolean) => {
    const baseClass = "p-3 rounded-lg border-l-4 mb-3";
    
    if (isRead) {
      return `${baseClass} bg-gray-50 border-gray-300`;
    }
    
    switch (type) {
      case "info":
        return `${baseClass} bg-blue-50 border-blue-500`;
      case "warning":
        return `${baseClass} bg-yellow-50 border-yellow-500`;
      case "success":
        return `${baseClass} bg-green-50 border-green-500`;
      case "danger":
        return `${baseClass} bg-red-50 border-red-500`;
      default:
        return `${baseClass} bg-gray-50 border-gray-300`;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMins < 60) {
      return `${diffInMins} min ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInDays === 1) {
      return `Yesterday`;
    } else {
      return `${diffInDays} days ago`;
    }
  };

  useEffect(() => {
    // Refetch notifications every minute
    const interval = setInterval(() => {
      refetchNotifications();
    }, 60000);

    return () => clearInterval(interval);
  }, [refetchNotifications]);

  return (
    <header className="bg-white border-b flex items-center justify-between h-16 px-6">
      <div className="flex items-center">
        {/* Sidebar toggle button is rendered from Sidebar component for mobile */}
      </div>
      <div className="flex ml-auto">
        <div className="relative mr-4">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setNotificationsOpen(true)}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500"></span>
            )}
          </Button>
        </div>
        <div className="border-l pl-3 ml-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full bg-gray-50">
                <span className="sr-only">User menu</span>
                <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
                  MCP
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Notifications Dialog */}
      <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>Notifications</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleMarkAllAsRead}
                className="text-sm text-primary-500 hover:text-primary-700"
              >
                Mark All as Read
              </Button>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] overflow-y-auto mt-2">
            <div className="space-y-4">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={getNotificationClassName(notification.type, notification.isRead)}
                    onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                  >
                    <div className="flex justify-between">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-gray-500">
                        {formatTimeAgo(new Date(notification.createdAt))}
                      </p>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">No notifications</p>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </header>
  );
}
