import { useQuery } from "@tanstack/react-query";
import { AddWalletFundsModal } from "@/components/modals/add-wallet-funds-modal";
import { WithdrawFundsModal } from "@/components/modals/withdraw-funds-modal";

type Transaction = {
  id: number;
  type: "deposit" | "withdrawal" | "transfer" | "order_payment";
  amount: string;
  description: string;
  createdAt: string;
  partnerName: string | null;
};

type TransactionHistoryProps = {
  showAddFundsModal: boolean;
  setShowAddFundsModal: (show: boolean) => void;
  showWithdrawModal: boolean;
  setShowWithdrawModal: (show: boolean) => void;
};

const TransactionHistory = ({ 
  showAddFundsModal, 
  setShowAddFundsModal, 
  showWithdrawModal, 
  setShowWithdrawModal 
}: TransactionHistoryProps) => {
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return "ri-add-line";
      case "withdrawal":
        return "ri-arrow-down-line";
      case "transfer":
        return "ri-arrow-right-up-line";
      case "order_payment":
        return "ri-exchange-dollar-line";
      default:
        return "ri-exchange-funds-line";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-neutral-200 flex justify-between items-center">
          <h4 className="font-medium">Recent Transactions</h4>
          <button 
            className="text-primary-500 hover:text-primary-700 text-sm font-medium"
            onClick={() => window.location.href = '/transactions'}
          >
            View All
          </button>
        </div>
        
        {isLoading ? (
          <div className="p-4">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-neutral-200 rounded-full"></div>
                    <div className="ml-3">
                      <div className="h-4 bg-neutral-200 rounded w-36"></div>
                      <div className="h-3 bg-neutral-200 rounded w-24 mt-2"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-neutral-200 rounded w-20"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {transactions && transactions.length > 0 ? (
              transactions.slice(0, 8).map((transaction) => (
                <div key={transaction.id} className="p-4 hover:bg-neutral-50 transition-colors">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-500">
                        <i className={`${getTransactionIcon(transaction.type)} text-lg`}></i>
                      </div>
                      <div className="ml-3">
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-xs text-neutral-500">{formatDate(transaction.createdAt)}</p>
                      </div>
                    </div>
                    <span 
                      className={`font-medium font-mono ${
                        parseFloat(transaction.amount) >= 0 
                          ? 'text-success-500' 
                          : 'text-error-500'
                      }`}
                    >
                      {parseFloat(transaction.amount) >= 0 ? '+' : ''}
                      ₹{Math.abs(parseFloat(transaction.amount)).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-neutral-500">
                <div className="mb-3">No transactions found</div>
                <button 
                  className="text-primary-500 hover:text-primary-700"
                  onClick={() => setShowAddFundsModal(true)}
                >
                  Add funds to get started
                </button>
              </div>
            )}
          </div>
        )}
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

export default TransactionHistory;
