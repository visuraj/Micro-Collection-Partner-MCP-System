import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";

import Dashboard from "@/pages/dashboard";
import Partners from "@/pages/partners";
import Wallet from "@/pages/wallet";
import Orders from "@/pages/orders";
import Transactions from "@/pages/transactions";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/partners" component={Partners} />
      <Route path="/wallet" component={Wallet} />
      <Route path="/orders" component={Orders} />
      <Route path="/transactions" component={Transactions} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
