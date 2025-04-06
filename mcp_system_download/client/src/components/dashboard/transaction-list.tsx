import { useQuery } from "@tanstack/react-query";

type Transaction = {
  id: number;
  type: "deposit" | "withdrawal" | "transfer" | "order_payment";
  amount: string;
  description: string;
  createdAt: string;
  partnerName: string | null;
};

const TransactionList = () => {
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

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

  // Get the first 4 transactions for the dashboard view
  const recentTransactions = transactions?.slice(0, 4);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-neutral-200 rounded w-1/4"></div>
          <div className="h-20 bg-neutral-200 rounded w-full"></div>
          <div className="h-20 bg-neutral-200 rounded w-full"></div>
          <div className="h-20 bg-neutral-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-5 border-b border-neutral-200 flex justify-between items-center">
        <h3 className="font-semibold text-lg">Recent Transactions</h3>
        <button 
          className="text-primary-500 hover:text-primary-700 text-sm font-medium"
          onClick={() => window.location.href = '/transactions'}
        >
          View All
        </button>
      </div>
      
      <div className="p-1">
        {recentTransactions && recentTransactions.length > 0 ? (
          recentTransactions.map((transaction) => (
            <div key={transaction.id} className="p-4 border-b border-neutral-200 hover:bg-neutral-50">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-9 h-9 rounded-full bg-primary-50 flex items-center justify-center text-primary-500">
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
          <div className="p-4 text-center text-neutral-500">
            No transactions found
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionList;
