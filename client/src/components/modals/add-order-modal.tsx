import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const orderSchema = z.object({
  amount: z.coerce.number().positive({ message: "Amount must be greater than 0" }),
  location: z.string().min(3, { message: "Location is required" }),
  customerId: z.string().optional(),
  pickupPartnerId: z.coerce.number().optional(),
  status: z.enum(["pending", "in_progress", "completed", "unassigned"]).default("unassigned"),
});

type OrderFormValues = z.infer<typeof orderSchema>;

type AddOrderModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function AddOrderModal({ isOpen, onClose }: AddOrderModalProps) {
  const { toast } = useToast();
  
  const { data: partners } = useQuery({
    queryKey: ["/api/partners"],
  });
  
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      amount: 0,
      location: "",
      customerId: "",
      status: "unassigned",
    },
  });
  
  const createOrderMutation = useMutation({
    mutationFn: async (data: OrderFormValues) => {
      return await apiRequest("POST", "/api/orders", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Order Created",
        description: "The new order has been created successfully.",
      });
      form.reset();
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create order: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: OrderFormValues) => {
    createOrderMutation.mutate(data);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md z-10 relative">
        <div className="p-5 border-b border-neutral-200 flex justify-between items-center">
          <h3 className="font-semibold text-lg">Create New Order</h3>
          <button id="close-modal" className="text-neutral-500 hover:text-neutral-700" onClick={onClose}>
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>
        
        <div className="p-5">
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label htmlFor="amount" className="block text-sm font-medium text-neutral-700 mb-1">Order Amount</label>
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
              <label htmlFor="location" className="block text-sm font-medium text-neutral-700 mb-1">Pickup Location</label>
              <input 
                type="text" 
                id="location" 
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                placeholder="Enter location"
                {...form.register("location")}
              />
              {form.formState.errors.location && (
                <p className="mt-1 text-xs text-red-500">{form.formState.errors.location.message}</p>
              )}
            </div>
            
            <div className="mb-4">
              <label htmlFor="customerId" className="block text-sm font-medium text-neutral-700 mb-1">Customer ID (Optional)</label>
              <input 
                type="text" 
                id="customerId" 
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                placeholder="Enter customer ID"
                {...form.register("customerId")}
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="pickupPartnerId" className="block text-sm font-medium text-neutral-700 mb-1">Assign Pickup Partner (Optional)</label>
              <select 
                id="pickupPartnerId" 
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                {...form.register("pickupPartnerId")}
              >
                <option value="">-- Leave unassigned --</option>
                {partners?.filter(p => p.isActive).map(partner => (
                  <option key={partner.id} value={partner.id}>
                    {partner.name} - {partner.phone}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-neutral-500">If assigned, order status will be set to "In Progress"</p>
            </div>

            <div className="mt-6 flex justify-end">
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
                disabled={createOrderMutation.isPending}
              >
                {createOrderMutation.isPending ? "Creating..." : "Create Order"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
