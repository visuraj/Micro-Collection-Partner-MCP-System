import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import StatusBadge from "@/components/ui/status-badge";
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

const OrderTable = () => {
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const { data: partners } = useQuery({
    queryKey: ["/api/partners"],
  });

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  
  const ordersPerPage = 10;
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders?.slice(indexOfFirstOrder, indexOfLastOrder) || [];
  const totalPages = orders ? Math.ceil(orders.length / ordersPerPage) : 0;

  const assignOrderMutation = useMutation({
    mutationFn: async ({ orderId, partnerId }: { orderId: number, partnerId: number }) => {
      await apiRequest("PUT", `/api/orders/${orderId}/assign`, { pickupPartnerId: partnerId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
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

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number, status: string }) => {
      await apiRequest("PUT", `/api/orders/${orderId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      setShowStatusModal(false);
      toast({
        title: "Status Updated",
        description: "The order status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update status: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleAssignOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowAssignModal(true);
  };

  const handleUpdateStatus = (order: Order) => {
    setSelectedOrder(order);
    setShowStatusModal(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-neutral-200 rounded w-1/4"></div>
          <div className="h-10 bg-neutral-200 rounded w-full"></div>
          <div className="h-20 bg-neutral-200 rounded w-full"></div>
          <div className="h-20 bg-neutral-200 rounded w-full"></div>
          <div className="h-20 bg-neutral-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-100 text-left">
                <th className="p-4 font-medium text-neutral-600 text-sm">Order</th>
                <th className="p-4 font-medium text-neutral-600 text-sm">Status</th>
                <th className="p-4 font-medium text-neutral-600 text-sm">Partner</th>
                <th className="p-4 font-medium text-neutral-600 text-sm">Location</th>
                <th className="p-4 font-medium text-neutral-600 text-sm">Amount</th>
                <th className="p-4 font-medium text-neutral-600 text-sm">Date</th>
                <th className="p-4 font-medium text-neutral-600 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.length > 0 ? (
                currentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-neutral-200 hover:bg-neutral-50">
                    <td className="p-4 font-medium">{order.orderNumber}</td>
                    <td className="p-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="p-4">
                      {order.partnerName || (
                        <span className="text-neutral-500 text-sm">Unassigned</span>
                      )}
                    </td>
                    <td className="p-4 text-sm">{order.location}</td>
                    <td className="p-4 font-mono">₹{parseFloat(order.amount).toFixed(2)}</td>
                    <td className="p-4 text-sm">{formatDate(order.createdAt)}</td>
                    <td className="p-4">
                      <div className="flex">
                        {!order.pickupPartnerId && (
                          <button 
                            className="text-primary-500 hover:text-primary-700 mr-3" 
                            title="Assign Partner"
                            onClick={() => handleAssignOrder(order)}
                          >
                            <i className="ri-user-add-line"></i>
                          </button>
                        )}
                        <button 
                          className="text-primary-500 hover:text-primary-700 mr-3" 
                          title="Update Status"
                          onClick={() => handleUpdateStatus(order)}
                        >
                          <i className="ri-refresh-line"></i>
                        </button>
                        <button 
                          className="text-primary-500 hover:text-primary-700" 
                          title="View Details"
                        >
                          <i className="ri-eye-line"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-neutral-500">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {orders && orders.length > 0 && (
          <div className="p-4 border-t border-neutral-200 flex justify-between items-center">
            <div className="text-sm text-neutral-500">
              Showing <span className="font-medium">{currentOrders.length}</span> of <span className="font-medium">{orders.length}</span> orders
            </div>
            <div className="flex">
              <button 
                className={`mx-1 w-8 h-8 flex items-center justify-center rounded border text-neutral-500 ${
                  currentPage === 1 
                    ? 'border-neutral-300 opacity-50 cursor-not-allowed hover:bg-white' 
                    : 'border-neutral-300 hover:bg-neutral-100'
                }`}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <i className="ri-arrow-left-s-line"></i>
              </button>
              
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button 
                    key={pageNum}
                    className={`mx-1 w-8 h-8 flex items-center justify-center rounded border ${
                      currentPage === pageNum 
                        ? 'bg-primary-500 text-white border-primary-500' 
                        : 'border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                    }`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button 
                className={`mx-1 w-8 h-8 flex items-center justify-center rounded border text-neutral-500 ${
                  currentPage === totalPages 
                    ? 'border-neutral-300 opacity-50 cursor-not-allowed hover:bg-white' 
                    : 'border-neutral-300 hover:bg-neutral-100'
                }`}
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                <i className="ri-arrow-right-s-line"></i>
              </button>
            </div>
          </div>
        )}
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

      {/* Update Status Modal */}
      {showStatusModal && selectedOrder && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowStatusModal(false)}></div>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md z-10 relative">
            <div className="p-5 border-b border-neutral-200 flex justify-between items-center">
              <h3 className="font-semibold text-lg">Update Order Status</h3>
              <button className="text-neutral-500 hover:text-neutral-700" onClick={() => setShowStatusModal(false)}>
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            
            <div className="p-5">
              <div className="mb-4">
                <p className="font-medium">Order Details</p>
                <p className="text-sm text-neutral-500">{selectedOrder.orderNumber} - {selectedOrder.location}</p>
                <p className="text-sm">
                  Current Status: <StatusBadge status={selectedOrder.status} className="ml-2" />
                </p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  New Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    className={`p-2 rounded border ${selectedOrder.status === 'pending' ? 'bg-primary-500 text-white' : 'border-neutral-300 hover:bg-neutral-50'}`}
                    onClick={() => updateStatusMutation.mutate({ orderId: selectedOrder.id, status: 'pending' })}
                  >
                    Pending
                  </button>
                  <button 
                    className={`p-2 rounded border ${selectedOrder.status === 'in_progress' ? 'bg-primary-500 text-white' : 'border-neutral-300 hover:bg-neutral-50'}`}
                    onClick={() => updateStatusMutation.mutate({ orderId: selectedOrder.id, status: 'in_progress' })}
                  >
                    In Progress
                  </button>
                  <button 
                    className={`p-2 rounded border ${selectedOrder.status === 'completed' ? 'bg-primary-500 text-white' : 'border-neutral-300 hover:bg-neutral-50'}`}
                    onClick={() => updateStatusMutation.mutate({ orderId: selectedOrder.id, status: 'completed' })}
                  >
                    Completed
                  </button>
                  <button 
                    className={`p-2 rounded border ${selectedOrder.status === 'unassigned' ? 'bg-primary-500 text-white' : 'border-neutral-300 hover:bg-neutral-50'}`}
                    onClick={() => updateStatusMutation.mutate({ orderId: selectedOrder.id, status: 'unassigned' })}
                  >
                    Unassigned
                  </button>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button 
                  className="px-4 py-2 border border-neutral-300 rounded-md text-neutral-700 hover:bg-neutral-50"
                  onClick={() => setShowStatusModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderTable;
