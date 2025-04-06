import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema (MCP)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  role: text("role").default("mcp").notNull(),
  avatar: text("avatar"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

// Pickup Partners schema
export const pickupPartners = pgTable("pickup_partners", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone").notNull(),
  status: text("status").default("inactive").notNull(), // active, inactive
  commissionType: text("commission_type").default("percentage").notNull(), // percentage, fixed
  commissionValue: doublePrecision("commission_value").default(10).notNull(),
  totalOrders: integer("total_orders").default(0).notNull(),
  completedOrders: integer("completed_orders").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPickupPartnerSchema = createInsertSchema(pickupPartners).omit({
  id: true,
  totalOrders: true,
  completedOrders: true,
  createdAt: true,
});

// Wallet schema
export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  balance: doublePrecision("balance").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertWalletSchema = createInsertSchema(wallets).omit({
  id: true,
  updatedAt: true,
});

// Transaction schema
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  walletId: integer("wallet_id").references(() => wallets.id).notNull(),
  type: text("type").notNull(), // deposit, withdrawal, transfer
  amount: doublePrecision("amount").notNull(),
  description: text("description"),
  status: text("status").default("completed").notNull(), // pending, completed, failed
  metadata: jsonb("metadata"), // For additional data like source, recipient, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

// Order schema
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderId: text("order_id").notNull().unique(), // Like #ORD-1234
  customerId: integer("customer_id"), // Optional, can be null for now
  partnerId: integer("partner_id").references(() => pickupPartners.id),
  status: text("status").default("pending").notNull(), // pending, in_progress, completed, cancelled
  amount: doublePrecision("amount").notNull(),
  pickupLocation: text("pickup_location"),
  dropLocation: text("drop_location"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Notification schema
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // order_update, transaction, system
  message: text("message").notNull(),
  read: boolean("read").default(false).notNull(),
  metadata: jsonb("metadata"), // Additional data like order ID, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type PickupPartner = typeof pickupPartners.$inferSelect;
export type InsertPickupPartner = z.infer<typeof insertPickupPartnerSchema>;

export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = z.infer<typeof insertWalletSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
