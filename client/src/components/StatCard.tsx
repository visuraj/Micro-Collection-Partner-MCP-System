import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDown, ArrowUp } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  changeValue?: number;
  changeLabel?: string;
  status?: "increase" | "decrease";
  children?: ReactNode;
}

export function StatCard({
  title,
  value,
  icon,
  changeValue,
  changeLabel,
  status,
  children
}: StatCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className="text-primary-500 bg-primary-50 p-2 rounded-full">
            {icon}
          </div>
        </div>
        
        {(changeValue !== undefined && changeLabel) && (
          <div className="flex items-center mt-4">
            <span className={`flex items-center text-sm ${status === 'increase' ? 'text-success-500' : 'text-danger-500'}`}>
              {status === 'increase' ? (
                <ArrowUp className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDown className="h-4 w-4 mr-1" />
              )}
              {changeValue}%
            </span>
            <span className="text-sm text-gray-500 ml-2">{changeLabel}</span>
          </div>
        )}
        
        {children && (
          <div className="mt-4">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
