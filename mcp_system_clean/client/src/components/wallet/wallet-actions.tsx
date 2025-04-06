import { useState } from "react";
import { AddWalletFundsModal } from "@/components/modals/add-wallet-funds-modal";
import { WithdrawFundsModal } from "@/components/modals/withdraw-funds-modal";

type WalletActionsProps = {
  onAddFunds: () => void;
  onWithdraw: () => void;
};

const WalletActions = ({ onAddFunds, onWithdraw }: WalletActionsProps) => {
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center gap-4">
        <button 
          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md flex items-center text-sm"
          onClick={() => setShowAddFundsModal(true)}
        >
          <i className="ri-add-line mr-1"></i> Add Funds
        </button>
        
        <button 
          className="border border-primary-500 hover:bg-primary-50 text-primary-500 px-4 py-2 rounded-md flex items-center text-sm"
          onClick={() => setShowWithdrawModal(true)}
        >
          <i className="ri-download-line mr-1"></i> Withdraw
        </button>
        
        <button 
          className="border border-neutral-300 hover:bg-neutral-50 text-neutral-700 px-4 py-2 rounded-md flex items-center text-sm"
        >
          <i className="ri-bank-line mr-1"></i> Bank Accounts
        </button>
      </div>
      
      {/* Quick actions box */}
      <div className="mt-6 bg-neutral-50 rounded-lg p-4 border border-neutral-200">
        <h4 className="font-medium mb-3">Quick Actions</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div 
            className="p-3 bg-white rounded border border-neutral-200 hover:shadow-sm cursor-pointer flex flex-col items-center"
            onClick={() => setShowAddFundsModal(true)}
          >
            <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center mb-2">
              <i className="ri-add-line text-lg text-primary-500"></i>
            </div>
            <span className="text-sm text-center">Add Funds</span>
          </div>
          
          <div 
            className="p-3 bg-white rounded border border-neutral-200 hover:shadow-sm cursor-pointer flex flex-col items-center"
            onClick={() => setShowWithdrawModal(true)}
          >
            <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center mb-2">
              <i className="ri-download-line text-lg text-primary-500"></i>
            </div>
            <span className="text-sm text-center">Withdraw</span>
          </div>
          
          <div 
            className="p-3 bg-white rounded border border-neutral-200 hover:shadow-sm cursor-pointer flex flex-col items-center"
            onClick={() => window.location.href = "/transactions"}
          >
            <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center mb-2">
              <i className="ri-exchange-funds-line text-lg text-primary-500"></i>
            </div>
            <span className="text-sm text-center">Transactions</span>
          </div>
        </div>
      </div>
      
      <AddWalletFundsModal 
        isOpen={showAddFundsModal} 
        onClose={() => setShowAddFundsModal(false)} 
      />
      
      <WithdrawFundsModal 
        isOpen={showWithdrawModal} 
        onClose={() => setShowWithdrawModal(false)} 
      />
    </>
  );
};

export default WalletActions;
