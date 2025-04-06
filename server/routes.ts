import { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertPickupPartnerSchema, 
  insertOrderSchema, 
  insertTransactionSchema,
  insertNotificationSchema
} from "@shared/schema";
import { z } from "zod";

const DEFAULT_MCP_ID = 1; // For the demo app

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  app.get("/api/user/current", async (req: Request, res: Response) => {
    const user = await storage.getUser(DEFAULT_MCP_ID);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Don't send the password to the client
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // Pickup Partners routes
  app.get("/api/partners", async (req: Request, res: Response) => {
    const partners = await storage.getAllPickupPartners(DEFAULT_MCP_ID);
    
    // For each partner, get their order counts
    const partnersWithOrderCounts = await Promise.all(
      partners.map(async (partner) => {
        const orders = await storage.getOrdersByPickupPartner(partner.id);
        const completedOrders = orders.filter(order => order.status === "completed");
        const pendingOrders = orders.filter(order => order.status === "in_progress" || order.status === "pending");
        
        return {
          ...partner,
          totalOrders: orders.length,
          completedOrders: completedOrders.length,
          pendingOrders: pendingOrders.length,
        };
      })
    );
    
    res.json(partnersWithOrderCounts);
  });

  app.get("/api/partners/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid partner ID" });
    }
    
    const partner = await storage.getPickupPartner(id);
    if (!partner) {
      return res.status(404).json({ message: "Partner not found" });
    }
    
    const orders = await storage.getOrdersByPickupPartner(id);
    const completedOrders = orders.filter(order => order.status === "completed");
    const pendingOrders = orders.filter(order => order.status === "in_progress" || order.status === "pending");
    
    res.json({
      ...partner,
      totalOrders: orders.length,
      completedOrders: completedOrders.length,
      pendingOrders: pendingOrders.length,
    });
  });

  app.post("/api/partners", async (req: Request, res: Response) => {
    try {
      const partnerData = insertPickupPartnerSchema.parse({
        ...req.body,
        mcpId: DEFAULT_MCP_ID,
      });
      
      const partner = await storage.createPickupPartner(partnerData);
      
      // Create a notification for the new partner
      await storage.createNotification({
        type: "partner",
        message: `New pickup partner ${partner.name} has been added`,
        mcpId: DEFAULT_MCP_ID,
      });
      
      res.status(201).json(partner);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid partner data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create partner" });
    }
  });

  app.put("/api/partners/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid partner ID" });
    }
    
    try {
      const partnerData = insertPickupPartnerSchema.partial().parse(req.body);
      const updatedPartner = await storage.updatePickupPartner(id, partnerData);
      
      if (!updatedPartner) {
        return res.status(404).json({ message: "Partner not found" });
      }
      
      res.json(updatedPartner);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid partner data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update partner" });
    }
  });

  app.delete("/api/partners/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid partner ID" });
    }
    
    const partner = await storage.getPickupPartner(id);
    if (!partner) {
      return res.status(404).json({ message: "Partner not found" });
    }
    
    const deleted = await storage.deletePickupPartner(id);
    if (!deleted) {
      return res.status(500).json({ message: "Failed to delete partner" });
    }
    
    // Create a notification for the deleted partner
    await storage.createNotification({
      type: "partner",
      message: `Pickup partner ${partner.name} has been removed`,
      mcpId: DEFAULT_MCP_ID,
    });
    
    res.status(204).send();
  });

  // Wallet routes
  app.post("/api/wallet/add-funds", async (req: Request, res: Response) => {
    const amountSchema = z.object({
      amount: z.number().positive(),
      notes: z.string().optional(),
    });
    
    try {
      const { amount, notes } = amountSchema.parse(req.body);
      
      const user = await storage.updateUserWalletBalance(DEFAULT_MCP_ID, amount);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Create a transaction record
      const transaction = await storage.createTransaction({
        type: "deposit",
        amount,
        description: notes ? `Added funds to wallet: ${notes}` : "Added funds to wallet",
        mcpId: DEFAULT_MCP_ID,
        pickupPartnerId: undefined,
        orderId: undefined,
      });
      
      // Create a notification
      await storage.createNotification({
        type: "wallet",
        message: `₹${amount.toFixed(2)} has been added to your wallet`,
        mcpId: DEFAULT_MCP_ID,
      });
      
      res.status(201).json({
        walletBalance: user.walletBalance,
        transaction,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add funds" });
    }
  });

  app.post("/api/wallet/withdraw", async (req: Request, res: Response) => {
    const withdrawSchema = z.object({
      amount: z.number().positive(),
      notes: z.string().optional(),
    });
    
    try {
      const { amount, notes } = withdrawSchema.parse(req.body);
      
      const user = await storage.getUser(DEFAULT_MCP_ID);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (parseFloat(user.walletBalance) < amount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      
      const updatedUser = await storage.updateUserWalletBalance(DEFAULT_MCP_ID, -amount);
      
      // Create a transaction record
      const transaction = await storage.createTransaction({
        type: "withdrawal",
        amount: -amount,
        description: notes ? `Withdrawal from wallet: ${notes}` : "Withdrawal from wallet",
        mcpId: DEFAULT_MCP_ID,
        pickupPartnerId: undefined,
        orderId: undefined,
      });
      
      // Create a notification
      await storage.createNotification({
        type: "wallet",
        message: `₹${amount.toFixed(2)} has been withdrawn from your wallet`,
        mcpId: DEFAULT_MCP_ID,
      });
      
      res.status(201).json({
        walletBalance: updatedUser?.walletBalance,
        transaction,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to withdraw funds" });
    }
  });

  app.post("/api/partners/:id/add-funds", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid partner ID" });
    }
    
    const transferSchema = z.object({
      amount: z.number().positive(),
      notes: z.string().optional(),
    });
    
    try {
      const { amount, notes } = transferSchema.parse(req.body);
      
      const user = await storage.getUser(DEFAULT_MCP_ID);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const partner = await storage.getPickupPartner(id);
      if (!partner) {
        return res.status(404).json({ message: "Partner not found" });
      }
      
      if (parseFloat(user.walletBalance) < amount) {
        return res.status(400).json({ message: "Insufficient balance in MCP wallet" });
      }
      
      // Update MCP wallet balance
      await storage.updateUserWalletBalance(DEFAULT_MCP_ID, -amount);
      
      // Update partner wallet balance
      const updatedPartner = await storage.updatePickupPartnerWalletBalance(id, amount);
      
      // Create a transaction record
      const transaction = await storage.createTransaction({
        type: "transfer",
        amount: -amount,
        description: notes ? `Transferred to ${partner.name}: ${notes}` : `Transferred to ${partner.name}`,
        mcpId: DEFAULT_MCP_ID,
        pickupPartnerId: id,
        orderId: undefined,
      });
      
      // Create a notification
      await storage.createNotification({
        type: "wallet",
        message: `₹${amount.toFixed(2)} has been transferred to ${partner.name}`,
        mcpId: DEFAULT_MCP_ID,
      });
      
      res.status(201).json({
        partner: updatedPartner,
        transaction,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add funds" });
    }
  });

  // Order routes
  app.get("/api/orders", async (req: Request, res: Response) => {
    const orders = await storage.getAllOrders(DEFAULT_MCP_ID);
    
    // Enrich orders with partner details
    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        if (order.pickupPartnerId) {
          const partner = await storage.getPickupPartner(order.pickupPartnerId);
          return {
            ...order,
            partnerName: partner?.name || "Unknown",
          };
        }
        return {
          ...order,
          partnerName: null,
        };
      })
    );
    
    res.json(enrichedOrders);
  });

  app.post("/api/orders", async (req: Request, res: Response) => {
    try {
      // Generate a random order number
      const orderNumber = `ORD${Math.floor(10000 + Math.random() * 90000)}`;
      
      const orderData = insertOrderSchema.parse({
        ...req.body,
        orderNumber,
        mcpId: DEFAULT_MCP_ID,
      });
      
      const order = await storage.createOrder(orderData);
      
      // If the order is assigned to a partner, create a notification
      if (order.pickupPartnerId) {
        const partner = await storage.getPickupPartner(order.pickupPartnerId);
        if (partner) {
          await storage.createNotification({
            type: "order",
            message: `New order #${order.orderNumber} has been assigned to ${partner.name}`,
            mcpId: DEFAULT_MCP_ID,
          });
        }
      } else {
        await storage.createNotification({
          type: "order",
          message: `New unassigned order #${order.orderNumber} has been created`,
          mcpId: DEFAULT_MCP_ID,
        });
      }
      
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.put("/api/orders/:id/assign", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }
    
    const assignSchema = z.object({
      pickupPartnerId: z.number(),
    });
    
    try {
      const { pickupPartnerId } = assignSchema.parse(req.body);
      
      const order = await storage.getOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      const partner = await storage.getPickupPartner(pickupPartnerId);
      if (!partner) {
        return res.status(404).json({ message: "Partner not found" });
      }
      
      // Update order status and assign partner
      const updatedOrder = await storage.updateOrderStatus(id, "in_progress", pickupPartnerId);
      
      // Create a notification
      await storage.createNotification({
        type: "order",
        message: `Order #${order.orderNumber} has been assigned to ${partner.name}`,
        mcpId: DEFAULT_MCP_ID,
      });
      
      res.json(updatedOrder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to assign order" });
    }
  });

  app.put("/api/orders/:id/status", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }
    
    const statusSchema = z.object({
      status: z.enum(["pending", "in_progress", "completed", "unassigned"]),
    });
    
    try {
      const { status } = statusSchema.parse(req.body);
      
      const order = await storage.getOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      let partner;
      if (order.pickupPartnerId) {
        partner = await storage.getPickupPartner(order.pickupPartnerId);
      }
      
      // Update order status
      const updatedOrder = await storage.updateOrderStatus(id, status);
      
      // If the order is completed, we need to transfer funds from partner's wallet
      if (status === "completed" && partner && order.pickupPartnerId) {
        const orderAmount = parseFloat(order.amount);
        
        // Deduct from partner's wallet
        await storage.updatePickupPartnerWalletBalance(order.pickupPartnerId, -orderAmount);
        
        // Create a transaction record
        await storage.createTransaction({
          type: "order_payment",
          amount: -orderAmount,
          description: `Payment for completed order #${order.orderNumber}`,
          mcpId: DEFAULT_MCP_ID,
          pickupPartnerId: order.pickupPartnerId,
          orderId: order.id,
        });
        
        // Create a notification
        await storage.createNotification({
          type: "order",
          message: `${partner.name} has completed order #${order.orderNumber}`,
          mcpId: DEFAULT_MCP_ID,
        });
      }
      
      res.json(updatedOrder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid status", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // Transaction routes
  app.get("/api/transactions", async (req: Request, res: Response) => {
    const transactions = await storage.getAllTransactions(DEFAULT_MCP_ID);
    
    // Enrich transactions with partner details
    const enrichedTransactions = await Promise.all(
      transactions.map(async (transaction) => {
        if (transaction.pickupPartnerId) {
          const partner = await storage.getPickupPartner(transaction.pickupPartnerId);
          return {
            ...transaction,
            partnerName: partner?.name || "Unknown",
          };
        }
        return {
          ...transaction,
          partnerName: null,
        };
      })
    );
    
    res.json(enrichedTransactions);
  });

  // Notification routes
  app.get("/api/notifications", async (req: Request, res: Response) => {
    const notifications = await storage.getAllNotifications(DEFAULT_MCP_ID);
    res.json(notifications);
  });

  app.get("/api/notifications/unread-count", async (req: Request, res: Response) => {
    const count = await storage.getUnreadNotificationsCount(DEFAULT_MCP_ID);
    res.json({ count });
  });

  app.put("/api/notifications/:id/read", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid notification ID" });
    }
    
    const notification = await storage.getNotification(id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    
    const updatedNotification = await storage.markNotificationAsRead(id);
    res.json(updatedNotification);
  });

  // Dashboard stats
  app.get("/api/dashboard", async (req: Request, res: Response) => {
    const user = await storage.getUser(DEFAULT_MCP_ID);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const partners = await storage.getAllPickupPartners(DEFAULT_MCP_ID);
    const orders = await storage.getAllOrders(DEFAULT_MCP_ID);
    const transactions = await storage.getAllTransactions(DEFAULT_MCP_ID);
    
    // Calculate today's earnings from completed orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaysEarnings = orders
      .filter(order => 
        order.status === "completed" && 
        new Date(order.createdAt) >= today
      )
      .reduce((sum, order) => sum + parseFloat(order.amount), 0);
    
    // Calculate completed and pending orders
    const completedOrders = orders.filter(order => order.status === "completed");
    const pendingOrders = orders.filter(order => order.status === "in_progress" || order.status === "pending" || order.status === "unassigned");
    
    // Get active vs inactive partners
    const activePartners = partners.filter(partner => partner.isActive);
    
    // Get recent partners (added this week)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const newPartnersThisWeek = 2; // Mock data since we don't track partner creation date
    
    res.json({
      wallet: {
        balance: user.walletBalance
      },
      partners: {
        count: partners.length,
        active: activePartners.length,
        inactive: partners.length - activePartners.length,
        newThisWeek: newPartnersThisWeek
      },
      orders: {
        total: orders.length,
        completed: completedOrders.length,
        pending: pendingOrders.length
      },
      earnings: {
        today: todaysEarnings.toFixed(2)
      }
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
