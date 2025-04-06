import { pgTable, text, serial, integer, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(),
});

// Pickup Partner schema
export const pickupPartners = pgTable("pickup_partners", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  status: text("status").notNull().default("active"),
  wallet_balance: decimal("wallet_balance", { precision: 10, scale: 2 }).notNull().default("0"),
  commission_type: text("commission_type").notNull(), // percentage or fixed
  commission_value: decimal("commission_value", { precision: 10, scale: 2 }).notNull(),
  mcpId: integer("mcp_id").notNull(),
});

// Orders schema
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customer_name: text("customer_name").notNull(),
  customer_phone: text("customer_phone").notNull(),
  pickup_address: text("pickup_address").notNull(),
  status: text("status").notNull().default("pending"), // pending, in_progress, completed, cancelled
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  partnerId: integer("partner_id"),
  mcpId: integer("mcp_id").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  completed_at: timestamp("completed_at"),
});

// Transactions schema
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // deposit, withdrawal, partner_funding, order_payment
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("completed"),
  description: text("description").notNull(),
  partnerId: integer("partner_id"),
  mcpId: integer("mcp_id").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

// Notifications schema
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // wallet_alert, order_completed, funds_added, order_cancelled, new_partner
  message: text("message").notNull(),
  read: boolean("read").notNull().default(false),
  mcpId: integer("mcp_id").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

// MCPs schema
export const mcps = pgTable("mcps", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  wallet_balance: decimal("wallet_balance", { precision: 10, scale: 2 }).notNull().default("0"),
  userId: integer("user_id").notNull(),
});

// Create insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  role: true,
});

export const insertPickupPartnerSchema = createInsertSchema(pickupPartners).pick({
  name: true,
  phone: true,
  email: true,
  status: true,
  wallet_balance: true,
  commission_type: true,
  commission_value: true,
  mcpId: true,
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  customer_name: true,
  customer_phone: true,
  pickup_address: true,
  status: true,
  amount: true,
  partnerId: true,
  mcpId: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  type: true,
  amount: true,
  status: true,
  description: true,
  partnerId: true,
  mcpId: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  type: true,
  message: true,
  read: true,
  mcpId: true,
});

export const insertMcpSchema = createInsertSchema(mcps).pick({
  name: true,
  wallet_balance: true,
  userId: true,
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertPickupPartner = z.infer<typeof insertPickupPartnerSchema>;
export type PickupPartner = typeof pickupPartners.$inferSelect;

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

export type InsertMcp = z.infer<typeof insertMcpSchema>;
export type Mcp = typeof mcps.$inferSelect;
