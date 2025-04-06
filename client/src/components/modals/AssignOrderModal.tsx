import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { PickupPartner } from "@/types";

interface AssignOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mcpId: number;
  partners: PickupPartner[];
}

export function AssignOrderModal({ open, onOpenChange, mcpId, partners }: AssignOrderModalProps) {
  const { toast } = useToast();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [partnerId, setPartnerId] = useState("");
  const [amount, setAmount] = useState("");
  const [autoAssign, setAutoAssign] = useState(false);

  const activePartners = partners.filter(p => p.status === 'active');

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(
        "POST", 
        "/api/orders", 
        { 
          customer_name: customerName,
          customer_phone: customerPhone,
          pickup_address: pickupAddress,
          status: "pending",
          amount: parseFloat(amount),
          partnerId: autoAssign ? null : parseInt(partnerId),
          mcpId,
        }
      );
      
      const order = await response.json();
      
      // If auto-assign is not selected and a partner is chosen, assign the order
      if (!autoAssign && partnerId) {
        await apiRequest(
          "PUT", 
          `/api/orders/${order.id}/assign`, 
          { partnerId: parseInt(partnerId) }
        );
      }
      
      return order;
    },
    onSuccess: () => {
      toast({
        title: "Order created successfully",
        description: autoAssign 
          ? "Order has been created and will be auto-assigned." 
          : "Order has been created and assigned to the selected partner.",
      });
      
      // Reset form and close modal
      setCustomerName("");
      setCustomerPhone("");
      setPickupAddress("");
      setPartnerId("");
      setAmount("");
      setAutoAssign(false);
      onOpenChange(false);
      
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/orders/${mcpId}`] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error creating order",
        description: error.message || "An error occurred while creating the order.",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!customerName || !customerPhone || !pickupAddress || !amount) {
      toast({
        variant: "destructive",
        title: "Missing required fields",
        description: "Please fill in all required fields.",
      });
      return;
    }
    
    // Validate amount
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid amount",
        description: "Please enter a valid amount greater than 0.",
      });
      return;
    }
    
    // Validate partner selection if not auto-assigning
    if (!autoAssign && !partnerId) {
      toast({
        variant: "destructive",
        title: "Partner selection required",
        description: "Please select a pickup partner or enable auto-assign.",
      });
      return;
    }
    
    createOrderMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign New Order</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="py-4 space-y-4">
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Information
            </Label>
            <div className="space-y-2">
              <Input
                placeholder="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
              <Input
                placeholder="Phone Number"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Pickup Address
            </Label>
            <Textarea
              id="address"
              rows={2}
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="partner" className="block text-sm font-medium text-gray-700 mb-1">
              Assign to Pickup Partner
            </Label>
            <Select
              value={partnerId}
              onValueChange={setPartnerId}
              disabled={autoAssign}
            >
              <SelectTrigger id="partner">
                <SelectValue placeholder="Select a partner" />
              </SelectTrigger>
              <SelectContent>
                {activePartners.length > 0 ? (
                  activePartners.map((partner) => (
                    <SelectItem key={partner.id} value={partner.id.toString()}>
                      {partner.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No active partners available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Order Amount
            </Label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">₹</span>
              </div>
              <Input
                id="amount"
                className="pl-7"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="auto_assign" 
              checked={autoAssign} 
              onCheckedChange={(checked) => {
                setAutoAssign(checked as boolean);
                if (checked) {
                  setPartnerId("");
                }
              }}
            />
            <Label 
              htmlFor="auto_assign" 
              className="text-sm text-gray-700"
            >
              Auto-assign based on location and availability
            </Label>
          </div>

          <DialogFooter className="mt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createOrderMutation.isPending}
            >
              {createOrderMutation.isPending ? "Assigning..." : "Assign Order"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AssignOrderModal;
