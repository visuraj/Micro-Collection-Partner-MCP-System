import { ReactNode } from "react";

type DashboardCardProps = {
  title: string;
  value: string;
  icon: string;
  iconBgColor: string;
  iconColor: string;
  children?: ReactNode;
};

const DashboardCard = ({
  title,
  value,
  icon,
  iconBgColor,
  iconColor,
  children
}: DashboardCardProps) => {
  return (
    <div className="dashboard-card bg-white rounded-lg shadow p-6 transition-all hover:shadow-md hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-neutral-500 font-medium">{title}</h3>
        <div className={`w-10 h-10 ${iconBgColor} rounded-full flex items-center justify-center`}>
          <i className={`${icon} text-lg ${iconColor}`}></i>
        </div>
      </div>
      <p className="text-2xl font-semibold font-mono">{value}</p>
      {children && (
        <div className="mt-4">
          {children}
        </div>
      )}
    </div>
  );
};

export default DashboardCard;
