import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertPickupPartnerSchema,
  insertTransactionSchema,
  insertOrderSchema,
  insertNotificationSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const router = app;

  // Authentication endpoints (simplified for demo)
  router.post("/api/auth/login", async (req: Request, res: Response) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    
    const user = await storage.getUserByUsername(username);
    
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    
    // In production, we would set up a proper session/JWT
    return res.status(200).json({ 
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  });

  // Pickup Partner endpoints
  router.get("/api/partners", async (_req: Request, res: Response) => {
    const partners = await storage.getPartners();
    return res.status(200).json(partners);
  });
  
  router.get("/api/partners/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid partner ID" });
    }
    
    const partner = await storage.getPartner(id);
    
    if (!partner) {
      return res.status(404).json({ message: "Partner not found" });
    }
    
    return res.status(200).json(partner);
  });
  
  router.post("/api/partners", async (req: Request, res: Response) => {
    try {
      const partnerData = insertPickupPartnerSchema.parse(req.body);
      const partner = await storage.createPartner(partnerData);
      
      // Create a wallet for the partner
      await storage.createWallet({
        userId: partner.id,
        balance: 0
      });
      
      return res.status(201).json(partner);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid partner data", errors: error.errors });
      }
      
      return res.status(500).json({ message: "Failed to create partner" });
    }
  });
  
  router.put("/api/partners/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid partner ID" });
    }
    
    const partner = await storage.getPartner(id);
    
    if (!partner) {
      return res.status(404).json({ message: "Partner not found" });
    }
    
    try {
      const updatedPartner = await storage.updatePartner(id, req.body);
      return res.status(200).json(updatedPartner);
    } catch (error) {
      return res.status(500).json({ message: "Failed to update partner" });
    }
  });
  
  router.delete("/api/partners/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid partner ID" });
    }
    
    const partner = await storage.getPartner(id);
    
    if (!partner) {
      return res.status(404).json({ message: "Partner not found" });
    }
    
    const deleted = await storage.deletePartner(id);
    
    if (!deleted) {
      return res.status(500).json({ message: "Failed to delete partner" });
    }
    
    return res.status(204).send();
  });

  // Wallet endpoints
  router.get("/api/wallets/user/:userId", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const wallet = await storage.getWalletByUserId(userId);
    
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }
    
    return res.status(200).json(wallet);
  });
  
  router.post("/api/wallets/:id/add", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { amount } = req.body;
    
    if (isNaN(id) || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: "Invalid wallet ID or amount" });
    }
    
    const wallet = await storage.getWallet(id);
    
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }
    
    try {
      // Update wallet balance
      const updatedWallet = await storage.updateWalletBalance(id, amount);
      
      // Create a transaction record
      const transaction = await storage.createTransaction({
        walletId: id,
        type: "deposit",
        amount,
        description: "Added to wallet",
        status: "completed",
        metadata: {
          method: req.body.method || "UPI",
          timestamp: new Date().toISOString()
        }
      });
      
      return res.status(200).json({ wallet: updatedWallet, transaction });
    } catch (error) {
      return res.status(500).json({ message: "Failed to add funds" });
    }
  });
  
  router.post("/api/wallets/:id/withdraw", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { amount } = req.body;
    
    if (isNaN(id) || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: "Invalid wallet ID or amount" });
    }
    
    const wallet = await storage.getWallet(id);
    
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }
    
    if (wallet.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }
    
    try {
      // Update wallet balance
      const updatedWallet = await storage.updateWalletBalance(id, -amount);
      
      // Create a transaction record
      const transaction = await storage.createTransaction({
        walletId: id,
        type: "withdrawal",
        amount: -amount,
        description: "Withdrawal from wallet",
        status: "completed",
        metadata: {
          method: req.body.method || "Bank Transfer",
          timestamp: new Date().toISOString()
        }
      });
      
      return res.status(200).json({ wallet: updatedWallet, transaction });
    } catch (error) {
      return res.status(500).json({ message: "Failed to withdraw funds" });
    }
  });
  
  router.post("/api/wallets/:id/transfer", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { amount, targetUserId, description } = req.body;
    
    if (isNaN(id) || isNaN(amount) || amount <= 0 || !targetUserId) {
      return res.status(400).json({ message: "Invalid wallet ID, amount, or target user" });
    }
    
    const sourceWallet = await storage.getWallet(id);
    
    if (!sourceWallet) {
      return res.status(404).json({ message: "Source wallet not found" });
    }
    
    if (sourceWallet.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }
    
    const targetWallet = await storage.getWalletByUserId(targetUserId);
    
    if (!targetWallet) {
      return res.status(404).json({ message: "Target wallet not found" });
    }
    
    try {
      // Update source wallet balance
      const updatedSourceWallet = await storage.updateWalletBalance(id, -amount);
      
      // Update target wallet balance
      const updatedTargetWallet = await storage.updateWalletBalance(targetWallet.id, amount);
      
      // Create transaction records
      const sourceTransaction = await storage.createTransaction({
        walletId: id,
        type: "transfer",
        amount: -amount,
        description: description || "Transfer to partner",
        status: "completed",
        metadata: {
          targetWalletId: targetWallet.id,
          timestamp: new Date().toISOString()
        }
      });
      
      const targetTransaction = await storage.createTransaction({
        walletId: targetWallet.id,
        type: "transfer",
        amount,
        description: "Transfer from MCP",
        status: "completed",
        metadata: {
          sourceWalletId: id,
          timestamp: new Date().toISOString()
        }
      });
      
      return res.status(200).json({ 
        sourceWallet: updatedSourceWallet, 
        targetWallet: updatedTargetWallet,
        sourceTransaction,
        targetTransaction
      });
    } catch (error) {
      return res.status(500).json({ message: "Failed to transfer funds" });
    }
  });

  // Transaction endpoints
  router.get("/api/transactions", async (_req: Request, res: Response) => {
    const transactions = await storage.getTransactions();
    return res.status(200).json(transactions);
  });
  
  router.get("/api/transactions/wallet/:walletId", async (req: Request, res: Response) => {
    const walletId = parseInt(req.params.walletId);
    
    if (isNaN(walletId)) {
      return res.status(400).json({ message: "Invalid wallet ID" });
    }
    
    const transactions = await storage.getTransactionsByWalletId(walletId);
    return res.status(200).json(transactions);
  });
  
  router.post("/api/transactions", async (req: Request, res: Response) => {
    try {
      const transactionData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(transactionData);
      return res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      }
      
      return res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  // Order endpoints
  router.get("/api/orders", async (_req: Request, res: Response) => {
    const orders = await storage.getOrders();
    return res.status(200).json(orders);
  });
  
  router.get("/api/orders/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }
    
    const order = await storage.getOrder(id);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    return res.status(200).json(order);
  });
  
  router.get("/api/orders/partner/:partnerId", async (req: Request, res: Response) => {
    const partnerId = parseInt(req.params.partnerId);
    
    if (isNaN(partnerId)) {
      return res.status(400).json({ message: "Invalid partner ID" });
    }
    
    const orders = await storage.getOrdersByPartnerId(partnerId);
    return res.status(200).json(orders);
  });
  
  router.post("/api/orders", async (req: Request, res: Response) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);
      return res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      
      return res.status(500).json({ message: "Failed to create order" });
    }
  });
  
  router.put("/api/orders/:id/status", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    
    if (isNaN(id) || !status) {
      return res.status(400).json({ message: "Invalid order ID or status" });
    }
    
    const order = await storage.getOrder(id);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    try {
      const updatedOrder = await storage.updateOrderStatus(id, status);
      return res.status(200).json(updatedOrder);
    } catch (error) {
      return res.status(500).json({ message: "Failed to update order status" });
    }
  });
  
  router.put("/api/orders/:id/assign", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { partnerId } = req.body;
    
    if (isNaN(id) || isNaN(partnerId)) {
      return res.status(400).json({ message: "Invalid order ID or partner ID" });
    }
    
    const order = await storage.getOrder(id);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    const partner = await storage.getPartner(partnerId);
    
    if (!partner) {
      return res.status(404).json({ message: "Partner not found" });
    }
    
    try {
      const updatedOrder = await storage.assignOrderToPartner(id, partnerId);
      return res.status(200).json(updatedOrder);
    } catch (error) {
      return res.status(500).json({ message: "Failed to assign order to partner" });
    }
  });

  // Notification endpoints
  router.get("/api/notifications/user/:userId", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const notifications = await storage.getNotifications(userId);
    return res.status(200).json(notifications);
  });
  
  router.post("/api/notifications", async (req: Request, res: Response) => {
    try {
      const notificationData = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(notificationData);
      return res.status(201).json(notification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid notification data", errors: error.errors });
      }
      
      return res.status(500).json({ message: "Failed to create notification" });
    }
  });
  
  router.put("/api/notifications/:id/read", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid notification ID" });
    }
    
    try {
      const updatedNotification = await storage.markNotificationAsRead(id);
      
      if (!updatedNotification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      return res.status(200).json(updatedNotification);
    } catch (error) {
      return res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
