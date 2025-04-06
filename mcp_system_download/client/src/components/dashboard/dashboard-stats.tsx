import React, { useState } from "react";
import StatsCard from "./stats-card";
import { Button } from "@/components/ui/button";
import AddFundsModal from "@/components/modals/add-funds-modal";
import WithdrawFundsModal from "@/components/modals/withdraw-funds-modal";
import { useQuery } from "@tanstack/react-query";

const DashboardStats: React.FC = () => {
  const [isAddFundsModalOpen, setIsAddFundsModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  
  // Mock the wallet data for now - in a real app, this would fetch from the API
  const { data: wallet, isLoading: isWalletLoading } = useQuery({
    queryKey: ["/api/wallets/user/1"],
    staleTime: 1000 * 60, // 1 minute
  });

  // Mock partners data
  const { data: partners, isLoading: isPartnersLoading } = useQuery({
    queryKey: ["/api/partners"],
    staleTime: 1000 * 60, // 1 minute
  });

  // Mock orders data
  const { data: orders, isLoading: isOrdersLoading } = useQuery({
    queryKey: ["/api/orders"],
    staleTime: 1000 * 60, // 1 minute
  });

  // Mock transactions data for today
  const { data: transactions, isLoading: isTransactionsLoading } = useQuery({
    queryKey: ["/api/transactions"],
    staleTime: 1000 * 60, // 1 minute
  });

  // Calculate stats from data
  const activePartners = partners?.filter(p => p.status === "active").length || 0;
  const inactivePartners = partners?.filter(p => p.status === "inactive").length || 0;
  const totalPartners = partners?.length || 0;
  
  const pendingOrders = orders?.filter(o => o.status === "pending").length || 0;
  const inProgressOrders = orders?.filter(o => o.status === "in_progress").length || 0;
  const completedOrders = orders?.filter(o => o.status === "completed").length || 0;
  const totalOrders = orders?.length || 0;

  // Calculate today's transactions
  const today = new Date().toISOString().split('T')[0];
  const todayTransactions = transactions?.filter(t => {
    if (t.metadata?.date) {
      return t.metadata.date.startsWith(today);
    }
    return t.createdAt.startsWith(today);
  }) || [];
  
  const todayTotal = todayTransactions.reduce((sum, t) => sum + t.amount, 0);
  const receivedTotal = todayTransactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const sentTotal = todayTransactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Wallet Balance Card */}
      <StatsCard
        title="Wallet Balance"
        value={isWalletLoading ? "Loading..." : `₹${wallet?.balance.toLocaleString()}`}
        subtitle="INR"
        icon="ri-wallet-3-line"
        iconBgColor="bg-primary bg-opacity-10"
        iconColor="text-primary"
      >
        <div className="flex items-center space-x-2">
          <Button 
            onClick={() => setIsAddFundsModalOpen(true)}
            className="bg-primary text-white text-xs px-3 py-1 rounded-md"
          >
            Add Funds
          </Button>
          <Button 
            onClick={() => setIsWithdrawModalOpen(true)}
            className="bg-neutral-100 text-neutral-600 text-xs px-3 py-1 rounded-md"
          >
            Withdraw
          </Button>
        </div>
      </StatsCard>

      {/* Total Partners Card */}
      <StatsCard
        title="Total Partners"
        value={isPartnersLoading ? "Loading..." : String(totalPartners)}
        subtitle={`(+${Math.min(2, totalPartners)} this week)`}
        icon="ri-team-line"
        iconBgColor="bg-secondary bg-opacity-10"
        iconColor="text-secondary"
      >
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
            <span className="text-xs">{activePartners} Active</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-2 h-2 rounded-full bg-neutral-300 mr-1"></span>
            <span className="text-xs">{inactivePartners} Inactive</span>
          </div>
        </div>
      </StatsCard>

      {/* Total Orders Card */}
      <StatsCard
        title="Total Orders"
        value={isOrdersLoading ? "Loading..." : String(totalOrders)}
        subtitle={`(+${Math.min(28, totalOrders)} today)`}
        icon="ri-shopping-bag-line"
        iconBgColor="bg-accent bg-opacity-10"
        iconColor="text-accent"
      >
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex flex-col">
            <span className="text-neutral-400">Pending</span>
            <span className="font-medium">{pendingOrders}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-neutral-400">In Progress</span>
            <span className="font-medium">{inProgressOrders}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-neutral-400">Completed</span>
            <span className="font-medium">{completedOrders}</span>
          </div>
        </div>
      </StatsCard>

      {/* Today's Transactions Card */}
      <StatsCard
        title="Today's Transactions"
        value={isTransactionsLoading ? "Loading..." : `₹${Math.abs(todayTotal).toLocaleString()}`}
        subtitle="INR"
        icon="ri-exchange-funds-line"
        iconBgColor="bg-error bg-opacity-10"
        iconColor="text-error"
      >
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex flex-col">
            <span className="text-neutral-400">Received</span>
            <span className="font-medium text-green-500">₹{receivedTotal.toLocaleString()}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-neutral-400">Sent</span>
            <span className="font-medium text-red-500">₹{sentTotal.toLocaleString()}</span>
          </div>
        </div>
      </StatsCard>

      {/* Modals */}
      <AddFundsModal 
        isOpen={isAddFundsModalOpen} 
        onClose={() => setIsAddFundsModalOpen(false)} 
      />
      <WithdrawFundsModal 
        isOpen={isWithdrawModalOpen} 
        onClose={() => setIsWithdrawModalOpen(false)} 
        maxAmount={wallet?.balance || 0}
      />
    </div>
  );
};

export default DashboardStats;
