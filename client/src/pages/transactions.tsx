import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSidebar } from "@/context/SidebarContext";
import Header from "@/components/layouts/header";

type Transaction = {
  id: number;
  type: "deposit" | "withdrawal" | "transfer" | "order_payment";
  amount: string;
  description: string;
  createdAt: string;
  partnerName: string | null;
};

const Transactions = () => {
  const { toggleSidebar } = useSidebar();
  const [filterType, setFilterType] = useState<string | null>(null);
  
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
  
  const filteredTransactions = filterType 
    ? transactions?.filter(t => t.type === filterType) 
    : transactions;

  return (
    <>
      <Header title="Transactions" />
      
      <main className="p-4 md:p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">Transactions</h2>
          <p className="text-neutral-500">View all your financial activities</p>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-neutral-200 flex flex-wrap gap-2">
            <button 
              className={`px-3 py-1.5 rounded-md text-sm ${!filterType ? 'bg-primary-500 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
              onClick={() => setFilterType(null)}
            >
              All
            </button>
            <button 
              className={`px-3 py-1.5 rounded-md text-sm ${filterType === 'deposit' ? 'bg-primary-500 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
              onClick={() => setFilterType('deposit')}
            >
              Deposits
            </button>
            <button 
              className={`px-3 py-1.5 rounded-md text-sm ${filterType === 'withdrawal' ? 'bg-primary-500 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
              onClick={() => setFilterType('withdrawal')}
            >
              Withdrawals
            </button>
            <button 
              className={`px-3 py-1.5 rounded-md text-sm ${filterType === 'transfer' ? 'bg-primary-500 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
              onClick={() => setFilterType('transfer')}
            >
              Transfers
            </button>
            <button 
              className={`px-3 py-1.5 rounded-md text-sm ${filterType === 'order_payment' ? 'bg-primary-500 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
              onClick={() => setFilterType('order_payment')}
            >
              Order Payments
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
              {filteredTransactions && filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
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
                    {transaction.partnerName && (
                      <div className="mt-2 text-sm text-neutral-500 ml-13 pl-10">
                        Partner: {transaction.partnerName}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-neutral-500">
                  {filterType 
                    ? `No ${filterType} transactions found` 
                    : 'No transactions found'}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Transactions;
