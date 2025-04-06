import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSidebar } from "@/context/SidebarContext";
import OrderTable from "@/components/orders/order-table";
import { AddOrderModal } from "@/components/modals/add-order-modal";
import Header from "@/components/layouts/header";

const Orders = () => {
  const { toggleSidebar } = useSidebar();
  const [showAddOrderModal, setShowAddOrderModal] = useState(false);
  
  return (
    <>
      <Header title="Orders" />
      
      <main className="p-4 md:p-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold">Orders</h2>
            <p className="text-neutral-500">Manage and track all your orders</p>
          </div>
          
          <button 
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md flex items-center text-sm"
            onClick={() => setShowAddOrderModal(true)}
          >
            <i className="ri-add-line mr-1"></i> New Order
          </button>
        </div>

        <OrderTable />
        
        <AddOrderModal 
          isOpen={showAddOrderModal} 
          onClose={() => setShowAddOrderModal(false)} 
        />
      </main>
    </>
  );
};

export default Orders;
