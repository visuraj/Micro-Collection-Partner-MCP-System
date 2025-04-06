import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSidebar } from "@/context/SidebarContext";
import Header from "@/components/layouts/header";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { toggleSidebar } = useSidebar();
  const { toast } = useToast();
  
  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: ["/api/user/current"],
  });

  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your changes have been saved successfully.",
    });
  };

  return (
    <>
      <Header title="Settings" />
      
      <main className="p-4 md:p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">Settings</h2>
          <p className="text-neutral-500">Manage your account and application preferences</p>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-5 border-b border-neutral-200">
            <h3 className="font-semibold text-lg">Account Information</h3>
          </div>
          
          <div className="p-5">
            {isUserLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-10 bg-neutral-200 rounded w-1/2"></div>
                <div className="h-10 bg-neutral-200 rounded w-1/2"></div>
                <div className="h-10 bg-neutral-200 rounded w-1/2"></div>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); handleSaveSettings(); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      id="name" 
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                      defaultValue={userData?.name}
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      id="email" 
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                      defaultValue={userData?.email}
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-1">Phone Number</label>
                    <input 
                      type="tel" 
                      id="phone" 
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                      defaultValue={userData?.phone}
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="username" className="block text-sm font-medium text-neutral-700 mb-1">Username</label>
                    <input 
                      type="text" 
                      id="username" 
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-neutral-50" 
                      defaultValue={userData?.username}
                      disabled
                    />
                    <p className="mt-1 text-xs text-neutral-500">Username cannot be changed</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="font-medium mb-2">Change Password</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="mb-4">
                      <label htmlFor="current-password" className="block text-sm font-medium text-neutral-700 mb-1">Current Password</label>
                      <input 
                        type="password" 
                        id="current-password" 
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                        placeholder="Enter current password"
                      />
                    </div>
                    
                    <div></div>
                    
                    <div className="mb-4">
                      <label htmlFor="new-password" className="block text-sm font-medium text-neutral-700 mb-1">New Password</label>
                      <input 
                        type="password" 
                        id="new-password" 
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                        placeholder="Enter new password"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="confirm-password" className="block text-sm font-medium text-neutral-700 mb-1">Confirm New Password</label>
                      <input 
                        type="password" 
                        id="confirm-password" 
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button 
                    type="button" 
                    className="mr-2 px-4 py-2 border border-neutral-300 rounded-md text-neutral-700 hover:bg-neutral-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow mt-6">
          <div className="p-5 border-b border-neutral-200">
            <h3 className="font-semibold text-lg">Notification Preferences</h3>
          </div>
          
          <div className="p-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Order Notifications</h4>
                  <p className="text-sm text-neutral-500">Receive notifications about new and completed orders</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Wallet Notifications</h4>
                  <p className="text-sm text-neutral-500">Receive notifications about wallet transactions</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Partner Notifications</h4>
                  <p className="text-sm text-neutral-500">Receive notifications about pickup partner activities</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Email Notifications</h4>
                  <p className="text-sm text-neutral-500">Receive email notifications in addition to in-app notifications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                type="button" 
                className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                onClick={handleSaveSettings}
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Settings;
