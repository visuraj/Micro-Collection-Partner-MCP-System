import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const fundsSchema = z.object({
  amount: z.coerce.number().positive({ message: "Amount must be greater than 0" }),
  notes: z.string().optional(),
});

type FundsFormValues = z.infer<typeof fundsSchema>;

type AddWalletFundsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function AddWalletFundsModal({ isOpen, onClose }: AddWalletFundsModalProps) {
  const { toast } = useToast();
  
  const form = useForm<FundsFormValues>({
    resolver: zodResolver(fundsSchema),
    defaultValues: {
      amount: 0,
      notes: "",
    },
  });
  
  const addFundsMutation = useMutation({
    mutationFn: async (data: FundsFormValues) => {
      return await apiRequest("POST", "/api/wallet/add-funds", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/current"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Funds Added",
        description: "Successfully added funds to your wallet.",
      });
      form.reset();
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to add funds: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: FundsFormValues) => {
    addFundsMutation.mutate(data);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md z-10 relative">
        <div className="p-5 border-b border-neutral-200 flex justify-between items-center">
          <h3 className="font-semibold text-lg">Add Funds to Wallet</h3>
          <button id="close-modal" className="text-neutral-500 hover:text-neutral-700" onClick={onClose}>
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>
        
        <div className="p-5">
          <div className="mb-4 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-500">
              <i className="ri-wallet-3-line text-3xl"></i>
            </div>
          </div>
          
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label htmlFor="amount" className="block text-sm font-medium text-neutral-700 mb-1">Amount to Add</label>
              <div className="relative">
                <input 
                  type="number" 
                  id="amount" 
                  className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                  placeholder="Enter amount"
                  step="0.01"
                  {...form.register("amount")}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-neutral-500">₹</span>
                </div>
              </div>
              {form.formState.errors.amount && (
                <p className="mt-1 text-xs text-red-500">{form.formState.errors.amount.message}</p>
              )}
            </div>
            
            <div className="mb-4">
              <label htmlFor="notes" className="block text-sm font-medium text-neutral-700 mb-1">Purpose/Notes (Optional)</label>
              <textarea 
                id="notes" 
                rows={2} 
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                placeholder="Enter notes"
                {...form.register("notes")}
              ></textarea>
            </div>
            
            <div className="mt-6">
              <p className="text-sm text-neutral-500 mb-4">
                Funds will be immediately available in your wallet for use with pickup partners and operations.
              </p>
              
              <div className="flex justify-end">
                <button 
                  type="button" 
                  className="mr-2 px-4 py-2 border border-neutral-300 rounded-md text-neutral-700 hover:bg-neutral-50"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  disabled={addFundsMutation.isPending}
                >
                  {addFundsMutation.isPending ? "Processing..." : "Add Funds"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
