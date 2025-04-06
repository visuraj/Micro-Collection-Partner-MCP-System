import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatusBadge from "@/components/ui/status-badge";
import { DataTable, DataTablePagination } from "@/components/ui/data-table";
import { Link } from "wouter";

const ActiveOrders: React.FC = () => {
  // State for filtering and pagination
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Fetch orders data from the API
  const { data: orders, isLoading } = useQuery({
    queryKey: ["/api/orders"],
    staleTime: 1000 * 60, // 1 minute
  });

  // Fetch partners for joining with orders
  const { data: partners } = useQuery({
    queryKey: ["/api/partners"],
    staleTime: 1000 * 60,
  });

  // Filter orders based on status
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    if (statusFilter === "all") return orders;
    return orders.filter(order => order.status === statusFilter);
  }, [orders, statusFilter]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  // Format relative time
  const getRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 60) return `${diffMins} min ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  // Get partner name by ID
  const getPartnerName = (partnerId: number) => {
    if (!partners) return "Unknown";
    const partner = partners.find(p => p.id === partnerId);
    return partner ? partner.name : "Unassigned";
  };

  // Get partner initials
  const getPartnerInitials = (partnerId: number) => {
    if (!partners) return "??";
    const partner = partners.find(p => p.id === partnerId);
    if (!partner) return "??";
    
    const nameParts = partner.name.split(" ");
    if (nameParts.length === 1) return nameParts[0].substring(0, 2).toUpperCase();
    return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
  };

  // Define columns for the data table
  const columns = [
    {
      header: "Order ID",
      accessorKey: "orderId",
      cell: (row: any) => (
        <span className="text-sm text-neutral-600">{row.orderId}</span>
      )
    },
    {
      header: "Partner",
      cell: (row: any) => (
        <div className="flex items-center">
          <div className="w-6 h-6 rounded-full bg-neutral-200 flex items-center justify-center mr-2">
            <span className="text-xs font-medium text-neutral-700">
              {getPartnerInitials(row.partnerId)}
            </span>
          </div>
          <span className="text-sm font-medium text-neutral-700">
            {getPartnerName(row.partnerId)}
          </span>
        </div>
      )
    },
    {
      header: "Status",
      cell: (row: any) => <StatusBadge status={row.status} />
    },
    {
      header: "Amount",
      cell: (row: any) => (
        <span className="text-sm text-neutral-600">₹{row.amount}</span>
      )
    },
    {
      header: "Time",
      cell: (row: any) => (
        <span className="text-sm text-neutral-500">
          {getRelativeTime(row.createdAt)}
        </span>
      )
    },
    {
      header: "Action",
      className: "text-right",
      cell: (row: any) => (
        <Button 
          variant="link" 
          className="text-sm text-primary p-0 h-auto"
          asChild
        >
          <Link href={`/orders/${row.id}`}>Details</Link>
        </Button>
      )
    }
  ];

  return (
    <Card>
      <CardHeader className="p-4 border-b border-neutral-100 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-medium">Active Orders</CardTitle>
        <div className="flex items-center space-x-2">
          <Select 
            value={statusFilter} 
            onValueChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1); // Reset to first page on filter change
            }}
          >
            <SelectTrigger className="text-sm border-0 bg-neutral-50 rounded-md h-8 w-32">
              <SelectValue placeholder="All Orders" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Button
            size="icon"
            variant="ghost"
            className="text-neutral-400 hover:text-neutral-600 h-8 w-8"
          >
            <i className="ri-refresh-line"></i>
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <DataTable
          data={paginatedOrders}
          columns={columns}
          isLoading={isLoading}
        />
      </CardContent>
      
      <CardFooter className="p-4 border-t border-neutral-100 flex items-center justify-between">
        <Button 
          variant="link" 
          className="text-sm text-primary p-0 h-auto font-medium"
          asChild
        >
          <Link href="/orders">View All Orders</Link>
        </Button>
        
        <DataTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </CardFooter>
    </Card>
  );
};

export default ActiveOrders;
