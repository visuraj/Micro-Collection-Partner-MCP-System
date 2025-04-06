import WalletSummary from "@/components/dashboard/WalletSummary";
import PartnersTable from "@/components/dashboard/PartnersTable";
import OrdersList from "@/components/dashboard/OrdersList";
import TransactionsTable from "@/components/dashboard/TransactionsTable";
import NotificationsList from "@/components/dashboard/NotificationsList";

interface DashboardProps {
  mcpId: number;
}

export default function Dashboard({ mcpId }: DashboardProps) {
  return (
    <div className="p-6">
      {/* Wallet Summary Section */}
      <WalletSummary mcpId={mcpId} />
      
      {/* Partners and Orders Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <div className="xl:col-span-2">
          <PartnersTable mcpId={mcpId} />
        </div>
        
        <div>
          <OrdersList mcpId={mcpId} />
        </div>
      </div>
      
      {/* Transactions and Notifications Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <TransactionsTable mcpId={mcpId} />
        </div>
        
        <div>
          <NotificationsList mcpId={mcpId} />
        </div>
      </div>
    </div>
  );
}
