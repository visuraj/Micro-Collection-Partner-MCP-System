import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddFundsModal } from "@/components/modals/AddFundsModal";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { PickupPartnerTable } from "@/components/dashboard/PickupPartnerTable";

export default function Wallet() {
  const [addFundsOpen, setAddFundsOpen] = useState(false);
  
  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const walletBalance = stats?.walletBalance || 0;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
              <h1 className="text-2xl font-semibold text-gray-800">Wallet Management</h1>
              <div className="mt-3 md:mt-0">
                <Button 
                  className="bg-primary-500 hover:bg-primary-600 text-white"
                  onClick={() => setAddFundsOpen(true)}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Add Funds
                </Button>
              </div>
            </div>

            <div className="mb-6">
              <Card className="bg-white border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Wallet Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="text-3xl font-bold">₹{walletBalance.toFixed(2)}</div>
                      <p className="text-sm text-gray-500 mt-1">Available Balance</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex space-x-2">
                      <Button onClick={() => setAddFundsOpen(true)}>Add Funds</Button>
                      <Button variant="outline">Withdraw</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="transactions" className="mb-6">
              <TabsList className="bg-white border rounded-lg">
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="partners-wallet">Partners Wallet</TabsTrigger>
              </TabsList>
              
              <TabsContent value="transactions" className="mt-4">
                <RecentTransactions />
              </TabsContent>
              
              <TabsContent value="partners-wallet" className="mt-4">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-4">Partner Wallet Status</h2>
                  <PickupPartnerTable />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      
      {/* Modals */}
      <AddFundsModal open={addFundsOpen} onOpenChange={setAddFundsOpen} />
    </div>
  );
}
