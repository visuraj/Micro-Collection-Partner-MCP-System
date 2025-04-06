import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowRight, SeparatorHorizontal } from "lucide-react";
import { Transaction } from "@shared/schema";

export function RecentTransactions() {
  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  // Sort transactions by date (newest first) and take the most recent 4
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date >= today) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date >= yesterday) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + 
        ', ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'wallet_funded':
        return (
          <div className="rounded-full w-10 h-10 flex items-center justify-center bg-green-100 text-green-500">
            <ArrowDown className="h-5 w-5" />
          </div>
        );
      case 'transfer_to_partner':
        return (
          <div className="rounded-full w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-500">
            <SeparatorHorizontal className="h-5 w-5" />
          </div>
        );
      case 'order_payment':
        return (
          <div className="rounded-full w-10 h-10 flex items-center justify-center bg-purple-100 text-purple-500">
            <ArrowRight className="h-5 w-5" />
          </div>
        );
      default:
        return (
          <div className="rounded-full w-10 h-10 flex items-center justify-center bg-gray-100 text-gray-500">
            <SeparatorHorizontal className="h-5 w-5" />
          </div>
        );
    }
  };

  const formatAmount = (amount: number) => {
    const absAmount = Math.abs(amount);
    const sign = amount < 0 ? "-" : "+";
    return `${sign}₹${absAmount.toFixed(2)}`;
  };

  const getAmountColor = (amount: number) => {
    return amount < 0 ? "text-red-500" : "text-green-500";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
        <a href="/transactions" className="text-sm text-primary-500 hover:underline">
          View All
        </a>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center p-3 hover:bg-gray-50 rounded-lg">
                {getTransactionIcon(transaction.type)}
                <div className="ml-4 flex-1">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm font-medium">{transaction.description}</p>
                      <p className="text-xs text-gray-500">{formatDate(transaction.createdAt)}</p>
                    </div>
                    <div className={`font-medium ${getAmountColor(transaction.amount)}`}>
                      {formatAmount(transaction.amount)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">No recent transactions</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
