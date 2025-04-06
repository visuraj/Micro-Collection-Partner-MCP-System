import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertPickupPartnerSchema,
  insertOrderSchema, 
  insertTransactionSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const mcp = await storage.getMcpByUserId(user.id);
      
      if (!mcp) {
        return res.status(404).json({ message: "MCP not found for this user" });
      }
      
      return res.status(200).json({ user, mcpId: mcp.id });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // MCP routes
  app.get("/api/mcp/:id", async (req: Request, res: Response) => {
    try {
      const mcpId = parseInt(req.params.id);
      
      if (isNaN(mcpId)) {
        return res.status(400).json({ message: "Invalid MCP ID" });
      }
      
      const mcp = await storage.getMcp(mcpId);
      
      if (!mcp) {
        return res.status(404).json({ message: "MCP not found" });
      }
      
      return res.status(200).json(mcp);
    } catch (error) {
      console.error("Get MCP error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/mcp/:id/add-funds", async (req: Request, res: Response) => {
    try {
      const mcpId = parseInt(req.params.id);
      const { amount, paymentMethod } = req.body;
      
      if (isNaN(mcpId) || !amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid MCP ID or amount" });
      }
      
      const mcp = await storage.getMcp(mcpId);
      
      if (!mcp) {
        return res.status(404).json({ message: "MCP not found" });
      }
      
      // Create transaction for deposit
      const transaction = await storage.createTransaction({
        type: "deposit",
        amount,
        status: "completed",
        description: paymentMethod || "Payment",
        mcpId,
        partnerId: null
      });
      
      return res.status(200).json({ transaction, newBalance: Number(mcp.wallet_balance) + Number(amount) });
    } catch (error) {
      console.error("Add funds error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/mcp/:id/withdraw", async (req: Request, res: Response) => {
    try {
      const mcpId = parseInt(req.params.id);
      const { amount, withdrawalMethod } = req.body;
      
      if (isNaN(mcpId) || !amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid MCP ID or amount" });
      }
      
      const mcp = await storage.getMcp(mcpId);
      
      if (!mcp) {
        return res.status(404).json({ message: "MCP not found" });
      }
      
      if (Number(mcp.wallet_balance) < amount) {
        return res.status(400).json({ message: "Insufficient funds" });
      }
      
      // Create transaction for withdrawal
      const transaction = await storage.createTransaction({
        type: "withdrawal",
        amount,
        status: "completed",
        description: withdrawalMethod || "Bank Transfer",
        mcpId,
        partnerId: null
      });
      
      return res.status(200).json({ transaction, newBalance: Number(mcp.wallet_balance) - Number(amount) });
    } catch (error) {
      console.error("Withdrawal error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Pickup Partner routes
  app.get("/api/partners/:mcpId", async (req: Request, res: Response) => {
    try {
      const mcpId = parseInt(req.params.mcpId);
      
      if (isNaN(mcpId)) {
        return res.status(400).json({ message: "Invalid MCP ID" });
      }
      
      const partners = await storage.getPickupPartnersByMcpId(mcpId);
      
      return res.status(200).json(partners);
    } catch (error) {
      console.error("Get partners error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/partners", async (req: Request, res: Response) => {
    try {
      const partnerData = insertPickupPartnerSchema.parse(req.body);
      
      const partner = await storage.createPickupPartner(partnerData);
      
      return res.status(201).json(partner);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid partner data", errors: error.errors });
      }
      console.error("Create partner error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.put("/api/partners/:id", async (req: Request, res: Response) => {
    try {
      const partnerId = parseInt(req.params.id);
      
      if (isNaN(partnerId)) {
        return res.status(400).json({ message: "Invalid partner ID" });
      }
      
      const partnerData = req.body;
      
      const partner = await storage.updatePickupPartner(partnerId, partnerData);
      
      if (!partner) {
        return res.status(404).json({ message: "Partner not found" });
      }
      
      return res.status(200).json(partner);
    } catch (error) {
      console.error("Update partner error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.delete("/api/partners/:id", async (req: Request, res: Response) => {
    try {
      const partnerId = parseInt(req.params.id);
      
      if (isNaN(partnerId)) {
        return res.status(400).json({ message: "Invalid partner ID" });
      }
      
      const success = await storage.deletePickupPartner(partnerId);
      
      if (!success) {
        return res.status(404).json({ message: "Partner not found" });
      }
      
      return res.status(200).json({ message: "Partner deleted successfully" });
    } catch (error) {
      console.error("Delete partner error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/partners/:id/add-funds", async (req: Request, res: Response) => {
    try {
      const partnerId = parseInt(req.params.id);
      const { amount, mcpId } = req.body;
      
      if (isNaN(partnerId) || !amount || amount <= 0 || !mcpId) {
        return res.status(400).json({ message: "Invalid partner ID, MCP ID or amount" });
      }
      
      const partner = await storage.getPickupPartner(partnerId);
      
      if (!partner) {
        return res.status(404).json({ message: "Partner not found" });
      }
      
      const mcp = await storage.getMcp(mcpId);
      
      if (!mcp) {
        return res.status(404).json({ message: "MCP not found" });
      }
      
      if (Number(mcp.wallet_balance) < amount) {
        return res.status(400).json({ message: "Insufficient funds in MCP wallet" });
      }
      
      // Create transaction for partner funding
      const transaction = await storage.createTransaction({
        type: "partner_funding",
        amount,
        status: "completed",
        description: `To: ${partner.name}`,
        mcpId,
        partnerId
      });
      
      return res.status(200).json({ 
        transaction, 
        partnerBalance: Number(partner.wallet_balance) + Number(amount),
        mcpBalance: Number(mcp.wallet_balance) - Number(amount)
      });
    } catch (error) {
      console.error("Add partner funds error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Order routes
  app.get("/api/orders/:mcpId", async (req: Request, res: Response) => {
    try {
      const mcpId = parseInt(req.params.mcpId);
      
      if (isNaN(mcpId)) {
        return res.status(400).json({ message: "Invalid MCP ID" });
      }
      
      const orders = await storage.getOrdersByMcpId(mcpId);
      
      return res.status(200).json(orders);
    } catch (error) {
      console.error("Get orders error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/orders", async (req: Request, res: Response) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      
      const order = await storage.createOrder(orderData);
      
      return res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      console.error("Create order error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.put("/api/orders/:id/status", async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (isNaN(orderId) || !status) {
        return res.status(400).json({ message: "Invalid order ID or status" });
      }
      
      const order = await storage.updateOrderStatus(orderId, status);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      return res.status(200).json(order);
    } catch (error) {
      console.error("Update order status error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.put("/api/orders/:id/assign", async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.id);
      const { partnerId } = req.body;
      
      if (isNaN(orderId) || !partnerId) {
        return res.status(400).json({ message: "Invalid order ID or partner ID" });
      }
      
      const order = await storage.assignOrderToPartner(orderId, partnerId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      return res.status(200).json(order);
    } catch (error) {
      console.error("Assign order error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Transaction routes
  app.get("/api/transactions/:mcpId", async (req: Request, res: Response) => {
    try {
      const mcpId = parseInt(req.params.mcpId);
      
      if (isNaN(mcpId)) {
        return res.status(400).json({ message: "Invalid MCP ID" });
      }
      
      const transactions = await storage.getTransactionsByMcpId(mcpId);
      
      return res.status(200).json(transactions);
    } catch (error) {
      console.error("Get transactions error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Notification routes
  app.get("/api/notifications/:mcpId", async (req: Request, res: Response) => {
    try {
      const mcpId = parseInt(req.params.mcpId);
      
      if (isNaN(mcpId)) {
        return res.status(400).json({ message: "Invalid MCP ID" });
      }
      
      const notifications = await storage.getNotificationsByMcpId(mcpId);
      
      return res.status(200).json(notifications);
    } catch (error) {
      console.error("Get notifications error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.put("/api/notifications/:id/read", async (req: Request, res: Response) => {
    try {
      const notificationId = parseInt(req.params.id);
      
      if (isNaN(notificationId)) {
        return res.status(400).json({ message: "Invalid notification ID" });
      }
      
      const notification = await storage.markNotificationAsRead(notificationId);
      
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      return res.status(200).json(notification);
    } catch (error) {
      console.error("Mark notification as read error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.put("/api/notifications/:mcpId/read-all", async (req: Request, res: Response) => {
    try {
      const mcpId = parseInt(req.params.mcpId);
      
      if (isNaN(mcpId)) {
        return res.status(400).json({ message: "Invalid MCP ID" });
      }
      
      const notifications = await storage.getNotificationsByMcpId(mcpId);
      
      for (const notification of notifications) {
        await storage.markNotificationAsRead(notification.id);
      }
      
      return res.status(200).json({ message: "All notifications marked as read" });
    } catch (error) {
      console.error("Mark all notifications as read error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
