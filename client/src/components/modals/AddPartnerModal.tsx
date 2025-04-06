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

interface AddPartnerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mcpId: number;
}

export function AddPartnerModal({ open, onOpenChange, mcpId }: AddPartnerModalProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [walletBalance, setWalletBalance] = useState("");
  const [commissionType, setCommissionType] = useState("percentage");
  const [commissionValue, setCommissionValue] = useState("");

  const addPartnerMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(
        "POST", 
        "/api/partners", 
        { 
          name,
          phone,
          email,
          status: "active",
          wallet_balance: parseFloat(walletBalance || "0"),
          commission_type: commissionType,
          commission_value: parseFloat(commissionValue || "0"),
          mcpId,
        }
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Partner added successfully",
        description: `${name} has been added as a pickup partner.`,
      });
      
      // Reset form and close modal
      setName("");
      setPhone("");
      setEmail("");
      setWalletBalance("");
      setCommissionType("percentage");
      setCommissionValue("");
      onOpenChange(false);
      
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/partners/${mcpId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/notifications/${mcpId}`] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error adding partner",
        description: error.message || "An error occurred while adding the partner.",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!name || !phone || !email) {
      toast({
        variant: "destructive",
        title: "Missing required fields",
        description: "Please fill in all required fields.",
      });
      return;
    }
    
    // Validate commission value if provided
    if (commissionValue && (isNaN(parseFloat(commissionValue)) || parseFloat(commissionValue) < 0)) {
      toast({
        variant: "destructive",
        title: "Invalid commission value",
        description: "Please enter a valid commission value.",
      });
      return;
    }
    
    // Validate wallet balance if provided
    if (walletBalance && (isNaN(parseFloat(walletBalance)) || parseFloat(walletBalance) < 0)) {
      toast({
        variant: "destructive",
        title: "Invalid wallet balance",
        description: "Please enter a valid wallet balance.",
      });
      return;
    }
    
    addPartnerMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Pickup Partner</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="py-4 space-y-4">
          <div>
            <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter full name"
            />
          </div>
          
          <div>
            <Label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
            />
          </div>
          
          <div>
            <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
            />
          </div>
          
          <div>
            <Label htmlFor="balance" className="block text-sm font-medium text-gray-700 mb-1">
              Initial Wallet Balance
            </Label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">₹</span>
              </div>
              <Input
                id="balance"
                className="pl-7"
                value={walletBalance}
                onChange={(e) => setWalletBalance(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1">
              Commission Type
            </Label>
            <RadioGroup 
              value={commissionType} 
              onValueChange={setCommissionType}
              className="flex space-x-4 mt-1"
            >
              <div className="flex items-center">
                <RadioGroupItem value="percentage" id="percentage" />
                <Label htmlFor="percentage" className="ml-2 text-sm text-gray-700">
                  Percentage (%)
                </Label>
              </div>
              <div className="flex items-center">
                <RadioGroupItem value="fixed" id="fixed" />
                <Label htmlFor="fixed" className="ml-2 text-sm text-gray-700">
                  Fixed Amount (₹)
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          <div>
            <Label htmlFor="commission" className="block text-sm font-medium text-gray-700 mb-1">
              Commission Value
            </Label>
            <Input
              id="commission"
              value={commissionValue}
              onChange={(e) => setCommissionValue(e.target.value)}
              placeholder={commissionType === "percentage" ? "e.g. 15" : "e.g. 50"}
            />
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
              disabled={addPartnerMutation.isPending}
            >
              {addPartnerMutation.isPending ? "Adding..." : "Add Partner"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddPartnerModal;
