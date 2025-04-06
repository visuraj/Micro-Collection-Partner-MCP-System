import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Mcp } from "@/types";
import { useState } from "react";
import AddFundsModal from "@/components/modals/AddFundsModal";
import { Skeleton } from "@/components/ui/skeleton";

interface WalletSummaryProps {
  mcpId: number;
}

interface DashboardStats {
  partnersTotal: number;
  partnersActive: number;
  partnersInactive: number;
  ordersTotal: number;
  ordersCompleted: number;
  ordersPending: number;
  earningsToday: number;
  earningsWeek: number;
  earningsMonth: number;
}

export function WalletSummary({ mcpId }: WalletSummaryProps) {
  const [isAddFundsModalOpen, setIsAddFundsModalOpen] = useState(false);
  
  const { data: mcp, isLoading: mcpLoading } = useQuery<Mcp>({
    queryKey: [`/api/mcp/${mcpId}`],
  });

  const { data: partners, isLoading: partnersLoading } = useQuery({
    queryKey: [`/api/partners/${mcpId}`],
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: [`/api/orders/${mcpId}`],
  });

  // Calculate dashboard stats
  const calculateStats = (): DashboardStats => {
    if (!partners || !orders) {
      return {
        partnersTotal: 0,
        partnersActive: 0,
        partnersInactive: 0,
        ordersTotal: 0,
        ordersCompleted: 0,
        ordersPending: 0,
        earningsToday: 0,
        earningsWeek: 0,
        earningsMonth: 0
      };
    }

    const partnersTotal = partners.length;
    const partnersActive = partners.filter(p => p.status === 'active').length;
    const partnersInactive = partnersTotal - partnersActive;
    
    const ordersTotal = orders.length;
    const ordersCompleted = orders.filter(o => o.status === 'completed').length;
    const ordersPending = orders.filter(o => o.status === 'pending' || o.status === 'in_progress').length;
    
    // This would typically come from a separate API endpoint with proper calculations
    // but for demo purposes, we'll just use hardcoded values
    const earningsToday = 3450;
    const earningsWeek = 16280;
    const earningsMonth = 42750;
    
    return {
      partnersTotal,
      partnersActive,
      partnersInactive,
      ordersTotal,
      ordersCompleted,
      ordersPending,
      earningsToday,
      earningsWeek,
      earningsMonth
    };
  };

  const stats = calculateStats();
  
  if (mcpLoading || partnersLoading || ordersLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="p-6">
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-8 w-1/3 mb-4" />
            <div className="flex justify-between mt-4">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* MCP Wallet Balance Card */}
        <Card className="p-6 relative overflow-hidden">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">MCP Wallet Balance</p>
              <h3 className="text-2xl font-bold font-mono text-neutral-dark">
                {formatCurrency(mcp?.wallet_balance || 0)}
              </h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="material-icons text-primary">account_balance_wallet</span>
            </div>
          </div>
          <div className="flex justify-between mt-4">
            <Button 
              size="sm" 
              onClick={() => setIsAddFundsModalOpen(true)}
            >
              Add Funds
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => alert("Withdraw functionality not implemented in this demo")}
            >
              Withdraw
            </Button>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-blue-50 opacity-50"></div>
        </Card>

        {/* Total Partners Card */}
        <Card className="p-6 relative overflow-hidden">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Partners</p>
              <h3 className="text-2xl font-bold font-mono text-neutral-dark">{stats.partnersTotal}</h3>
              <p className="text-xs text-success mt-1 flex items-center">
                <span className="material-icons text-xs mr-1">arrow_upward</span> +2 this week
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center">
              <span className="material-icons text-secondary">group</span>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full mr-2">
              {stats.partnersActive} Active
            </span>
            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
              {stats.partnersInactive} Inactive
            </span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-teal-50 opacity-50"></div>
        </Card>

        {/* Total Orders Card */}
        <Card className="p-6 relative overflow-hidden">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Orders</p>
              <h3 className="text-2xl font-bold font-mono text-neutral-dark">{stats.ordersTotal}</h3>
              <div className="flex space-x-2 mt-1">
                <p className="text-xs text-success flex items-center">
                  <span className="material-icons text-xs mr-1">check_circle</span> {stats.ordersCompleted} completed
                </p>
                <p className="text-xs text-warning flex items-center">
                  <span className="material-icons text-xs mr-1">pending</span> {stats.ordersPending} pending
                </p>
              </div>
            </div>
            <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <span className="material-icons text-accent">assignment</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-success rounded-full h-2" 
                style={{ 
                  width: stats.ordersTotal > 0 
                    ? `${(stats.ordersCompleted / stats.ordersTotal) * 100}%` 
                    : '0%' 
                }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.ordersTotal > 0 
                ? `${Math.round((stats.ordersCompleted / stats.ordersTotal) * 100)}% completion rate` 
                : '0% completion rate'
              }
            </p>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-yellow-50 opacity-50"></div>
        </Card>

        {/* Today's Earnings Card */}
        <Card className="p-6 relative overflow-hidden">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Today's Earnings</p>
              <h3 className="text-2xl font-bold font-mono text-neutral-dark">
                {formatCurrency(stats.earningsToday)}
              </h3>
              <p className="text-xs text-success mt-1 flex items-center">
                <span className="material-icons text-xs mr-1">arrow_upward</span> +8% vs yesterday
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <span className="material-icons text-success">payments</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>This Week</span>
              <span>{formatCurrency(stats.earningsWeek)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
              <span>This Month</span>
              <span>{formatCurrency(stats.earningsMonth)}</span>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-green-50 opacity-50"></div>
        </Card>
      </div>

      {/* Add Funds Modal */}
      <AddFundsModal 
        open={isAddFundsModalOpen} 
        onOpenChange={setIsAddFundsModalOpen} 
        mcpId={mcpId}
      />
    </>
  );
}

export default WalletSummary;
