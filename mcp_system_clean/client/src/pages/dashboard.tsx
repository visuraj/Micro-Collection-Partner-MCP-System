import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSidebar } from "@/context/SidebarContext";
import DashboardCard from "@/components/dashboard/dashboard-card";
import PartnerTable from "@/components/dashboard/partner-table";
import OrderList from "@/components/dashboard/order-list";
import TransactionList from "@/components/dashboard/transaction-list";
import { useMobile } from "@/hooks/use-mobile";

const Dashboard = () => {
  const { toggleSidebar } = useSidebar();
  const isMobile = useMobile();
  
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard"],
  });
  
  const { data: userData } = useQuery({
    queryKey: ["/api/user/current"],
  });

  return (
    <>
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-neutral-200">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center md:hidden">
            <button onClick={toggleSidebar} className="text-neutral-500 hover:text-neutral-700">
              <i className="ri-menu-line text-2xl"></i>
            </button>
            <h1 className="ml-3 text-lg font-semibold">MCP Dashboard</h1>
          </div>
          
          <div className="hidden md:block">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 rounded-md border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-64"
              />
              <i className="ri-search-line absolute left-3 top-2.5 text-neutral-400"></i>
            </div>
          </div>
          
          <div className="flex items-center">
            <button className="relative text-neutral-500 hover:text-neutral-700 p-2">
              <i className="ri-notification-2-line text-xl"></i>
              <span className="absolute top-1 right-1 w-4 h-4 bg-error-500 rounded-full text-white text-xs flex items-center justify-center">
                3
              </span>
            </button>
            <button className="md:hidden text-neutral-500 hover:text-neutral-700 p-2 ml-2">
              <i className="ri-search-line text-xl"></i>
            </button>
          </div>
        </div>
      </header>
      
      {/* Dashboard Content */}
      <main className="p-4 md:p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">Dashboard</h2>
          <p className="text-neutral-500">Welcome back, {userData?.name || 'User'}</p>
        </div>

        {/* Dashboard Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isLoading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="animate-pulse space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="h-4 bg-neutral-200 rounded w-1/3"></div>
                      <div className="w-10 h-10 bg-neutral-200 rounded-full"></div>
                    </div>
                    <div className="h-7 bg-neutral-200 rounded w-1/2 mt-2"></div>
                    <div className="h-4 bg-neutral-200 rounded w-full mt-4"></div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              <DashboardCard
                title="Wallet Balance"
                value={`₹${parseFloat(dashboardData?.wallet?.balance || "0").toFixed(2)}`}
                icon="ri-wallet-3-line"
                iconBgColor="bg-primary-50"
                iconColor="text-primary-500"
              >
                <div className="flex items-center">
                  <button className="text-primary-500 hover:text-primary-700 flex items-center text-sm">
                    <i className="ri-add-line mr-1"></i> Add Funds
                  </button>
                  <span className="mx-2 text-neutral-300">|</span>
                  <button className="text-primary-500 hover:text-primary-700 flex items-center text-sm">
                    <i className="ri-download-line mr-1"></i> Withdraw
                  </button>
                </div>
              </DashboardCard>
              
              <DashboardCard
                title="Pickup Partners"
                value={dashboardData?.partners?.count.toString() || "0"}
                icon="ri-user-3-line"
                iconBgColor="bg-success-50"
                iconColor="text-success-500"
              >
                <div className="mt-2 flex items-center">
                  <span className="text-success-500 flex items-center text-sm">
                    <i className="ri-arrow-up-line mr-1"></i> +{dashboardData?.partners?.newThisWeek || 0} this week
                  </span>
                  <span className="ml-auto text-primary-500 hover:text-primary-700 text-sm cursor-pointer">
                    View all
                  </span>
                </div>
              </DashboardCard>
              
              <DashboardCard
                title="Total Orders"
                value={dashboardData?.orders?.total.toString() || "0"}
                icon="ri-shopping-bag-line"
                iconBgColor="bg-warning-50"
                iconColor="text-warning-500"
              >
                <div className="mt-2 flex">
                  <div className="text-sm">
                    <span className="text-success-500 font-medium">{dashboardData?.orders?.completed || 0}</span> Completed
                  </div>
                  <div className="text-sm ml-4">
                    <span className="text-error-500 font-medium">{dashboardData?.orders?.pending || 0}</span> Pending
                  </div>
                </div>
              </DashboardCard>
              
              <DashboardCard
                title="Today's Earnings"
                value={`₹${dashboardData?.earnings?.today || "0"}`}
                icon="ri-money-rupee-circle-line"
                iconBgColor="bg-primary-50"
                iconColor="text-primary-500"
              >
                <div className="mt-2 flex items-center">
                  <span className="text-success-500 flex items-center text-sm">
                    <i className="ri-arrow-up-line mr-1"></i> 12% ↑ from yesterday
                  </span>
                </div>
              </DashboardCard>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pickup Partners Section */}
          <div className="lg:col-span-2">
            <PartnerTable />
          </div>
          
          {/* Recent Orders and Transactions Section */}
          <div>
            <OrderList />
            
            <div className="mt-6">
              <TransactionList />
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Dashboard;
