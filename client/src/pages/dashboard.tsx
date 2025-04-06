import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Wallet, Users, PackageCheck, CreditCard } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PickupPartnerTable } from "@/components/dashboard/PickupPartnerTable";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { Notifications } from "@/components/dashboard/Notifications";
import { AddFundsModal } from "@/components/modals/AddFundsModal";
import { AddPartnerModal } from "@/components/modals/AddPartnerModal";

interface DashboardStats {
  walletBalance: number;
  totalPartners: number;
  activePartners: number;
  inactivePartners: number;
  totalOrders: number;
  pendingOrders: number;
  inProgressOrders: number;
  completedOrders: number;
  todaysEarnings: number;
}

export default function Dashboard() {
  const [addFundsOpen, setAddFundsOpen] = useState(false);
  const [addPartnerOpen, setAddPartnerOpen] = useState(false);
  
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const defaultStats = {
    walletBalance: 0,
    totalPartners: 0,
    activePartners: 0,
    inactivePartners: 0,
    totalOrders: 0,
    pendingOrders: 0,
    inProgressOrders: 0,
    completedOrders: 0,
    todaysEarnings: 0
  };

  const dashboardStats = stats || defaultStats;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Dashboard Header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
              <h1 className="text-2xl font-semibold text-gray-800">Dashboard Overview</h1>
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

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard 
                title="Wallet Balance" 
                value={`₹${dashboardStats.walletBalance.toFixed(2)}`}
                icon={<Wallet size={24} />}
                changeValue={3.2}
                changeLabel="from last week"
                status="increase"
              />
              
              <StatCard 
                title="Total Partners" 
                value={dashboardStats.totalPartners}
                icon={<Users size={24} />}
              >
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Active:</span>
                  <span className="font-medium">{dashboardStats.activePartners}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500">Inactive:</span>
                  <span className="font-medium">{dashboardStats.inactivePartners}</span>
                </div>
              </StatCard>
              
              <StatCard 
                title="Total Orders (Today)" 
                value={dashboardStats.totalOrders}
                icon={<PackageCheck size={24} />}
              >
                <div className="mt-1 grid grid-cols-3 gap-1">
                  <div className="text-center p-1 rounded bg-blue-50">
                    <div className="text-sm font-medium">{dashboardStats.pendingOrders}</div>
                    <div className="text-xs text-gray-500">Pending</div>
                  </div>
                  <div className="text-center p-1 rounded bg-yellow-50">
                    <div className="text-sm font-medium">{dashboardStats.inProgressOrders}</div>
                    <div className="text-xs text-gray-500">In Progress</div>
                  </div>
                  <div className="text-center p-1 rounded bg-green-50">
                    <div className="text-sm font-medium">{dashboardStats.completedOrders}</div>
                    <div className="text-xs text-gray-500">Completed</div>
                  </div>
                </div>
              </StatCard>
              
              <StatCard 
                title="Today's Earnings" 
                value={`₹${dashboardStats.todaysEarnings.toFixed(2)}`}
                icon={<CreditCard size={24} />}
                changeValue={1.5}
                changeLabel="from yesterday"
                status="decrease"
              />
            </div>

            {/* Tabs Section */}
            <Tabs defaultValue="partners" className="mb-6">
              <TabsList className="bg-white border rounded-lg">
                <TabsTrigger value="partners">Pickup Partners</TabsTrigger>
                <TabsTrigger value="recent-orders">Recent Orders</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="partners" className="mt-4">
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Pickup Partners</h2>
                    <Button 
                      variant="outline" 
                      className="border-primary-500 hover:bg-primary-50 text-primary-500"
                      onClick={() => setAddPartnerOpen(true)}
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                      </svg>
                      Add Partner
                    </Button>
                  </div>
                  <PickupPartnerTable />
                </div>
              </TabsContent>
              
              <TabsContent value="recent-orders" className="mt-4">
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
                  <p className="text-gray-500">Orders view will be implemented in future updates</p>
                </div>
              </TabsContent>
              
              <TabsContent value="transactions" className="mt-4">
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <h2 className="text-lg font-semibold mb-4">Transactions</h2>
                  <p className="text-gray-500">Detailed transaction view will be implemented in future updates</p>
                </div>
              </TabsContent>
            </Tabs>

            {/* Recent Activity & Notifications Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecentTransactions />
              <Notifications />
            </div>
          </div>
        </main>
      </div>
      
      {/* Modals */}
      <AddFundsModal open={addFundsOpen} onOpenChange={setAddFundsOpen} />
      <AddPartnerModal open={addPartnerOpen} onOpenChange={setAddPartnerOpen} />
    </div>
  );
}
