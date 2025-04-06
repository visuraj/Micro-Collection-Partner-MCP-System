import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Notification } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export function Notifications() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  // Take the 4 most recent notifications
  const recentNotifications = [...notifications]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/notifications/mark-all-read");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({
        title: "Notifications marked as read",
        description: "All notifications have been marked as read.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to mark notifications as read.",
        variant: "destructive",
      });
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("PATCH", `/api/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to mark notification as read.",
        variant: "destructive",
      });
    },
  });

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleMarkAsRead = (id: number) => {
    markAsReadMutation.mutate(id);
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
    const diffInMs = now.getTime() - new Date(date).getTime();
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Notifications</CardTitle>
        <Button
          variant="ghost"
          className="text-sm text-primary-500 hover:underline p-0 h-auto"
          onClick={handleMarkAllAsRead}
          disabled={markAllAsReadMutation.isPending}
        >
          Mark All as Read
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentNotifications.length > 0 ? (
            recentNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className={getNotificationClassName(notification.type, notification.isRead)}
                onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
              >
                <div className="flex justify-between">
                  <p className="text-sm font-medium">{notification.title}</p>
                  <p className="text-xs text-gray-500">{formatTimeAgo(notification.createdAt)}</p>
                </div>
                <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">No notifications</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
