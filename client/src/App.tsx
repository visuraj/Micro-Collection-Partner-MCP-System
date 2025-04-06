import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import Dashboard from "@/pages/Dashboard";
import Partners from "@/pages/Partners";
import Orders from "@/pages/Orders";
import Wallet from "@/pages/Wallet";
import Transactions from "@/pages/Transactions";
import Analytics from "@/pages/Analytics";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";
import { useState, useEffect } from "react";

function Router() {
  const [mcpId, setMcpId] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    // In a real app, we would check for auth here
    // For now, we'll use a default MCP ID for demo purposes
    setMcpId(1);
    setUserName("Rahul Sharma");
    setUserRole("MCP Admin");
  }, []);

  if (!mcpId) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar userName={userName} userRole={userRole} />
      <main className="flex-1 md:ml-64 min-h-screen">
        <Topbar userName={userName} />
        <Switch>
          <Route path="/" component={() => <Dashboard mcpId={mcpId} />} />
          <Route path="/partners" component={() => <Partners mcpId={mcpId} />} />
          <Route path="/orders" component={() => <Orders mcpId={mcpId} />} />
          <Route path="/wallet" component={() => <Wallet mcpId={mcpId} />} />
          <Route path="/transactions" component={() => <Transactions mcpId={mcpId} />} />
          <Route path="/analytics" component={() => <Analytics mcpId={mcpId} />} />
          <Route path="/settings" component={() => <Settings mcpId={mcpId} />} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
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
