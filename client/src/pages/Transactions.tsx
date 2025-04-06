import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Transaction, PickupPartner } from "@/types";

interface TransactionsProps {
  mcpId: number;
}

export default function Transactions({ mcpId }: TransactionsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionType, setTransactionType] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const transactionsPerPage = 10;

  const { data: transactions, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: [`/api/transactions/${mcpId}`],
  });

  const { data: partners, isLoading: partnersLoading } = useQuery<PickupPartner[]>({
    queryKey: [`/api/partners/${mcpId}`],
  });

  const isLoading = transactionsLoading || partnersLoading;

  // Filter transactions
  const filteredTransactions = transactions?.filter(transaction => {
    // Filter by type
    if (transactionType !== "all" && transaction.type !== transactionType) {
      return false;
    }
    
    // Filter by date
    if (dateFilter !== "all") {
      const transactionDate = new Date(transaction.created_at);
      const today = new Date();
      const weekAgo = new Date();
      weekAgo.setDate(today.getDate() - 7);
      const monthAgo = new Date();
      monthAgo.setMonth(today.getMonth() - 1);
      
      if (dateFilter === "today" && !isSameDay(transactionDate, today)) {
        return false;
      }
      
      if (dateFilter === "week" && transactionDate < weekAgo) {
        return false;
      }
      
      if (dateFilter === "month" && transactionDate < monthAgo) {
        return false;
      }
    }
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        transaction.type.toLowerCase().includes(searchLower) ||
        transaction.description.toLowerCase().includes(searchLower) ||
        `txn-${transaction.id}`.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  }) || [];

  // Check if two dates are the same day
  function isSameDay(date1: Date, date2: Date) {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  }
  
  // Sort transactions (newest first)
  const sortedTransactions = [...filteredTransactions].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Paginate transactions
  const totalTransactions = sortedTransactions.length;
  const totalPages = Math.ceil(totalTransactions / transactionsPerPage);
  
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = sortedTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Get transaction stats
  const getTransactionStats = () => {
    if (!transactions) return { total: 0, deposits: 0, withdrawals: 0, partnerFunding: 0 };
    
    const total = transactions.length;
    const deposits = transactions.filter(t => t.type === 'deposit').length;
    const withdrawals = transactions.filter(t => t.type === 'withdrawal').length;
    const partnerFunding = transactions.filter(t => t.type === 'partner_funding').length;
    
    return { total, deposits, withdrawals, partnerFunding };
  };

  const stats = getTransactionStats();

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
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-10 w-32" />
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-48" />
          </div>
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-2xl font-bold mb-2 md:mb-0">Transaction History</h2>
        <Button variant="outline">
          <span className="material-icons mr-2">download</span>
          Export Report
        </Button>
      </div>

      {/* Transaction Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span className="text-3xl font-bold">{stats.total}</span>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-primary">
                <span className="material-icons">receipt_long</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Deposits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span className="text-3xl font-bold">{stats.deposits}</span>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-success">
                <span className="material-icons">add_circle</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Withdrawals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span className="text-3xl font-bold">{stats.withdrawals}</span>
              <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center text-accent">
                <span className="material-icons">remove_circle</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Partner Funding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span className="text-3xl font-bold">{stats.partnerFunding}</span>
              <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center text-secondary">
                <span className="material-icons">arrow_outward</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-700">Transactions List</h3>
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          <Select
            value={transactionType}
            onValueChange={(value) => {
              setTransactionType(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="deposit">Deposits</SelectItem>
              <SelectItem value="withdrawal">Withdrawals</SelectItem>
              <SelectItem value="partner_funding">Partner Funding</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={dateFilter}
            onValueChange={(value) => {
              setDateFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <span className="material-icons text-sm">search</span>
            </span>
            <Input
              type="text"
              placeholder="Search transactions..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
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
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        TXN-{transaction.id.toString().padStart(5, '0')}
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
                            {partner && (
                              <div className="text-xs text-gray-500">
                                Partner: {partner.name}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(transaction.created_at)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${amountClass}`}>
                        {amountPrefix}{formatCurrency(transaction.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.description}
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
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No transactions found. Adjust your filters to see more results.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalTransactions > 0 && (
          <div className="px-6 py-4 bg-white border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing 
              <span className="font-medium mx-1">
                {indexOfFirstTransaction + 1}
              </span>
              to
              <span className="font-medium mx-1">
                {Math.min(indexOfLastTransaction, totalTransactions)}
              </span>
              of
              <span className="font-medium mx-1">
                {totalTransactions}
              </span>
              results
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(totalPages, 3) }).map((_, i) => (
                  <Button 
                    key={i} 
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(i + 1)}
                    className="w-8 p-0"
                  >
                    {i + 1}
                  </Button>
                ))}
                {totalPages > 3 && (
                  <>
                    {currentPage > 3 && <span className="text-gray-500">...</span>}
                    {currentPage > 3 && (
                      <Button 
                        variant={currentPage === totalPages ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                        className="w-8 p-0"
                      >
                        {totalPages}
                      </Button>
                    )}
                  </>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
