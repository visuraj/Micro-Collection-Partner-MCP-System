import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSidebar } from "@/context/SidebarContext";
import PartnerTable from "@/components/dashboard/partner-table";

const Partners = () => {
  const { toggleSidebar } = useSidebar();
  
  return (
    <>
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-neutral-200">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center md:hidden">
            <button onClick={toggleSidebar} className="text-neutral-500 hover:text-neutral-700">
              <i className="ri-menu-line text-2xl"></i>
            </button>
            <h1 className="ml-3 text-lg font-semibold">Pickup Partners</h1>
          </div>
          
          <div className="hidden md:block">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search partners..." 
                className="pl-10 pr-4 py-2 rounded-md border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-64"
              />
              <i className="ri-search-line absolute left-3 top-2.5 text-neutral-400"></i>
            </div>
          </div>
          
          <div className="flex items-center">
            <button className="relative text-neutral-500 hover:text-neutral-700 p-2">
              <i className="ri-notification-2-line text-xl"></i>
              <span className="absolute top-1 right-1 w-4 h-4 bg-error-500 rounded-full text-white text-xs flex items-center justify-center">
                3
              </span>
            </button>
            <button className="md:hidden text-neutral-500 hover:text-neutral-700 p-2 ml-2">
              <i className="ri-search-line text-xl"></i>
            </button>
          </div>
        </div>
      </header>
      
      {/* Partners Content */}
      <main className="p-4 md:p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">Pickup Partners</h2>
          <p className="text-neutral-500">Manage all your pickup partners in one place</p>
        </div>

        <PartnerTable />
      </main>
    </>
  );
};

export default Partners;
