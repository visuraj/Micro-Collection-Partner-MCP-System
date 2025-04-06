import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Transaction, PickupPartner } from "@/types";

interface TransactionsTableProps {
  mcpId: number;
}

export function TransactionsTable({ mcpId }: TransactionsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionType, setTransactionType] = useState<string>("all");
  const transactionsPerPage = 5;

  const { data: transactions, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: [`/api/transactions/${mcpId}`],
  });

  const { data: partners, isLoading: partnersLoading } = useQuery<PickupPartner[]>({
    queryKey: [`/api/partners/${mcpId}`],
  });

  const isLoading = transactionsLoading || partnersLoading;

  // Filter transactions by type if a filter is selected
  const filteredTransactions = transactions?.filter(transaction => {
    if (transactionType === "all") return true;
    return transaction.type === transactionType;
  }) || [];

  // Calculate pagination
  const totalTransactions = filteredTransactions.length;
  
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);

  const goToNextPage = () => {
    if (currentPage < Math.ceil(totalTransactions / transactionsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Find a partner by ID
  const getPartnerById = (id?: number) => {
    if (!id) return null;
    return partners?.find(p => p.id === id);
  };

  // Format date to readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "PPp"); // e.g., "Mar 15, 2023, 3:25 PM"
  };

  // Get icon and background color for different transaction types
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
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <Skeleton className="h-6 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
        <div className="p-4">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left"><Skeleton className="h-4 w-20" /></th>
                <th className="px-6 py-3 text-left"><Skeleton className="h-4 w-24" /></th>
                <th className="px-6 py-3 text-left"><Skeleton className="h-4 w-24" /></th>
                <th className="px-6 py-3 text-left"><Skeleton className="h-4 w-16" /></th>
                <th className="px-6 py-3 text-left"><Skeleton className="h-4 w-20" /></th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map(i => (
                <tr key={i}>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-10 w-40" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-6 w-24" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="font-semibold text-neutral-dark">Recent Transactions</h3>
        <div className="flex items-center space-x-2">
          <Select
            value={transactionType}
            onValueChange={(value) => {
              setTransactionType(value);
              setCurrentPage(1); // Reset to first page when changing filter
            }}
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
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center"
          >
            <span className="material-icons text-sm mr-1">filter_list</span>
            Filter
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaction ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentTransactions.length > 0 ? (
              currentTransactions.map((transaction) => {
                const { 
                  icon, bgColor, textColor, amountClass, amountPrefix 
                } = getTransactionTypeDetails(transaction.type);
                
                const partner = transaction.partnerId 
                  ? getPartnerById(transaction.partnerId) 
                  : null;
                
                return (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      #TXN-{transaction.id.toString().padStart(5, '0')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`h-8 w-8 rounded-full ${bgColor} flex items-center justify-center ${textColor} mr-2`}>
                          <span className="material-icons text-sm">{icon}</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1).replace('_', ' ')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {transaction.type === 'partner_funding' && partner
                              ? `To: ${partner.name}`
                              : transaction.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(transaction.created_at)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${amountClass}`}>
                      {amountPrefix}{formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">{Math.min(transactionsPerPage, totalTransactions)}</span> of <span className="font-medium">{totalTransactions}</span> transactions
        </div>
        <div className="flex space-x-2">
          <button 
            className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <button 
            className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            onClick={goToNextPage}
            disabled={currentPage >= Math.ceil(totalTransactions / transactionsPerPage)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default TransactionsTable;
