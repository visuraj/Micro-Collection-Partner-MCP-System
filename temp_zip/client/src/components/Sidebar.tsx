import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard,
  Users, 
  Wallet, 
  Package,
  Receipt, 
  BarChart, 
  Settings,
  Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive: boolean;
  onClick?: () => void;
}

const SidebarItem = ({ icon, label, href, isActive, onClick }: SidebarItemProps) => {
  return (
    <Link href={href}>
      <a
        className={cn(
          "flex items-center px-4 py-3 rounded-md transition-colors",
          isActive 
            ? "bg-primary-50 text-primary-600" 
            : "text-gray-600 hover:bg-gray-100"
        )}
        onClick={onClick}
      >
        <div className={cn("mr-3", isActive ? "text-primary-500" : "")}>
          {icon}
        </div>
        <span>{label}</span>
      </a>
    </Link>
  );
};

export function Sidebar() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  const sidebarItems = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", href: "/" },
    { icon: <Users size={20} />, label: "Pickup Partners", href: "/partners" },
    { icon: <Wallet size={20} />, label: "Wallet", href: "/wallet" },
    { icon: <Package size={20} />, label: "Orders", href: "/orders" },
    { icon: <Receipt size={20} />, label: "Transactions", href: "/transactions" },
    { icon: <BarChart size={20} />, label: "Reports", href: "/reports" },
    { icon: <Settings size={20} />, label: "Settings", href: "/settings" },
  ];

  const renderSidebarContent = () => (
    <>
      <div className="flex items-center justify-center h-16 border-b">
        <h1 className="text-xl font-bold text-primary-600">MCP Dashboard</h1>
      </div>
      <nav className="mt-6">
        <div className="px-4 py-2">
          <div className="flex flex-col space-y-1">
            {sidebarItems.map((item) => (
              <SidebarItem
                key={item.href}
                icon={item.icon}
                label={item.label}
                href={item.href}
                isActive={location === item.href}
                onClick={() => setOpen(false)}
              />
            ))}
          </div>
        </div>
      </nav>
    </>
  );

  return (
    <>
      {/* Mobile sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="md:hidden p-0 w-10 h-10 rounded-full"
          >
            <Menu />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          {renderSidebarContent()}
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside className="bg-white w-64 flex-shrink-0 hidden md:block shadow-lg h-screen overflow-y-auto">
        {renderSidebarContent()}
      </aside>
    </>
  );
}
