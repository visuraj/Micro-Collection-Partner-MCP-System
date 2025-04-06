import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AddPartnerModal from "@/components/modals/add-partner-modal";
import { useLocation } from "wouter";

const Header: React.FC = () => {
  const [isAddPartnerModalOpen, setIsAddPartnerModalOpen] = useState(false);
  const [location] = useLocation();

  // Get the current page title based on the location
  const getPageTitle = () => {
    switch (location) {
      case "/":
        return "Dashboard";
      case "/partners":
        return "Pickup Partners";
      case "/wallet":
        return "Wallet";
      case "/orders":
        return "Orders";
      case "/transactions":
        return "Transactions";
      default:
        return "Dashboard";
    }
  };

  return (
    <>
      <header className="hidden md:flex items-center justify-between bg-white border-b border-neutral-100 p-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-medium">{getPageTitle()}</h1>
          <div className="hidden lg:flex items-center space-x-2 bg-neutral-50 rounded-md px-3 py-1.5">
            <i className="ri-search-line text-neutral-400"></i>
            <Input
              type="text"
              placeholder="Search..."
              className="bg-transparent border-none focus:outline-none text-sm w-64 h-7 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="relative p-2 text-neutral-400 hover:text-neutral-600">
            <i className="ri-notification-3-line text-xl"></i>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="relative">
            <Button
              className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2"
              onClick={() => setIsAddPartnerModalOpen(true)}
            >
              <i className="ri-add-line"></i>
              <span>New Partner</span>
            </Button>
          </div>
        </div>
      </header>

      <AddPartnerModal
        isOpen={isAddPartnerModalOpen}
        onClose={() => setIsAddPartnerModalOpen(false)}
      />
    </>
  );
};

export default Header;
