import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDistance } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";
import { Order, PickupPartner } from "@/types";
import AssignOrderModal from "@/components/modals/AssignOrderModal";

interface OrdersProps {
  mcpId: number;
}

export default function Orders({ mcpId }: OrdersProps) {
  const { toast } = useToast();
  const [isAssignOrderModalOpen, setIsAssignOrderModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: [`/api/orders/${mcpId}`],
  });

  const { data: partners, isLoading: partnersLoading } = useQuery<PickupPartner[]>({
    queryKey: [`/api/partners/${mcpId}`],
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number, status: string }) => {
      const response = await apiRequest(
        "PUT", 
        `/api/orders/${orderId}/status`, 
        { status }
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/orders/${mcpId}`] });
      toast({
        title: "Order status updated",
        description: "The order status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error updating order",
        description: error.message || "An error occurred while updating the order.",
      });
    }
  });

  const assignOrderMutation = useMutation({
    mutationFn: async ({ orderId, partnerId }: { orderId: number, partnerId: number }) => {
      const response = await apiRequest(
        "PUT", 
        `/api/orders/${orderId}/assign`, 
        { partnerId }
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/orders/${mcpId}`] });
      toast({
        title: "Order assigned",
        description: "The order has been assigned to the pickup partner.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error assigning order",
        description: error.message || "An error occurred while assigning the order.",
      });
    }
  });

  const isLoading = ordersLoading || partnersLoading;

  // Filter orders based on selected status
  const filteredOrders = orders?.filter(order => {
    if (statusFilter === "all") return true;
    return order.status === statusFilter;
  }) || [];

  // Sort orders by created_at (newest first)
  const sortedOrders = [...filteredOrders].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Find partner by ID
  const getPartnerById = (id?: number) => {
    if (!id) return null;
    return partners?.find(p => p.id === id);
  };

  // Format date to readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "PPp"); // e.g., "Mar 15, 2023, 3:25 PM"
  };

  // Get time ago
  const getTimeAgo = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  // Handle status update
  const handleUpdateStatus = (orderId: number, newStatus: string) => {
    updateOrderStatusMutation.mutate({ orderId, status: newStatus });
  };

  // Handle partner assignment
  const handleAssignPartner = (orderId: number) => {
    if (!partners || partners.length === 0) {
      toast({
        variant: "destructive",
        title: "No partners available",
        description: "Please add pickup partners before assigning orders.",
      });
      return;
    }

    const partnerId = prompt("Enter partner ID to assign:");
    if (partnerId && !isNaN(Number(partnerId))) {
      const partner = getPartnerById(Number(partnerId));
      if (!partner) {
        toast({
          variant: "destructive",
          title: "Invalid partner ID",
          description: "Could not find a partner with that ID.",
        });
        return;
      }
      
      assignOrderMutation.mutate({ 
        orderId, 
        partnerId: Number(partnerId) 
      });
    }
  };

  // Get status badge class
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

  // Calculate summary stats
  const calculateStats = () => {
    if (!orders) return { total: 0, completed: 0, inProgress: 0, pending: 0, cancelled: 0 };
    
    const total = orders.length;
    const completed = orders.filter(o => o.status === 'completed').length;
    const inProgress = orders.filter(o => o.status === 'in_progress').length;
    const pending = orders.filter(o => o.status === 'pending').length;
    const cancelled = orders.filter(o => o.status === 'cancelled').length;
    
    return { total, completed, inProgress, pending, cancelled };
  };

  const stats = calculateStats();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-2xl font-bold mb-2 md:mb-0">Order Management</h2>
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={() => setIsAssignOrderModalOpen(true)}>
            <span className="material-icons mr-2">add_circle</span>
            Create Order
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span className="text-3xl font-bold">{stats.total}</span>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-primary">
                <span className="material-icons">assignment</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span className="text-3xl font-bold">{stats.completed}</span>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-success">
                <span className="material-icons">check_circle</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span className="text-3xl font-bold">{stats.inProgress}</span>
              <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center text-accent">
                <span className="material-icons">directions_bike</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span className="text-3xl font-bold">{stats.pending}</span>
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-warning">
                <span className="material-icons">pending</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Cancelled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span className="text-3xl font-bold">{stats.cancelled}</span>
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-danger">
                <span className="material-icons">cancel</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders List</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pickup Address</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedOrders.length > 0 ? (
                sortedOrders.map((order) => {
                  const partner = getPartnerById(order.partnerId);
                  
                  return (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.customer_name}</div>
                        <div className="text-xs text-gray-500">{order.customer_phone}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="max-w-xs truncate">{order.pickup_address}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 font-mono">
                        {formatCurrency(order.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {partner ? (
                          <div className="flex items-center">
                            <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mr-2">
                              <span className="material-icons text-xs">person</span>
                            </div>
                            <span>{partner.name}</span>
                          </div>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            disabled={order.status === 'completed' || order.status === 'cancelled'}
                            onClick={() => handleAssignPartner(order.id)}
                          >
                            Assign
                          </Button>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div title={formatDate(order.created_at)}>{getTimeAgo(order.created_at)}</div>
                        {order.completed_at && (
                          <div className="text-xs text-green-600">
                            Completed: {getTimeAgo(order.completed_at)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {order.status === 'pending' && order.partnerId && (
                            <button
                              className="text-yellow-600 hover:text-yellow-800"
                              title="Start Order"
                              onClick={() => handleUpdateStatus(order.id, 'in_progress')}
                            >
                              <span className="material-icons text-sm">play_arrow</span>
                            </button>
                          )}
                          {order.status === 'in_progress' && (
                            <button
                              className="text-green-600 hover:text-green-800"
                              title="Complete Order"
                              onClick={() => handleUpdateStatus(order.id, 'completed')}
                            >
                              <span className="material-icons text-sm">check_circle</span>
                            </button>
                          )}
                          {(order.status === 'pending' || order.status === 'in_progress') && (
                            <button
                              className="text-red-600 hover:text-red-800"
                              title="Cancel Order"
                              onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                            >
                              <span className="material-icons text-sm">cancel</span>
                            </button>
                          )}
                          <button
                            className="text-gray-600 hover:text-gray-900"
                            title="View Details"
                          >
                            <span className="material-icons text-sm">visibility</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    {orders?.length 
                      ? "No orders match the selected filter" 
                      : "No orders found. Create your first order to get started!"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Order Modal */}
      <AssignOrderModal 
        open={isAssignOrderModalOpen} 
        onOpenChange={setIsAssignOrderModalOpen} 
        mcpId={mcpId}
        partners={partners || []}
      />
    </div>
  );
}
