import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PickupPartner } from "@/types";
import { formatCurrency } from "@/lib/utils";
import AddPartnerModal from "@/components/modals/AddPartnerModal";

interface PartnersProps {
  mcpId: number;
}

export default function Partners({ mcpId }: PartnersProps) {
  const { toast } = useToast();
  const [isAddPartnerModalOpen, setIsAddPartnerModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const { data: partners, isLoading } = useQuery<PickupPartner[]>({
    queryKey: [`/api/partners/${mcpId}`],
  });

  const deletePartnerMutation = useMutation({
    mutationFn: async (partnerId: number) => {
      const response = await apiRequest(
        "DELETE", 
        `/api/partners/${partnerId}`,
        {}
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/partners/${mcpId}`] });
      toast({
        title: "Partner deleted successfully",
        description: "The pickup partner has been removed.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error deleting partner",
        description: error.message || "An error occurred while deleting the partner.",
      });
    }
  });

  const addFundsMutation = useMutation({
    mutationFn: async ({ partnerId, amount }: { partnerId: number, amount: number }) => {
      const response = await apiRequest(
        "POST", 
        `/api/partners/${partnerId}/add-funds`,
        { amount, mcpId }
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/partners/${mcpId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/mcp/${mcpId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/transactions/${mcpId}`] });
      toast({
        title: "Funds added successfully",
        description: "The partner's wallet has been updated.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error adding funds",
        description: error.message || "An error occurred while adding funds.",
      });
    }
  });

  const updatePartnerStatusMutation = useMutation({
    mutationFn: async ({ partnerId, status }: { partnerId: number, status: string }) => {
      const response = await apiRequest(
        "PUT", 
        `/api/partners/${partnerId}`,
        { status }
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/partners/${mcpId}`] });
      toast({
        title: "Partner status updated",
        description: "The partner's status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error updating status",
        description: error.message || "An error occurred while updating the partner's status.",
      });
    }
  });

  const handleAddFunds = (partnerId: number) => {
    const amount = prompt("Enter amount to add to partner's wallet:");
    if (amount && !isNaN(Number(amount)) && Number(amount) > 0) {
      addFundsMutation.mutate({ partnerId, amount: Number(amount) });
    }
  };

  const handleUpdateStatus = (partnerId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const confirmed = window.confirm(`Are you sure you want to change the partner's status to ${newStatus}?`);
    if (confirmed) {
      updatePartnerStatusMutation.mutate({ partnerId, status: newStatus });
    }
  };

  const handleDeletePartner = (partnerId: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this partner? This action cannot be undone.");
    if (confirmed) {
      deletePartnerMutation.mutate(partnerId);
    }
  };

  // Filter partners based on selected status
  const filteredPartners = partners?.filter(partner => {
    if (!selectedStatus) return true;
    return partner.status === selectedStatus;
  });

  // Get order counts (in a real app, this would come from the API)
  const getOrderCounts = (partnerId: number) => {
    // Placeholder for demo
    const completed = Math.floor(Math.random() * 30);
    const pending = Math.floor(Math.random() * 5);
    return { completed, pending };
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  // Calculate summary stats
  const totalPartners = partners?.length || 0;
  const activePartners = partners?.filter(p => p.status === 'active').length || 0;
  const inactivePartners = totalPartners - activePartners;
  const totalBalance = partners?.reduce((sum, partner) => sum + Number(partner.wallet_balance), 0) || 0;

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-2xl font-bold mb-2 md:mb-0">Pickup Partners</h2>
        <Button onClick={() => setIsAddPartnerModalOpen(true)}>
          <span className="material-icons mr-2">add_circle</span>
          Add New Partner
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Total Partners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span className="text-3xl font-bold">{totalPartners}</span>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-primary">
                <span className="material-icons">group</span>
              </div>
            </div>
            <div className="flex mt-2 space-x-2">
              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                {activePartners} Active
              </span>
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                {inactivePartners} Inactive
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Partners Wallet Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span className="text-3xl font-bold">{formatCurrency(totalBalance)}</span>
              <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center text-secondary">
                <span className="material-icons">account_balance_wallet</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Total funds across all partner wallets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Status Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Button 
                variant={selectedStatus === null ? "default" : "outline"} 
                size="sm"
                onClick={() => setSelectedStatus(null)}
              >
                All
              </Button>
              <Button 
                variant={selectedStatus === "active" ? "default" : "outline"} 
                size="sm"
                onClick={() => setSelectedStatus("active")}
              >
                Active
              </Button>
              <Button 
                variant={selectedStatus === "inactive" ? "default" : "outline"} 
                size="sm"
                onClick={() => setSelectedStatus("inactive")}
              >
                Inactive
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Partners Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Partners List</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partner</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPartners && filteredPartners.length > 0 ? (
                filteredPartners.map((partner) => {
                  const { completed, pending } = getOrderCounts(partner.id);
                  
                  return (
                    <tr key={partner.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                            <span className="material-icons">person</span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{partner.name}</div>
                            <div className="text-xs text-gray-500">{partner.phone}</div>
                            <div className="text-xs text-gray-500">{partner.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          partner.status === 'active'
                            ? Number(partner.wallet_balance) < 500 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {partner.status === 'active'
                            ? Number(partner.wallet_balance) < 500
                              ? 'Low Funds'
                              : 'Active'
                            : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {partner.commission_type === 'percentage'
                          ? `${partner.commission_value}%`
                          : formatCurrency(partner.commission_value)}
                        <div className="text-xs text-gray-400">
                          {partner.commission_type === 'percentage' ? 'Percentage' : 'Fixed'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{completed} completed</div>
                        <div>{pending} pending</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono font-medium">
                        {formatCurrency(partner.wallet_balance)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            className="text-primary hover:text-primary-dark" 
                            title="Add Funds"
                            onClick={() => handleAddFunds(partner.id)}
                          >
                            <span className="material-icons text-sm">account_balance_wallet</span>
                          </button>
                          <button 
                            className={`${
                              partner.status === 'active' ? 'text-green-600' : 'text-gray-500'
                            } hover:text-gray-900`} 
                            title={partner.status === 'active' ? "Deactivate" : "Activate"}
                            onClick={() => handleUpdateStatus(partner.id, partner.status)}
                          >
                            <span className="material-icons text-sm">
                              {partner.status === 'active' ? 'toggle_on' : 'toggle_off'}
                            </span>
                          </button>
                          <button 
                            className="text-gray-600 hover:text-gray-900" 
                            title="Edit"
                          >
                            <span className="material-icons text-sm">edit</span>
                          </button>
                          <button 
                            className="text-red-500 hover:text-red-700" 
                            title="Delete"
                            onClick={() => handleDeletePartner(partner.id)}
                          >
                            <span className="material-icons text-sm">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    {partners?.length 
                      ? "No partners match the selected filter" 
                      : "No partners found. Add your first pickup partner to get started!"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Partner Modal */}
      <AddPartnerModal 
        open={isAddPartnerModalOpen} 
        onOpenChange={setIsAddPartnerModalOpen} 
        mcpId={mcpId}
      />
    </div>
  );
}
