import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { Order, PickupPartner } from "@/types";
import AssignOrderModal from "@/components/modals/AssignOrderModal";

interface OrdersListProps {
  mcpId: number;
}

export function OrdersList({ mcpId }: OrdersListProps) {
  const [isAssignOrderModalOpen, setIsAssignOrderModalOpen] = useState(false);

  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: [`/api/orders/${mcpId}`],
  });

  const { data: partners, isLoading: partnersLoading } = useQuery<PickupPartner[]>({
    queryKey: [`/api/partners/${mcpId}`],
  });

  const isLoading = ordersLoading || partnersLoading;

  // Get only the 5 most recent orders
  const recentOrders = orders
    ? [...orders]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
    : [];

  // Find a partner by ID
  const getPartnerById = (id?: number) => {
    if (!id) return null;
    return partners?.find(p => p.id === id);
  };

  // Get a formatted time string relative to now (e.g., "2 hours ago")
  const getTimeAgo = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  // Get order status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="p-4 space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-start pb-4 border-b border-gray-100">
              <Skeleton className="h-10 w-10 rounded-full mr-3" />
              <div className="flex-1">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-3 w-48 mb-2" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-semibold text-neutral-dark">Recent Orders</h3>
          <Button 
            size="sm"
            onClick={() => setIsAssignOrderModalOpen(true)}
            className="flex items-center"
          >
            <span className="material-icons text-sm mr-1">add_circle</span>
            Assign Order
          </Button>
        </div>
        <div className="p-4 space-y-4">
          {recentOrders.length > 0 ? (
            recentOrders.map((order) => {
              const partner = getPartnerById(order.partnerId);
              
              return (
                <div key={order.id} className="flex items-start border-b border-gray-100 pb-4">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-primary mr-3">
                    <span className="material-icons text-sm">directions_bike</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-medium">Order #{order.id}</h4>
                        <p className="text-xs text-gray-500">
                          {partner 
                            ? `Assigned to: ${partner.name}` 
                            : 'Not assigned yet'}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      <span>{order.pickup_address.split(',')[0]}</span>
                      <span>{getTimeAgo(order.created_at)}</span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-4 text-gray-500">No orders found</div>
          )}
        </div>
        <div className="p-4 border-t">
          <Button 
            variant="ghost" 
            className="w-full"
          >
            View All Orders
          </Button>
        </div>
      </div>

      {/* Assign Order Modal */}
      <AssignOrderModal 
        open={isAssignOrderModalOpen} 
        onOpenChange={setIsAssignOrderModalOpen} 
        mcpId={mcpId}
        partners={partners || []}
      />
    </>
  );
}

export default OrdersList;
