// Application constants
export const APP_NAME = "EpiCircle MCP";

// Transaction types
export const TRANSACTION_TYPES = {
  DEPOSIT: "deposit",
  WITHDRAWAL: "withdrawal",
  PARTNER_FUNDING: "partner_funding",
  ORDER_PAYMENT: "order_payment"
};

// Order statuses
export const ORDER_STATUSES = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled"
};

// Partner statuses
export const PARTNER_STATUSES = {
  ACTIVE: "active",
  INACTIVE: "inactive"
};

// Commission types
export const COMMISSION_TYPES = {
  PERCENTAGE: "percentage",
  FIXED: "fixed"
};

// Notification types
export const NOTIFICATION_TYPES = {
  WALLET_ALERT: "wallet_alert",
  ORDER_COMPLETED: "order_completed",
  FUNDS_ADDED: "funds_added",
  ORDER_CANCELLED: "order_cancelled",
  NEW_PARTNER: "new_partner"
};

// Format options
export const CURRENCY_FORMAT_OPTIONS = {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
};

// Low balance threshold
export const LOW_BALANCE_THRESHOLD = 500;

// Default pagination limit
export const DEFAULT_PAGE_SIZE = 10;

// Chart colors
export const CHART_COLORS = {
  primary: '#2563eb',
  secondary: '#0f766e',
  accent: '#eab308',
  success: '#16a34a',
  warning: '#f59e0b',
  danger: '#dc2626'
};
