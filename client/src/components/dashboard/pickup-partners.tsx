import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

const PickupPartners: React.FC = () => {
  // Fetch partners data
  const { data: partners, isLoading } = useQuery({
    queryKey: ["/api/partners"],
    staleTime: 1000 * 60, // 1 minute
  });

  // Only show the first 4 partners in the dashboard
  const displayPartners = partners?.slice(0, 4) || [];

  const getInitials = (name: string) => {
    const nameParts = name.split(" ");
    if (nameParts.length === 1) return nameParts[0].substring(0, 2).toUpperCase();
    return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
  };

  return (
    <Card>
      <CardHeader className="p-4 border-b border-neutral-100 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-medium">Pickup Partners</CardTitle>
        <Button 
          variant="link" 
          className="text-sm text-primary p-0 h-auto font-medium"
          asChild
        >
          <Link href="/partners">View All</Link>
        </Button>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        {isLoading ? (
          // Skeleton loading state
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 border border-neutral-100 rounded-lg">
              <div className="flex items-center space-x-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>
          ))
        ) : (
          displayPartners.map((partner) => (
            <div key={partner.id} className="flex items-center justify-between p-3 border border-neutral-100 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center">
                    <span className="text-sm font-medium text-neutral-700">{getInitials(partner.name)}</span>
                  </div>
                  <span 
                    className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 ${
                      partner.status === "active" ? "bg-green-500" : "bg-neutral-400"
                    } border-2 border-white rounded-full`}
                  ></span>
                </div>
                <div>
                  <p className="text-sm font-medium">{partner.name}</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-neutral-500">Orders: {partner.totalOrders}</span>
                    <span className={`text-xs ${
                      partner.status === "active" ? "text-green-500" : "text-neutral-500"
                    }`}>
                      {partner.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-neutral-600">
                    <i className="ri-more-2-fill"></i>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/partners/${partner.id}`}>View Details</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>Edit Partner</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">Delete Partner</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))
        )}
      </CardContent>
      
      <CardFooter className="p-4 border-t border-neutral-100">
        <Button 
          className="w-full bg-neutral-50 hover:bg-neutral-100 text-neutral-600 font-medium py-2 rounded-md flex items-center justify-center space-x-2"
          variant="ghost"
          asChild
        >
          <Link href="/partners/new">
            <i className="ri-user-add-line"></i>
            <span>Add New Partner</span>
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PickupPartners;
