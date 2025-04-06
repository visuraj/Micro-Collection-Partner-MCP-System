import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const partnerSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  phone: z.string().min(10, { message: "Please enter a valid phone number" }),
  email: z.string().email({ message: "Please enter a valid email" }).optional().or(z.literal("")),
  address: z.string().min(5, { message: "Address must be at least 5 characters" }),
  isActive: z.boolean().default(true),
  commissionType: z.enum(["percentage", "fixed"]),
  commissionValue: z.coerce.number().positive({ message: "Commission must be a positive number" }),
});

type PartnerFormValues = z.infer<typeof partnerSchema>;

type AddPartnerModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function AddPartnerModal({ isOpen, onClose }: AddPartnerModalProps) {
  const { toast } = useToast();
  
  const form = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
      isActive: true,
      commissionType: "percentage",
      commissionValue: 10,
    },
  });
  
  const createPartnerMutation = useMutation({
    mutationFn: async (data: PartnerFormValues) => {
      return await apiRequest("POST", "/api/partners", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partners"] });
      toast({
        title: "Partner Added",
        description: "The new pickup partner has been added successfully.",
      });
      form.reset();
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to add partner: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: PartnerFormValues) => {
    createPartnerMutation.mutate(data);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md z-10 relative">
        <div className="p-5 border-b border-neutral-200 flex justify-between items-center">
          <h3 className="font-semibold text-lg">Add New Pickup Partner</h3>
          <button id="close-modal" className="text-neutral-500 hover:text-neutral-700" onClick={onClose}>
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>
        
        <div className="p-5">
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1">Full Name</label>
              <input 
                type="text" 
                id="name" 
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                placeholder="Enter full name"
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="mt-1 text-xs text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>
            
            <div className="mb-4">
              <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-1">Phone Number</label>
              <input 
                type="tel" 
                id="phone" 
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                placeholder="+91 XXXXX XXXXX"
                {...form.register("phone")}
              />
              {form.formState.errors.phone && (
                <p className="mt-1 text-xs text-red-500">{form.formState.errors.phone.message}</p>
              )}
            </div>
            
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">Email Address (Optional)</label>
              <input 
                type="email" 
                id="email" 
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                placeholder="Enter email address"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="mt-1 text-xs text-red-500">{form.formState.errors.email.message}</p>
              )}
            </div>
            
            <div className="mb-4">
              <label htmlFor="address" className="block text-sm font-medium text-neutral-700 mb-1">Address</label>
              <textarea 
                id="address" 
                rows={2} 
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                placeholder="Enter address"
                {...form.register("address")}
              ></textarea>
              {form.formState.errors.address && (
                <p className="mt-1 text-xs text-red-500">{form.formState.errors.address.message}</p>
              )}
            </div>
            
            <div className="mb-4">
              <label htmlFor="commissionType" className="block text-sm font-medium text-neutral-700 mb-1">Commission Type</label>
              <select 
                id="commissionType" 
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                {...form.register("commissionType")}
              >
                <option value="percentage">Percentage (%) of Order Value</option>
                <option value="fixed">Fixed Amount per Order</option>
              </select>
              {form.formState.errors.commissionType && (
                <p className="mt-1 text-xs text-red-500">{form.formState.errors.commissionType.message}</p>
              )}
            </div>
            
            <div className="mb-4">
              <label htmlFor="commissionValue" className="block text-sm font-medium text-neutral-700 mb-1">Commission Value</label>
              <div className="relative">
                <input 
                  type="number" 
                  id="commissionValue" 
                  className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                  placeholder="Enter value"
                  step="0.01"
                  {...form.register("commissionValue")}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-neutral-500">₹</span>
                </div>
              </div>
              {form.formState.errors.commissionValue && (
                <p className="mt-1 text-xs text-red-500">{form.formState.errors.commissionValue.message}</p>
              )}
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
                disabled={createPartnerMutation.isPending}
              >
                {createPartnerMutation.isPending ? "Adding..." : "Add Partner"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
