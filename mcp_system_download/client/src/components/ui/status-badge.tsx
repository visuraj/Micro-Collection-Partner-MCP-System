import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  status: "active" | "inactive" | "completed" | "in_progress" | "unassigned" | "pending";
  className?: string;
};

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const statusConfig = {
    active: {
      bg: "bg-success-50",
      text: "text-success-500",
      label: "Active"
    },
    inactive: {
      bg: "bg-neutral-200",
      text: "text-neutral-600",
      label: "Inactive"
    },
    completed: {
      bg: "bg-success-50",
      text: "text-success-500",
      label: "Completed"
    },
    in_progress: {
      bg: "bg-warning-50",
      text: "text-warning-500",
      label: "In Progress"
    },
    unassigned: {
      bg: "bg-error-50",
      text: "text-error-500",
      label: "Unassigned"
    },
    pending: {
      bg: "bg-neutral-200",
      text: "text-neutral-600",
      label: "Pending"
    }
  };

  const config = statusConfig[status];

  return (
    <span 
      className={cn(
        "px-2 py-1 rounded-full text-xs",
        config.bg,
        config.text,
        className
      )}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;
