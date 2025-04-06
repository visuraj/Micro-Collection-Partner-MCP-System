import React from "react";

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: string;
  iconBgColor: string;
  iconColor: string;
  children?: React.ReactNode;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconBgColor,
  iconColor,
  children,
}) => {
  return (
    <div className="bg-white rounded-lg p-4 card-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-neutral-500">{title}</h3>
        <div className={`${iconBgColor} ${iconColor} rounded-full p-1`}>
          <i className={icon}></i>
        </div>
      </div>
      <div className="flex items-baseline space-x-1 mb-2">
        <span className="text-2xl font-semibold">{value}</span>
        {subtitle && <span className="text-xs text-neutral-400">{subtitle}</span>}
      </div>
      {children}
    </div>
  );
};

export default StatsCard;
