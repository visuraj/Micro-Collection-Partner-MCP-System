import { pgTable, text, serial, integer, numeric, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema (for MCP users)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  walletBalance: numeric("wallet_balance", { precision: 10, scale: 2 }).default("0").notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  walletBalance: true,
});

// Pickup Partner schema
export const pickupPartners = pgTable("pickup_partners", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(),
  email: text("email"),
  address: text("address"),
  isActive: boolean("is_active").default(true).notNull(),
  commissionType: text("commission_type").notNull(), // "percentage" or "fixed"
  commissionValue: numeric("commission_value", { precision: 10, scale: 2 }).notNull(),
  walletBalance: numeric("wallet_balance", { precision: 10, scale: 2 }).default("0").notNull(),
  mcpId: integer("mcp_id").notNull(), // Reference to users table (MCP)
});

export const insertPickupPartnerSchema = createInsertSchema(pickupPartners).omit({
  id: true,
  walletBalance: true,
});

// Orders schema
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull(), // "pending", "in_progress", "completed", "unassigned"
  location: text("location"),
  customerId: text("customer_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  mcpId: integer("mcp_id").notNull(), // Reference to users table (MCP)
  pickupPartnerId: integer("pickup_partner_id"), // Can be null if unassigned
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

// Transactions schema
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // "deposit", "withdrawal", "transfer", "order_payment"
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  mcpId: integer("mcp_id").notNull(), // Reference to users table (MCP)
  pickupPartnerId: integer("pickup_partner_id"), // Can be null for MCP deposits/withdrawals
  orderId: integer("order_id"), // Can be null for non-order transactions
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

// Notifications schema
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // "order", "wallet", "partner"
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  mcpId: integer("mcp_id").notNull(), // Reference to users table (MCP)
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  isRead: true,
  createdAt: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type PickupPartner = typeof pickupPartners.$inferSelect;
export type InsertPickupPartner = z.infer<typeof insertPickupPartnerSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
