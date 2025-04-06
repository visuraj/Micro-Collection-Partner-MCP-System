import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertPickupPartnerSchema, 
  insertOrderSchema, 
  insertTransactionSchema, 
  insertNotificationSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // User authentication route
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // In a real app, we would use JWT or sessions here
      // For simplicity, we just return the user without the password
      const { password: _, ...userWithoutPassword } = user;
      
      return res.status(200).json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req: Request, res: Response) => {
    try {
      // In a real app, we would get the user ID from the session or JWT
      // For simplicity, we use the default user ID (1)
      const stats = await storage.getDashboardStats(1);
      return res.status(200).json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Pickup Partner routes
  app.get("/api/partners", async (req: Request, res: Response) => {
    try {
      const partners = await storage.getAllPartners();
      return res.status(200).json(partners);
    } catch (error) {
      console.error("Error fetching partners:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/partners/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const partner = await storage.getPartner(id);
      
      if (!partner) {
        return res.status(404).json({ message: "Partner not found" });
      }
      
      return res.status(200).json(partner);
    } catch (error) {
      console.error("Error fetching partner:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/partners", async (req: Request, res: Response) => {
    try {
      const partnerData = insertPickupPartnerSchema.parse(req.body);
      const partner = await storage.createPartner(partnerData);
      
      // If initial fund amount was provided, add it to the partner's wallet
      if (req.body.initialFund && typeof req.body.initialFund === 'number' && req.body.initialFund > 0) {
        await storage.updatePartnerWallet(partner.id, req.body.initialFund);
        
        // Create a transaction record
        await storage.createTransaction({
          amount: -req.body.initialFund, // Negative for the user (outgoing)
          type: "transfer_to_partner",
          description: `Initial fund transfer to ${partner.name}`,
          userId: 1, // Default user
          partnerId: partner.id,
          orderId: null
        });
        
        // Update the user's wallet balance
        const user = await storage.getUser(1);
        if (user) {
          await storage.updateUserWallet(1, user.walletBalance - req.body.initialFund);
        }
        
        // Create a notification
        await storage.createNotification({
          userId: 1,
          title: "Fund Transfer",
          message: `Initial fund of ₹${req.body.initialFund.toFixed(2)} transferred to ${partner.name}`,
          type: "info"
        });
      }
      
      return res.status(201).json(partner);
    } catch (error) {
      console.error("Error creating partner:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid partner data", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/partners/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const partner = await storage.getPartner(id);
      
      if (!partner) {
        return res.status(404).json({ message: "Partner not found" });
      }
      
      const updates = insertPickupPartnerSchema.partial().parse(req.body);
      const updatedPartner = await storage.updatePartner(id, updates);
      
      return res.status(200).json(updatedPartner);
    } catch (error) {
      console.error("Error updating partner:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid update data", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Wallet routes
  app.post("/api/wallet/add-funds", async (req: Request, res: Response) => {
    try {
      const { amount, paymentMethod } = req.body;
      
      if (typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      
      // In a real app, we would process the payment here
      // For simplicity, we just add the amount to the user's wallet
      
      const user = await storage.getUser(1); // Default user
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const updatedUser = await storage.updateUserWallet(1, user.walletBalance + amount);
      
      // Create a transaction record
      await storage.createTransaction({
        amount: amount,
        type: "wallet_funded",
        description: "Wallet Funded",
        userId: 1,
        partnerId: null,
        orderId: null
      });
      
      // Create a notification
      await storage.createNotification({
        userId: 1,
        title: "Wallet Funded",
        message: `₹${amount.toFixed(2)} added to your wallet`,
        type: "success"
      });
      
      return res.status(200).json({ 
        success: true, 
        walletBalance: updatedUser?.walletBalance || 0 
      });
    } catch (error) {
      console.error("Error adding funds:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/wallet/transfer", async (req: Request, res: Response) => {
    try {
      const { partnerId, amount } = req.body;
      
      if (typeof partnerId !== 'number' || partnerId <= 0) {
        return res.status(400).json({ message: "Invalid partner ID" });
      }
      
      if (typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      
      const user = await storage.getUser(1); // Default user
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (user.walletBalance < amount) {
        return res.status(400).json({ message: "Insufficient wallet balance" });
      }
      
      const partner = await storage.getPartner(partnerId);
      
      if (!partner) {
        return res.status(404).json({ message: "Partner not found" });
      }
      
      // Update user's wallet
      await storage.updateUserWallet(1, user.walletBalance - amount);
      
      // Update partner's wallet
      await storage.updatePartnerWallet(partnerId, partner.walletBalance + amount);
      
      // Create a transaction record
      await storage.createTransaction({
        amount: -amount, // Negative for the user (outgoing)
        type: "transfer_to_partner",
        description: `Transfer to ${partner.name}`,
        userId: 1,
        partnerId: partnerId,
        orderId: null
      });
      
      // Create a notification
      await storage.createNotification({
        userId: 1,
        title: "Fund Transfer",
        message: `₹${amount.toFixed(2)} transferred to ${partner.name}`,
        type: "info"
      });
      
      return res.status(200).json({ 
        success: true, 
        userWalletBalance: user.walletBalance - amount,
        partnerWalletBalance: partner.walletBalance + amount
      });
    } catch (error) {
      console.error("Error transferring funds:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Order routes
  app.get("/api/orders", async (req: Request, res: Response) => {
    try {
      const partnerId = req.query.partnerId ? parseInt(req.query.partnerId as string) : undefined;
      
      let orders;
      if (partnerId && !isNaN(partnerId)) {
        orders = await storage.getOrdersByPartner(partnerId);
      } else {
        orders = await storage.getAllOrders();
      }
      
      return res.status(200).json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/orders", async (req: Request, res: Response) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);
      
      // Create a notification
      if (order.pickupPartnerId) {
        const partner = await storage.getPartner(order.pickupPartnerId);
        
        if (partner) {
          await storage.createNotification({
            userId: 1,
            title: "New Order Assigned",
            message: `Order #${order.orderNumber} assigned to ${partner.name}`,
            type: "info"
          });
        }
      }
      
      return res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/orders/:id/status", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const { status, partnerId } = req.body;
      
      if (!status || !["pending", "in_progress", "completed", "cancelled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const order = await storage.getOrder(id);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      const updatedOrder = await storage.updateOrderStatus(id, status, partnerId);
      
      // Create a notification if the order is completed
      if (status === "completed" && updatedOrder) {
        const partner = updatedOrder.pickupPartnerId 
          ? await storage.getPartner(updatedOrder.pickupPartnerId) 
          : null;
        
        if (partner) {
          await storage.createNotification({
            userId: 1,
            title: "Order Completed",
            message: `Order #${updatedOrder.orderNumber} completed by ${partner.name}`,
            type: "success"
          });
        }
      }
      
      return res.status(200).json(updatedOrder);
    } catch (error) {
      console.error("Error updating order status:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Transaction routes
  app.get("/api/transactions", async (req: Request, res: Response) => {
    try {
      const partnerId = req.query.partnerId ? parseInt(req.query.partnerId as string) : undefined;
      
      let transactions;
      if (partnerId && !isNaN(partnerId)) {
        transactions = await storage.getPartnerTransactions(partnerId);
      } else {
        transactions = await storage.getAllTransactions();
      }
      
      return res.status(200).json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Notification routes
  app.get("/api/notifications", async (req: Request, res: Response) => {
    try {
      // In a real app, we would get the user ID from the session or JWT
      // For simplicity, we use the default user ID (1)
      const notifications = await storage.getUserNotifications(1);
      return res.status(200).json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/notifications/:id/read", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const notification = await storage.getNotification(id);
      
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      const updatedNotification = await storage.markNotificationAsRead(id);
      
      return res.status(200).json(updatedNotification);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/notifications/mark-all-read", async (req: Request, res: Response) => {
    try {
      const notifications = await storage.getUserNotifications(1);
      
      const updatedNotifications = await Promise.all(
        notifications.map(notification => 
          storage.markNotificationAsRead(notification.id)
        )
      );
      
      return res.status(200).json({ success: true, count: updatedNotifications.length });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
