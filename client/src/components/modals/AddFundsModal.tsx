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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface AddFundsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mcpId: number;
}

export function AddFundsModal({ open, onOpenChange, mcpId }: AddFundsModalProps) {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");

  const addFundsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(
        "POST", 
        `/api/mcp/${mcpId}/add-funds`, 
        { amount: parseFloat(amount), paymentMethod }
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Funds added successfully",
        description: `₹${amount} has been added to your wallet.`,
      });
      
      // Reset form and close modal
      setAmount("");
      setPaymentMethod("upi");
      onOpenChange(false);
      
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/mcp/${mcpId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/transactions/${mcpId}`] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error adding funds",
        description: error.message || "An error occurred while adding funds.",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate amount
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid amount",
        description: "Please enter a valid amount greater than 0.",
      });
      return;
    }
    
    addFundsMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Funds</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="py-4">
          <div className="mb-4">
            <Label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </Label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">₹</span>
              </div>
              <Input
                id="amount"
                type="text"
                placeholder="0.00"
                className="pl-7 pr-12"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>
          
          <div className="mb-4">
            <Label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </Label>
            <RadioGroup 
              value={paymentMethod} 
              onValueChange={setPaymentMethod}
              className="mt-1 space-y-2"
            >
              <div className="flex items-center p-3 border border-gray-300 rounded-md hover:border-primary cursor-pointer">
                <RadioGroupItem value="upi" id="upi" />
                <Label htmlFor="upi" className="ml-3 cursor-pointer">UPI Payment</Label>
                <div className="ml-auto flex space-x-1">
                  <div className="h-6 w-10 bg-gray-200 rounded"></div>
                  <div className="h-6 w-10 bg-gray-200 rounded"></div>
                </div>
              </div>
              
              <div className="flex items-center p-3 border border-gray-300 rounded-md hover:border-primary cursor-pointer">
                <RadioGroupItem value="bank" id="bank" />
                <Label htmlFor="bank" className="ml-3 cursor-pointer">Bank Transfer</Label>
                <div className="ml-auto flex space-x-1">
                  <div className="h-6 w-10 bg-gray-200 rounded"></div>
                </div>
              </div>
              
              <div className="flex items-center p-3 border border-gray-300 rounded-md hover:border-primary cursor-pointer">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="ml-3 cursor-pointer">Credit/Debit Card</Label>
                <div className="ml-auto flex space-x-1">
                  <div className="h-6 w-10 bg-gray-200 rounded"></div>
                  <div className="h-6 w-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            </RadioGroup>
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
              disabled={addFundsMutation.isPending}
            >
              {addFundsMutation.isPending ? "Adding..." : "Add Funds"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddFundsModal;
