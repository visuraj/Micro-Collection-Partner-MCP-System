import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import StatusBadge from "../ui/status-badge";
import { useToast } from "@/hooks/use-toast";

type Order = {
  id: number;
  orderNumber: string;
  amount: string;
  status: "pending" | "in_progress" | "completed" | "unassigned";
  location: string;
  createdAt: string;
  pickupPartnerId: number | null;
  partnerName: string | null;
};

const OrderList = () => {
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const { data: partners } = useQuery({
    queryKey: ["/api/partners"],
  });

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const { toast } = useToast();

  const assignOrderMutation = useMutation({
    mutationFn: async ({ orderId, partnerId }: { orderId: number, partnerId: number }) => {
      await apiRequest("PUT", `/api/orders/${orderId}/assign`, { pickupPartnerId: partnerId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      setShowAssignModal(false);
      toast({
        title: "Order Assigned",
        description: "The order has been assigned to the pickup partner.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to assign order: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleAssignOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowAssignModal(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + 
        `, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    }
  };

  // Get the first 5 orders for the dashboard view
  const recentOrders = orders?.slice(0, 5);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-neutral-200 rounded w-1/4"></div>
          <div className="h-20 bg-neutral-200 rounded w-full"></div>
          <div className="h-20 bg-neutral-200 rounded w-full"></div>
          <div className="h-20 bg-neutral-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        <div className="p-5 border-b border-neutral-200 flex justify-between items-center">
          <h3 className="font-semibold text-lg">Recent Orders</h3>
          <button 
            className="text-primary-500 hover:text-primary-700 text-sm font-medium"
            onClick={() => window.location.href = '/orders'}
          >
            View All
          </button>
        </div>
        
        <div className="p-1">
          {recentOrders && recentOrders.length > 0 ? (
            recentOrders.map((order) => (
              <div key={order.id} className="border-b border-neutral-200 p-4 hover:bg-neutral-50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="text-xs text-neutral-500">{formatDate(order.createdAt)}</p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
                <div className="flex items-center text-sm">
                  {order.partnerName ? (
                    <>
                      <i className="ri-user-line mr-1 text-neutral-500"></i>
                      <span>{order.partnerName}</span>
                      <span className="mx-2 text-neutral-400">•</span>
                      <i className="ri-wallet-3-line mr-1 text-neutral-500"></i>
                      <span className="font-mono">₹{parseFloat(order.amount).toFixed(2)}</span>
                    </>
                  ) : (
                    <>
                      <i className="ri-map-pin-line mr-1 text-neutral-500"></i>
                      <span>{order.location}</span>
                      <button 
                        className="ml-auto text-primary-500 text-xs font-medium"
                        onClick={() => handleAssignOrder(order)}
                      >
                        Assign
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-neutral-500">
              No orders found
            </div>
          )}
        </div>
      </div>

      {/* Assign Order Modal */}
      {showAssignModal && selectedOrder && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowAssignModal(false)}></div>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md z-10 relative">
            <div className="p-5 border-b border-neutral-200 flex justify-between items-center">
              <h3 className="font-semibold text-lg">Assign Order to Partner</h3>
              <button className="text-neutral-500 hover:text-neutral-700" onClick={() => setShowAssignModal(false)}>
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            
            <div className="p-5">
              <div className="mb-4">
                <p className="font-medium">Order Details</p>
                <p className="text-sm text-neutral-500">{selectedOrder.orderNumber} - {selectedOrder.location}</p>
                <p className="text-sm font-mono mt-1">₹{parseFloat(selectedOrder.amount).toFixed(2)}</p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Select Pickup Partner
                </label>
                <select 
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  onChange={(e) => {
                    if (e.target.value && selectedOrder) {
                      assignOrderMutation.mutate({
                        orderId: selectedOrder.id,
                        partnerId: parseInt(e.target.value)
                      });
                    }
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>Select a partner</option>
                  {partners?.filter(p => p.isActive).map(partner => (
                    <option key={partner.id} value={partner.id}>
                      {partner.name} - {partner.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-6 flex justify-end">
                <button 
                  className="mr-2 px-4 py-2 border border-neutral-300 rounded-md text-neutral-700 hover:bg-neutral-50"
                  onClick={() => setShowAssignModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  disabled={assignOrderMutation.isPending}
                  onClick={() => {
                    const select = document.querySelector('select') as HTMLSelectElement;
                    if (select.value && selectedOrder) {
                      assignOrderMutation.mutate({
                        orderId: selectedOrder.id,
                        partnerId: parseInt(select.value)
                      });
                    }
                  }}
                >
                  {assignOrderMutation.isPending ? 'Assigning...' : 'Assign Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderList;
