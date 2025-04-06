import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AddFundsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddFundsModal({ open, onOpenChange }: AddFundsModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");

  const addFundsMutation = useMutation({
    mutationFn: async (data: { amount: number, paymentMethod: string }) => {
      return apiRequest("POST", "/api/wallet/add-funds", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({
        title: "Funds added successfully",
        description: `₹${parseFloat(amount).toFixed(2)} has been added to your wallet.`,
      });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Error adding funds",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    addFundsMutation.mutate({
      amount: amountValue,
      paymentMethod
    });
  };

  const handleClose = () => {
    setAmount("");
    setPaymentMethod("upi");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Funds to Wallet</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input 
                type="number" 
                id="amount" 
                placeholder="Enter amount"
                min="100"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>Payment Method</Label>
              <RadioGroup 
                value={paymentMethod} 
                onValueChange={setPaymentMethod}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="upi" id="upi" />
                  <Label htmlFor="upi" className="cursor-pointer">UPI</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="netbanking" id="netbanking" />
                  <Label htmlFor="netbanking" className="cursor-pointer">Net Banking</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="cursor-pointer">Credit/Debit Card</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={addFundsMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={addFundsMutation.isPending || !amount}
            >
              {addFundsMutation.isPending ? "Processing..." : "Proceed to Pay"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
