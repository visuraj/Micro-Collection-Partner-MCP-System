import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PickupPartner } from "@/types";
import AddPartnerModal from "@/components/modals/AddPartnerModal";
import { useToast } from "@/hooks/use-toast";

interface PartnersTableProps {
  mcpId: number;
}

export function PartnersTable({ mcpId }: PartnersTableProps) {
  const { toast } = useToast();
  const [isAddPartnerModalOpen, setIsAddPartnerModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const partnersPerPage = 4;

  const { data: partners, isLoading } = useQuery<PickupPartner[]>({
    queryKey: [`/api/partners/${mcpId}`],
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

  const handleAddFunds = (partnerId: number) => {
    const amount = prompt("Enter amount to add to partner's wallet:");
    if (amount && !isNaN(Number(amount)) && Number(amount) > 0) {
      addFundsMutation.mutate({ partnerId, amount: Number(amount) });
    }
  };

  // Calculate pagination
  const activePartners = partners?.filter(p => p.status === 'active') || [];
  const totalActivePartners = activePartners.length;
  
  const indexOfLastPartner = currentPage * partnersPerPage;
  const indexOfFirstPartner = indexOfLastPartner - partnersPerPage;
  const currentPartners = activePartners.slice(indexOfFirstPartner, indexOfLastPartner);

  const goToNextPage = () => {
    if (currentPage < Math.ceil(totalActivePartners / partnersPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="p-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center mb-4">
              <Skeleton className="h-10 w-10 rounded-full mr-3" />
              <div className="flex-1">
                <Skeleton className="h-4 w-48 mb-2" />
                <Skeleton className="h-3 w-32" />
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
          <h3 className="font-semibold text-neutral-dark">Active Pickup Partners</h3>
          <Button 
            size="sm"
            onClick={() => setIsAddPartnerModalOpen(true)}
            className="flex items-center"
          >
            <span className="material-icons text-sm mr-1">add_circle</span>
            Add Partner
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partner</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentPartners.map((partner) => {
                // For a real app, we'd get these from API
                const completedOrders = Math.floor(Math.random() * 30);
                const pendingOrders = Math.floor(Math.random() * 5);
                
                return (
                  <tr key={partner.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                          <span className="material-icons">person</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{partner.name}</div>
                          <div className="text-sm text-gray-500">{partner.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        Number(partner.wallet_balance) < 500 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {Number(partner.wallet_balance) < 500 ? 'Low Funds' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{completedOrders} completed</div>
                      <div>{pendingOrders} pending</div>
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
                          className="text-gray-600 hover:text-gray-900" 
                          title="View Details"
                        >
                          <span className="material-icons text-sm">visibility</span>
                        </button>
                        <button 
                          className="text-gray-600 hover:text-gray-900" 
                          title="Edit"
                        >
                          <span className="material-icons text-sm">edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{Math.min(partnersPerPage, totalActivePartners)}</span> of <span className="font-medium">{totalActivePartners}</span> active partners
          </div>
          <div className="flex space-x-2">
            <button 
              className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <button 
              className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              onClick={goToNextPage}
              disabled={currentPage >= Math.ceil(totalActivePartners / partnersPerPage)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add Partner Modal */}
      <AddPartnerModal 
        open={isAddPartnerModalOpen} 
        onOpenChange={setIsAddPartnerModalOpen} 
        mcpId={mcpId}
      />
    </>
  );
}

export default PartnersTable;
