import React from "react";
import { cn } from "@/lib/utils";

type StatusType = "active" | "inactive" | "pending" | "in_progress" | "completed" | "cancelled";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<
  StatusType,
  { color: string; backgroundColor: string; label?: string }
> = {
  active: {
    color: "text-green-800",
    backgroundColor: "bg-green-100",
  },
  inactive: {
    color: "text-neutral-800",
    backgroundColor: "bg-neutral-100",
  },
  pending: {
    color: "text-blue-800",
    backgroundColor: "bg-blue-100",
  },
  in_progress: {
    color: "text-yellow-800",
    backgroundColor: "bg-yellow-100",
    label: "In Progress",
  },
  completed: {
    color: "text-green-800",
    backgroundColor: "bg-green-100",
  },
  cancelled: {
    color: "text-red-800",
    backgroundColor: "bg-red-100",
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const config = statusConfig[status] || statusConfig.inactive;
  const displayText = config.label || status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        config.backgroundColor,
        config.color,
        className
      )}
    >
      {displayText}
    </span>
  );
};

export default StatusBadge;
