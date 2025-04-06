import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Sidebar from "@/components/ui/sidebar";
import Partners from "@/pages/partners";
import Wallet from "@/pages/wallet";
import Orders from "@/pages/orders";
import Transactions from "@/pages/transactions";
import Notifications from "@/pages/notifications";
import Settings from "@/pages/settings";
import { useMobile } from "@/hooks/use-mobile";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/partners" component={Partners} />
      <Route path="/wallet" component={Wallet} />
      <Route path="/orders" component={Orders} />
      <Route path="/transactions" component={Transactions} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const isMobile = useMobile();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen overflow-hidden bg-neutral-100 text-neutral-700">
        <Sidebar />
        
        <div className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <Router />
        </div>
        
        {/* Mobile Navigation Bar */}
        {isMobile && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 flex justify-around p-2 z-10">
            <a href="/" className="flex flex-col items-center p-2 text-primary-500">
              <i className="ri-dashboard-line text-xl"></i>
              <span className="text-xs mt-1">Dashboard</span>
            </a>
            <a href="/partners" className="flex flex-col items-center p-2 text-neutral-500">
              <i className="ri-user-line text-xl"></i>
              <span className="text-xs mt-1">Partners</span>
            </a>
            <a href="/wallet" className="flex flex-col items-center p-2 text-neutral-500">
              <i className="ri-wallet-3-line text-xl"></i>
              <span className="text-xs mt-1">Wallet</span>
            </a>
            <a href="/orders" className="flex flex-col items-center p-2 text-neutral-500">
              <i className="ri-shopping-bag-line text-xl"></i>
              <span className="text-xs mt-1">Orders</span>
            </a>
            <a href="/notifications" className="flex flex-col items-center p-2 text-neutral-500">
              <i className="ri-notification-2-line text-xl"></i>
              <span className="text-xs mt-1">More</span>
            </a>
          </div>
        )}
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
