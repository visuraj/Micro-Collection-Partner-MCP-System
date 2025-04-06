import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users (MCP users)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  walletBalance: doublePrecision("wallet_balance").notNull().default(0),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  phone: true,
});

// Pickup Partners
export const pickupPartners = pgTable("pickup_partners", {
  id: serial("id").primaryKey(),
  partnerCode: text("partner_code").notNull().unique(),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(),
  email: text("email"),
  isActive: boolean("is_active").notNull().default(true),
  walletBalance: doublePrecision("wallet_balance").notNull().default(0),
  commissionType: text("commission_type").notNull(), // 'percentage' or 'fixed'
  commissionValue: doublePrecision("commission_value").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPickupPartnerSchema = createInsertSchema(pickupPartners).pick({
  name: true,
  phone: true,
  email: true,
  commissionType: true,
  commissionValue: true,
  isActive: true,
});

// Orders
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  customerId: text("customer_id").notNull(),
  customerName: text("customer_name").notNull(),
  status: text("status").notNull(), // 'pending', 'in_progress', 'completed', 'cancelled'
  pickupPartnerId: integer("pickup_partner_id").references(() => pickupPartners.id),
  orderValue: doublePrecision("order_value").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  customerId: true,
  customerName: true,
  orderValue: true,
  pickupPartnerId: true,
});

// Transactions
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  amount: doublePrecision("amount").notNull(),
  type: text("type").notNull(), // 'wallet_funded', 'transfer_to_partner', 'order_payment'
  description: text("description").notNull(),
  userId: integer("user_id").references(() => users.id),
  partnerId: integer("partner_id").references(() => pickupPartners.id),
  orderId: integer("order_id").references(() => orders.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  amount: true,
  type: true,
  description: true,
  userId: true,
  partnerId: true,
  orderId: true,
});

// Notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  type: text("type").notNull(), // 'info', 'warning', 'success', 'danger'
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  title: true,
  message: true,
  type: true,
});

// TypeScript Types
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
