import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Mcp, Transaction } from "@/types";
import AddFundsModal from "@/components/modals/AddFundsModal";

interface WalletProps {
  mcpId: number;
}

export default function Wallet({ mcpId }: WalletProps) {
  const { toast } = useToast();
  const [isAddFundsModalOpen, setIsAddFundsModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<string>("all");
  
  const { data: mcp, isLoading: mcpLoading } = useQuery<Mcp>({
    queryKey: [`/api/mcp/${mcpId}`],
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: [`/api/transactions/${mcpId}`],
  });

  const withdrawFundsMutation = useMutation({
    mutationFn: async (amount: number) => {
      const response = await apiRequest(
        "POST", 
        `/api/mcp/${mcpId}/withdraw`, 
        { amount, withdrawalMethod: "Bank Transfer" }
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/mcp/${mcpId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/transactions/${mcpId}`] });
      toast({
        title: "Withdrawal successful",
        description: "Funds have been withdrawn from your wallet.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Withdrawal failed",
        description: error.message || "An error occurred during withdrawal.",
      });
    }
  });

  const isLoading = mcpLoading || transactionsLoading;

  // Filter transactions by type
  const filteredTransactions = transactions?.filter(transaction => {
    if (transactionType === "all") return true;
    return transaction.type === transactionType;
  }) || [];

  // Get the last 5 transactions for the summary section
  const recentTransactions = [...(filteredTransactions || [])]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "PPp"); // e.g., "Mar 15, 2023, 3:25 PM"
  };

  // Get monthly transactions summary
  const getMonthlyTransactions = () => {
    if (!transactions) return { income: 0, expense: 0, months: [] };
    
    // This would typically be calculated from the actual transaction history
    // For now, we'll use sample data
    const income = transactions
      .filter(t => t.type === 'deposit')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const expense = transactions
      .filter(t => t.type === 'withdrawal' || t.type === 'partner_funding')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    // Sample months for a chart
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    return { income, expense, months };
  };

  const monthly = getMonthlyTransactions();

  // Calculate transaction type stats
  const getTransactionTypeStats = () => {
    if (!transactions) return { deposits: 0, withdrawals: 0, partnerFunding: 0 };
    
    const deposits = transactions.filter(t => t.type === 'deposit').reduce((sum, t) => sum + Number(t.amount), 0);
    const withdrawals = transactions.filter(t => t.type === 'withdrawal').reduce((sum, t) => sum + Number(t.amount), 0);
    const partnerFunding = transactions.filter(t => t.type === 'partner_funding').reduce((sum, t) => sum + Number(t.amount), 0);
    
    return { deposits, withdrawals, partnerFunding };
  };

  const transactionStats = getTransactionTypeStats();
  
  // Handle withdrawal
  const handleWithdraw = () => {
    const amount = prompt("Enter amount to withdraw:");
    if (amount && !isNaN(Number(amount)) && Number(amount) > 0) {
      if (mcp && Number(amount) > Number(mcp.wallet_balance)) {
        toast({
          variant: "destructive",
          title: "Insufficient funds",
          description: "The amount exceeds your available balance.",
        });
        return;
      }
      
      withdrawFundsMutation.mutate(Number(amount));
    }
  };

  // Get transaction type details (icon, color, etc.)
  const getTransactionTypeDetails = (type: string) => {
    switch (type) {
      case 'deposit':
        return {
          icon: 'add_circle',
          bgColor: 'bg-blue-100',
          textColor: 'text-primary',
          amountClass: 'text-green-600',
          amountPrefix: '+',
        };
      case 'withdrawal':
        return {
          icon: 'remove_circle',
          bgColor: 'bg-yellow-100',
          textColor: 'text-accent',
          amountClass: 'text-red-600',
          amountPrefix: '-',
        };
      case 'partner_funding':
        return {
          icon: 'arrow_outward',
          bgColor: 'bg-teal-100',
          textColor: 'text-secondary',
          amountClass: 'text-red-600',
          amountPrefix: '-',
        };
      default:
        return {
          icon: 'swap_horiz',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-600',
          amountClass: 'text-gray-600',
          amountPrefix: '',
        };
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="md:col-span-2">
            <Card>
              <CardContent className="h-40 flex items-center justify-center">
                <div className="animate-pulse flex space-x-4">
                  <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                  <div className="flex-1 space-y-4 py-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="h-28 flex items-center justify-center">
                <div className="animate-pulse w-full">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-2 bg-gray-200 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="h-64 flex items-center justify-center">
              <div className="animate-pulse w-full">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-12 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="h-64 flex items-center justify-center">
              <div className="animate-pulse w-full">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-40 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Wallet Balance Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="md:col-span-2">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-700 text-white">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h3 className="text-sm font-medium opacity-80 mb-1">MCP Wallet Balance</h3>
                  <div className="text-4xl font-bold">{formatCurrency(mcp?.wallet_balance || 0)}</div>
                  <p className="mt-1 text-sm opacity-80">
                    {transactions?.length || 0} transactions in total
                  </p>
                </div>
                
                <div className="flex mt-4 md:mt-0 space-x-2">
                  <Button 
                    className="bg-white text-blue-700 hover:bg-blue-50"
                    onClick={() => setIsAddFundsModalOpen(true)}
                  >
                    <span className="material-icons mr-1">add_circle</span>
                    Add Funds
                  </Button>
                  <Button 
                    variant="outline"
                    className="border-white text-white hover:bg-blue-600"
                    onClick={handleWithdraw}
                  >
                    <span className="material-icons mr-1">remove_circle</span>
                    Withdraw
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Transaction Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Total Deposits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(transactionStats.deposits)}
            </div>
            <Progress 
              value={70} 
              className="h-2 mt-2" 
            />
            <p className="text-xs text-gray-500 mt-1">
              {transactions?.filter(t => t.type === 'deposit').length || 0} deposit transactions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Total Withdrawals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(transactionStats.withdrawals)}
            </div>
            <Progress 
              value={30} 
              className="h-2 mt-2" 
            />
            <p className="text-xs text-gray-500 mt-1">
              {transactions?.filter(t => t.type === 'withdrawal').length || 0} withdrawal transactions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Partner Funding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">
              {formatCurrency(transactionStats.partnerFunding)}
            </div>
            <Progress 
              value={50} 
              className="h-2 mt-2" 
            />
            <p className="text-xs text-gray-500 mt-1">
              {transactions?.filter(t => t.type === 'partner_funding').length || 0} partner funding transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions and Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Recent Transactions</CardTitle>
            <Select
              value={transactionType}
              onValueChange={setTransactionType}
            >
              <SelectTrigger className="w-[180px] h-8 text-sm">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="deposit">Deposits</SelectItem>
                <SelectItem value="withdrawal">Withdrawals</SelectItem>
                <SelectItem value="partner_funding">Partner Funding</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => {
                  const { 
                    icon, bgColor, textColor, amountClass, amountPrefix 
                  } = getTransactionTypeDetails(transaction.type);
                  
                  return (
                    <div key={transaction.id} className="flex items-center p-4 hover:bg-gray-50">
                      <div className={`h-10 w-10 rounded-full ${bgColor} flex items-center justify-center ${textColor} mr-3 flex-shrink-0`}>
                        <span className="material-icons">{icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium">
                              {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1).replace('_', ' ')}
                            </p>
                            <p className="text-xs text-gray-500">{transaction.description}</p>
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${amountClass}`}>
                              {amountPrefix}{formatCurrency(transaction.amount)}
                            </p>
                            <p className="text-xs text-gray-500 text-right">
                              {formatDate(transaction.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-gray-500">
                  No transactions found
                </div>
              )}
            </div>
            
            <div className="p-4 border-t">
              <Button variant="link" className="w-full">
                View All Transactions
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Monthly Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-60 flex items-center justify-center">
              <div className="text-center">
                <span className="material-icons text-6xl text-gray-300">bar_chart</span>
                <p className="mt-2 text-gray-500">Monthly transaction chart will be shown here</p>
                <p className="text-sm text-gray-400">
                  Income: {formatCurrency(monthly.income)} | Expense: {formatCurrency(monthly.expense)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Funds Modal */}
      <AddFundsModal 
        open={isAddFundsModalOpen} 
        onOpenChange={setIsAddFundsModalOpen} 
        mcpId={mcpId}
      />
    </div>
  );
}
