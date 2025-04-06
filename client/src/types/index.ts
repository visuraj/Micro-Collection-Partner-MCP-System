// User types
export interface User {
  id: number;
  username: string;
  password: string;
  name: string;
  role: string;
}

export interface InsertUser {
  username: string;
  password: string;
  name: string;
  role: string;
}

// MCP types
export interface Mcp {
  id: number;
  name: string;
  wallet_balance: number;
  userId: number;
}

export interface InsertMcp {
  name: string;
  wallet_balance: number;
  userId: number;
}

// Pickup Partner types
export interface PickupPartner {
  id: number;
  name: string;
  phone: string;
  email: string;
  status: string;
  wallet_balance: number;
  commission_type: string;
  commission_value: number;
  mcpId: number;
}

export interface InsertPickupPartner {
  name: string;
  phone: string;
  email: string;
  status: string;
  wallet_balance: number;
  commission_type: string;
  commission_value: number;
  mcpId: number;
}

// Order types
export interface Order {
  id: number;
  customer_name: string;
  customer_phone: string;
  pickup_address: string;
  status: string;
  amount: number;
  partnerId: number | null;
  mcpId: number;
  created_at: string;
  completed_at: string | null;
}

export interface InsertOrder {
  customer_name: string;
  customer_phone: string;
  pickup_address: string;
  status: string;
  amount: number;
  partnerId: number | null;
  mcpId: number;
}

// Transaction types
export interface Transaction {
  id: number;
  type: string;
  amount: number;
  status: string;
  description: string;
  partnerId: number | null;
  mcpId: number;
  created_at: string;
}

export interface InsertTransaction {
  type: string;
  amount: number;
  status: string;
  description: string;
  partnerId: number | null;
  mcpId: number;
}

// Notification types
export interface Notification {
  id: number;
  type: string;
  message: string;
  read: boolean;
  mcpId: number;
  created_at: string;
}

export interface InsertNotification {
  type: string;
  message: string;
  read: boolean;
  mcpId: number;
}
