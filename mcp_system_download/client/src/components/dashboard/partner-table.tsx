import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import StatusBadge from "../ui/status-badge";
import { AddPartnerModal } from "../modals/add-partner-modal";
import { AddFundsModal } from "../modals/add-funds-modal";
import { useToast } from "@/hooks/use-toast";

type Partner = {
  id: number;
  name: string;
  phone: string;
  isActive: boolean;
  walletBalance: string;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
};

const PartnerTable = () => {
  const { data: partners, isLoading } = useQuery<Partner[]>({
    queryKey: ["/api/partners"],
  });
  
  const [showAddPartnerModal, setShowAddPartnerModal] = useState(false);
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  
  const partnersPerPage = 5;
  const indexOfLastPartner = currentPage * partnersPerPage;
  const indexOfFirstPartner = indexOfLastPartner - partnersPerPage;
  const currentPartners = partners?.slice(indexOfFirstPartner, indexOfLastPartner) || [];
  const totalPages = partners ? Math.ceil(partners.length / partnersPerPage) : 0;
  
  const deletePartnerMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/partners/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partners"] });
      toast({
        title: "Partner Deleted",
        description: "The pickup partner has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete partner: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const handleDeletePartner = (partner: Partner) => {
    if (window.confirm(`Are you sure you want to remove ${partner.name}?`)) {
      deletePartnerMutation.mutate(partner.id);
    }
  };
  
  const handleAddFunds = (partner: Partner) => {
    setSelectedPartner(partner);
    setShowAddFundsModal(true);
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
      <div className="bg-white rounded-lg shadow">
        <div className="p-5 border-b border-neutral-200 flex justify-between items-center">
          <h3 className="font-semibold text-lg">Pickup Partners</h3>
          <button 
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md flex items-center text-sm"
            onClick={() => setShowAddPartnerModal(true)}
          >
            <i className="ri-add-line mr-1"></i> Add Partner
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-100 text-left">
                <th className="p-4 font-medium text-neutral-600 text-sm">Partner</th>
                <th className="p-4 font-medium text-neutral-600 text-sm">Status</th>
                <th className="p-4 font-medium text-neutral-600 text-sm">Wallet</th>
                <th className="p-4 font-medium text-neutral-600 text-sm">Orders</th>
                <th className="p-4 font-medium text-neutral-600 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentPartners.length > 0 ? (
                currentPartners.map((partner) => (
                  <tr key={partner.id} className="border-b border-neutral-200 hover:bg-neutral-50">
                    <td className="p-4">
                      <div className="flex items-center">
                        <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-500 font-medium">
                          {partner.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium">{partner.name}</p>
                          <p className="text-xs text-neutral-500">{partner.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={partner.isActive ? "active" : "inactive"} />
                    </td>
                    <td className="p-4 font-mono">₹{parseFloat(partner.walletBalance).toFixed(2)}</td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <span className="text-neutral-700 font-medium">{partner.totalOrders}</span>
                        <div className="ml-2 flex items-center">
                          <span className="text-xs text-success-500">{partner.completedOrders}</span>
                          <span className="mx-1 text-neutral-400">/</span>
                          <span className="text-xs text-error-500">{partner.pendingOrders}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex">
                        <button 
                          className="text-primary-500 hover:text-primary-700 mr-3" 
                          title="View Details"
                          onClick={() => window.location.href = `/partners/${partner.id}`}
                        >
                          <i className="ri-eye-line"></i>
                        </button>
                        <button 
                          className="text-primary-500 hover:text-primary-700 mr-3" 
                          title="Add Funds"
                          onClick={() => handleAddFunds(partner)}
                        >
                          <i className="ri-wallet-3-line"></i>
                        </button>
                        <button 
                          className="text-error-500 hover:text-error-700" 
                          title="Remove Partner"
                          onClick={() => handleDeletePartner(partner)}
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-neutral-500">
                    No partners found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {partners && partners.length > 0 && (
          <div className="p-4 border-t border-neutral-200 flex justify-between items-center">
            <div className="text-sm text-neutral-500">
              Showing <span className="font-medium">{currentPartners.length}</span> of <span className="font-medium">{partners.length}</span> partners
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
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button 
                  key={page}
                  className={`mx-1 w-8 h-8 flex items-center justify-center rounded border ${
                    currentPage === page 
                      ? 'bg-primary-500 text-white border-primary-500' 
                      : 'border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                  }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
              
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
      
      <AddPartnerModal 
        isOpen={showAddPartnerModal} 
        onClose={() => setShowAddPartnerModal(false)} 
      />
      
      {selectedPartner && (
        <AddFundsModal 
          isOpen={showAddFundsModal} 
          onClose={() => setShowAddFundsModal(false)} 
          partner={selectedPartner}
        />
      )}
    </>
  );
};

export default PartnerTable;
