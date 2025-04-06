import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSidebar } from "@/context/SidebarContext";
import WalletActions from "@/components/wallet/wallet-actions";
import TransactionHistory from "@/components/wallet/transaction-history";
import Header from "@/components/layouts/header";

const Wallet = () => {
  const { toggleSidebar } = useSidebar();
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  
  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: ["/api/user/current"],
  });

  return (
    <>
      <Header title="Wallet" />
      
      <main className="p-4 md:p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">Wallet</h2>
          <p className="text-neutral-500">Manage your funds and transaction history</p>
        </div>

        {/* Wallet Balance Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Wallet Balance</h3>
            <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
              <i className="ri-wallet-3-line text-xl text-primary-500"></i>
            </div>
          </div>
          
          {isUserLoading ? (
            <div className="animate-pulse h-8 bg-gray-200 rounded w-1/3"></div>
          ) : (
            <p className="text-3xl font-semibold font-mono mb-4">₹{parseFloat(userData?.walletBalance || "0").toFixed(2)}</p>
          )}
          
          <WalletActions 
            onAddFunds={() => setShowAddFundsModal(true)}
            onWithdraw={() => setShowWithdrawModal(true)}
          />
        </div>

        {/* Transaction History */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Transaction History</h3>
          <TransactionHistory 
            showAddFundsModal={showAddFundsModal}
            setShowAddFundsModal={setShowAddFundsModal}
            showWithdrawModal={showWithdrawModal}
            setShowWithdrawModal={setShowWithdrawModal}
          />
        </div>
      </main>
    </>
  );
};

export default Wallet;
