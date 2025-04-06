import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PickupPartner } from "@shared/schema";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface PartnerWithOrderStats extends PickupPartner {
  todayOrders?: number;
  completedOrders?: number;
  orderCompletionRate?: number;
}

export function PickupPartnerTable() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPartner, setSelectedPartner] = useState<PartnerWithOrderStats | null>(null);
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);
  const [fundAmount, setFundAmount] = useState("");

  const { data: partners = [], isLoading: isLoadingPartners } = useQuery<PickupPartner[]>({
    queryKey: ["/api/partners"],
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["/api/orders"],
  });

  // Calculate order stats for each partner
  const partnersWithStats: PartnerWithOrderStats[] = partners.map(partner => {
    const partnerOrders = orders.filter(order => order.pickupPartnerId === partner.id);
    const completedOrders = partnerOrders.filter(order => order.status === 'completed');
    const orderCompletionRate = partnerOrders.length > 0 
      ? (completedOrders.length / partnerOrders.length) * 100 
      : 0;
    
    return {
      ...partner,
      todayOrders: partnerOrders.length,
      completedOrders: completedOrders.length,
      orderCompletionRate
    };
  });

  const addFundsMutation = useMutation({
    mutationFn: async (data: { partnerId: number, amount: number }) => {
      return apiRequest("POST", "/api/wallet/transfer", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partners"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setIsAddFundsOpen(false);
      setFundAmount("");
      toast({
        title: "Funds added successfully",
        description: `Added ₹${parseFloat(fundAmount).toFixed(2)} to ${selectedPartner?.name}'s wallet.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error adding funds",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddFunds = () => {
    if (!selectedPartner || !fundAmount || parseFloat(fundAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    addFundsMutation.mutate({
      partnerId: selectedPartner.id,
      amount: parseFloat(fundAmount)
    });
  };

  const columns = [
    {
      header: "Partner",
      accessorKey: "name",
      cell: (row: PartnerWithOrderStats) => (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium">
            {row.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{row.name}</div>
            <div className="text-sm text-gray-500">ID: {row.partnerCode}</div>
          </div>
        </div>
      )
    },
    {
      header: "Status",
      accessorKey: "isActive",
      cell: (row: PartnerWithOrderStats) => (
        <Badge variant={row.isActive ? "success" : "danger"}>
          {row.isActive ? "Active" : "Inactive"}
        </Badge>
      )
    },
    {
      header: "Today's Orders",
      accessorKey: "todayOrders",
      cell: (row: PartnerWithOrderStats) => (
        <div>
          <div>{`${row.todayOrders || 0} (${row.completedOrders || 0} completed)`}</div>
          <Progress 
            value={row.orderCompletionRate || 0} 
            className="w-full h-1.5 mt-1 bg-gray-200"
          />
        </div>
      )
    },
    {
      header: "Wallet",
      accessorKey: "walletBalance",
      cell: (row: PartnerWithOrderStats) => (
        <div>
          <div className="font-medium">₹{row.walletBalance.toFixed(2)}</div>
          <Button 
            variant="link" 
            className="text-xs text-primary-500 hover:underline mt-1 p-0 h-auto"
            onClick={() => {
              setSelectedPartner(row);
              setIsAddFundsOpen(true);
            }}
          >
            Add funds
          </Button>
        </div>
      )
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (row: PartnerWithOrderStats) => (
        <div className="text-right">
          <Button variant="link" className="mr-3">View</Button>
          <Button variant="link" className="text-gray-500">Edit</Button>
        </div>
      )
    }
  ];

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm mb-6 border">
        <DataTable 
          columns={columns} 
          data={partnersWithStats} 
        />
      </div>

      {/* Add Funds Dialog */}
      <Dialog open={isAddFundsOpen} onOpenChange={setIsAddFundsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Funds to Partner</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="partner">Partner</Label>
              <Input id="partner" value={selectedPartner?.name || ""} disabled />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="current-balance">Current Balance</Label>
              <Input id="current-balance" value={`₹${selectedPartner?.walletBalance.toFixed(2) || "0.00"}`} disabled />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input 
                id="amount" 
                type="number" 
                min="1" 
                step="0.01"
                placeholder="Enter amount" 
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsAddFundsOpen(false);
                setFundAmount("");
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddFunds}
              disabled={addFundsMutation.isPending || !fundAmount || parseFloat(fundAmount) <= 0}
            >
              {addFundsMutation.isPending ? "Adding..." : "Add Funds"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
