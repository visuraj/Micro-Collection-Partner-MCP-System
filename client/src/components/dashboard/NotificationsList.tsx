import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { Notification } from "@/types";

interface NotificationsListProps {
  mcpId: number;
}

export function NotificationsList({ mcpId }: NotificationsListProps) {
  const { data: notifications, isLoading } = useQuery<Notification[]>({
    queryKey: [`/api/notifications/${mcpId}`],
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PUT", `/api/notifications/${mcpId}/read-all`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/notifications/${mcpId}`] });
    }
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("PUT", `/api/notifications/${id}/read`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/notifications/${mcpId}`] });
    }
  });

  // Handle mark all as read
  const handleMarkAllAsRead = () => {
    markAllReadMutation.mutate();
  };

  // Handle mark single notification as read
  const handleMarkAsRead = (id: number) => {
    markAsReadMutation.mutate(id);
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'wallet_alert':
        return { icon: 'notifications', bgColor: 'bg-blue-100', textColor: 'text-primary' };
      case 'order_completed':
        return { icon: 'check_circle', bgColor: 'bg-green-100', textColor: 'text-success' };
      case 'funds_added':
        return { icon: 'account_balance_wallet', bgColor: 'bg-yellow-100', textColor: 'text-accent' };
      case 'order_cancelled':
        return { icon: 'cancel', bgColor: 'bg-red-100', textColor: 'text-danger' };
      case 'new_partner':
        return { icon: 'person_add', bgColor: 'bg-teal-100', textColor: 'text-secondary' };
      default:
        return { icon: 'notifications', bgColor: 'bg-gray-100', textColor: 'text-gray-500' };
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-8" />
        </div>
        <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="p-4">
              <div className="flex">
                <Skeleton className="h-10 w-10 rounded-full mr-3 flex-shrink-0" />
                <div className="w-full">
                  <Skeleton className="h-4 w-48 mb-2" />
                  <Skeleton className="h-3 w-full mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="font-semibold text-neutral-dark">Notifications</h3>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleMarkAllAsRead}
          disabled={markAllReadMutation.isPending}
        >
          <span className="material-icons text-sm">done_all</span>
        </Button>
      </div>
      <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
        {notifications && notifications.length > 0 ? (
          notifications.map((notification) => {
            const { icon, bgColor, textColor } = getNotificationIcon(notification.type);
            
            return (
              <div 
                key={notification.id} 
                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${notification.read ? 'opacity-60' : ''}`}
                onClick={() => !notification.read && handleMarkAsRead(notification.id)}
              >
                <div className="flex">
                  <div className={`h-10 w-10 rounded-full ${bgColor} flex items-center justify-center ${textColor} mr-3 flex-shrink-0`}>
                    <span className="material-icons">{icon}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">
                      {notification.type.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-2">{formatTimeAgo(notification.created_at)}</p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-gray-500">
            No notifications found
          </div>
        )}
      </div>
      <div className="p-4 border-t">
        <Button 
          variant="ghost" 
          className="w-full"
        >
          View All Notifications
        </Button>
      </div>
    </div>
  );
}

export default NotificationsList;
