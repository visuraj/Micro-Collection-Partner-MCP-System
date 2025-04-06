import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PickupPartner } from "@shared/schema";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { AddPartnerModal } from "@/components/modals/AddPartnerModal";
import { PickupPartnerTable } from "@/components/dashboard/PickupPartnerTable";

export default function Partners() {
  const [addPartnerOpen, setAddPartnerOpen] = useState(false);
  
  const { data: partners = [], isLoading: isLoadingPartners } = useQuery<PickupPartner[]>({
    queryKey: ["/api/partners"],
  });

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
              <h1 className="text-2xl font-semibold text-gray-800">Pickup Partners</h1>
              <div className="mt-3 md:mt-0">
                <Button 
                  className="bg-primary-500 hover:bg-primary-600 text-white"
                  onClick={() => setAddPartnerOpen(true)}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                  </svg>
                  Add Partner
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border">
              <h2 className="text-lg font-semibold mb-4">Partner Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="font-semibold text-gray-700">Total Partners</div>
                  <div className="text-2xl font-bold mt-1">{partners.length}</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="font-semibold text-gray-700">Active Partners</div>
                  <div className="text-2xl font-bold mt-1">{partners.filter(p => p.isActive).length}</div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="font-semibold text-gray-700">Inactive Partners</div>
                  <div className="text-2xl font-bold mt-1">{partners.filter(p => !p.isActive).length}</div>
                </div>
              </div>
            </div>

            <PickupPartnerTable />
          </div>
        </main>
      </div>
      
      {/* Modals */}
      <AddPartnerModal open={addPartnerOpen} onOpenChange={setAddPartnerOpen} />
    </div>
  );
}
