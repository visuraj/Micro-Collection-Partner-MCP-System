import { 
  users, type User, type InsertUser,
  pickupPartners, type PickupPartner, type InsertPickupPartner,
  orders, type Order, type InsertOrder,
  transactions, type Transaction, type InsertTransaction,
  notifications, type Notification, type InsertNotification,
  mcps, type Mcp, type InsertMcp
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // MCP operations
  getMcp(id: number): Promise<Mcp | undefined>;
  getMcpByUserId(userId: number): Promise<Mcp | undefined>;
  createMcp(mcp: InsertMcp): Promise<Mcp>;
  updateMcpWalletBalance(id: number, amount: number): Promise<Mcp | undefined>;
  
  // Pickup Partner operations
  getPickupPartner(id: number): Promise<PickupPartner | undefined>;
  getPickupPartnersByMcpId(mcpId: number): Promise<PickupPartner[]>;
  createPickupPartner(partner: InsertPickupPartner): Promise<PickupPartner>;
  updatePickupPartner(id: number, partner: Partial<InsertPickupPartner>): Promise<PickupPartner | undefined>;
  deletePickupPartner(id: number): Promise<boolean>;
  updatePickupPartnerWalletBalance(id: number, amount: number): Promise<PickupPartner | undefined>;
  
  // Order operations
  getOrder(id: number): Promise<Order | undefined>;
  getOrdersByMcpId(mcpId: number): Promise<Order[]>;
  getOrdersByPartnerId(partnerId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  assignOrderToPartner(id: number, partnerId: number): Promise<Order | undefined>;
  
  // Transaction operations
  getTransaction(id: number): Promise<Transaction | undefined>;
  getTransactionsByMcpId(mcpId: number): Promise<Transaction[]>;
  getTransactionsByPartnerId(partnerId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Notification operations
  getNotification(id: number): Promise<Notification | undefined>;
  getNotificationsByMcpId(mcpId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private mcps: Map<number, Mcp>;
  private pickupPartners: Map<number, PickupPartner>;
  private orders: Map<number, Order>;
  private transactions: Map<number, Transaction>;
  private notifications: Map<number, Notification>;
  
  private userCurrentId: number;
  private mcpCurrentId: number;
  private partnerCurrentId: number;
  private orderCurrentId: number;
  private transactionCurrentId: number;
  private notificationCurrentId: number;

  constructor() {
    this.users = new Map();
    this.mcps = new Map();
    this.pickupPartners = new Map();
    this.orders = new Map();
    this.transactions = new Map();
    this.notifications = new Map();
    
    this.userCurrentId = 1;
    this.mcpCurrentId = 1;
    this.partnerCurrentId = 1;
    this.orderCurrentId = 1;
    this.transactionCurrentId = 1;
    this.notificationCurrentId = 1;
    
    // Initialize with sample data for testing
    this.initSampleData();
  }

  private initSampleData() {
    // Create sample admin user
    const user: InsertUser = {
      username: "admin",
      password: "admin123",
      name: "Rahul Sharma",
      role: "MCP Admin"
    };
    const createdUser = this.createUser(user);
    
    // Create sample MCP
    const mcp: InsertMcp = {
      name: "EpiCircle MCP",
      wallet_balance: 24500,
      userId: createdUser.id
    };
    this.createMcp(mcp);
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // MCP operations
  async getMcp(id: number): Promise<Mcp | undefined> {
    return this.mcps.get(id);
  }
  
  async getMcpByUserId(userId: number): Promise<Mcp | undefined> {
    return Array.from(this.mcps.values()).find(
      (mcp) => mcp.userId === userId,
    );
  }
  
  async createMcp(insertMcp: InsertMcp): Promise<Mcp> {
    const id = this.mcpCurrentId++;
    const mcp: Mcp = { ...insertMcp, id };
    this.mcps.set(id, mcp);
    return mcp;
  }
  
  async updateMcpWalletBalance(id: number, amount: number): Promise<Mcp | undefined> {
    const mcp = await this.getMcp(id);
    if (!mcp) return undefined;
    
    const updatedMcp = { 
      ...mcp, 
      wallet_balance: Number(mcp.wallet_balance) + amount 
    };
    this.mcps.set(id, updatedMcp);
    return updatedMcp;
  }
  
  // Pickup Partner operations
  async getPickupPartner(id: number): Promise<PickupPartner | undefined> {
    return this.pickupPartners.get(id);
  }
  
  async getPickupPartnersByMcpId(mcpId: number): Promise<PickupPartner[]> {
    return Array.from(this.pickupPartners.values()).filter(
      (partner) => partner.mcpId === mcpId,
    );
  }
  
  async createPickupPartner(insertPartner: InsertPickupPartner): Promise<PickupPartner> {
    const id = this.partnerCurrentId++;
    const partner: PickupPartner = { ...insertPartner, id };
    this.pickupPartners.set(id, partner);
    
    // Create notification for new partner
    await this.createNotification({
      type: "new_partner",
      message: `${partner.name} has been added as a new pickup partner. Assign orders to start.`,
      read: false,
      mcpId: partner.mcpId
    });
    
    return partner;
  }
  
  async updatePickupPartner(id: number, partnerUpdate: Partial<InsertPickupPartner>): Promise<PickupPartner | undefined> {
    const partner = await this.getPickupPartner(id);
    if (!partner) return undefined;
    
    const updatedPartner = { ...partner, ...partnerUpdate };
    this.pickupPartners.set(id, updatedPartner);
    return updatedPartner;
  }
  
  async deletePickupPartner(id: number): Promise<boolean> {
    return this.pickupPartners.delete(id);
  }
  
  async updatePickupPartnerWalletBalance(id: number, amount: number): Promise<PickupPartner | undefined> {
    const partner = await this.getPickupPartner(id);
    if (!partner) return undefined;
    
    const newBalance = Number(partner.wallet_balance) + amount;
    
    // Create a low balance notification if balance falls below 500
    if (newBalance < 500 && Number(partner.wallet_balance) >= 500) {
      await this.createNotification({
        type: "wallet_alert",
        message: `${partner.name}'s wallet balance is below ₹500. Please add funds.`,
        read: false,
        mcpId: partner.mcpId
      });
    }
    
    const updatedPartner = { 
      ...partner, 
      wallet_balance: newBalance
    };
    this.pickupPartners.set(id, updatedPartner);
    return updatedPartner;
  }
  
  // Order operations
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
  
  async getOrdersByMcpId(mcpId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.mcpId === mcpId,
    );
  }
  
  async getOrdersByPartnerId(partnerId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.partnerId === partnerId,
    );
  }
  
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.orderCurrentId++;
    const order: Order = { 
      ...insertOrder, 
      id, 
      created_at: new Date(),
      completed_at: null
    };
    this.orders.set(id, order);
    return order;
  }
  
  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = await this.getOrder(id);
    if (!order) return undefined;
    
    let completed_at = order.completed_at;
    if (status === "completed" && !completed_at) {
      completed_at = new Date();
      
      // Create notification for completed order
      if (order.partnerId) {
        const partner = await this.getPickupPartner(order.partnerId);
        if (partner) {
          await this.createNotification({
            type: "order_completed",
            message: `${partner.name} has completed order #${order.id}. Amount credited to customer wallet.`,
            read: false,
            mcpId: order.mcpId
          });
        }
      }
    }
    
    if (status === "cancelled") {
      // Create notification for cancelled order
      if (order.partnerId) {
        const partner = await this.getPickupPartner(order.partnerId);
        if (partner) {
          await this.createNotification({
            type: "order_cancelled",
            message: `Order #${order.id} has been cancelled by ${partner.name}. Customer has been notified.`,
            read: false,
            mcpId: order.mcpId
          });
        }
      }
    }
    
    const updatedOrder = { ...order, status, completed_at };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
  
  async assignOrderToPartner(id: number, partnerId: number): Promise<Order | undefined> {
    const order = await this.getOrder(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, partnerId, status: "in_progress" };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
  
  // Transaction operations
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }
  
  async getTransactionsByMcpId(mcpId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter((transaction) => transaction.mcpId === mcpId)
      .sort((a, b) => {
        return (b.created_at?.getTime() || 0) - (a.created_at?.getTime() || 0);
      });
  }
  
  async getTransactionsByPartnerId(partnerId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter((transaction) => transaction.partnerId === partnerId)
      .sort((a, b) => {
        return (b.created_at?.getTime() || 0) - (a.created_at?.getTime() || 0);
      });
  }
  
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionCurrentId++;
    const transaction: Transaction = { 
      ...insertTransaction, 
      id, 
      created_at: new Date() 
    };
    this.transactions.set(id, transaction);
    
    // Update wallet balances based on transaction type
    if (transaction.type === "deposit") {
      await this.updateMcpWalletBalance(transaction.mcpId, Number(transaction.amount));
      
      // Create notification for funds added
      await this.createNotification({
        type: "funds_added",
        message: `₹${transaction.amount} has been added to your MCP wallet via ${transaction.description}.`,
        read: false,
        mcpId: transaction.mcpId
      });
    }
    
    if (transaction.type === "withdrawal") {
      await this.updateMcpWalletBalance(transaction.mcpId, -Number(transaction.amount));
    }
    
    if (transaction.type === "partner_funding" && transaction.partnerId) {
      await this.updateMcpWalletBalance(transaction.mcpId, -Number(transaction.amount));
      await this.updatePickupPartnerWalletBalance(transaction.partnerId, Number(transaction.amount));
    }
    
    return transaction;
  }
  
  // Notification operations
  async getNotification(id: number): Promise<Notification | undefined> {
    return this.notifications.get(id);
  }
  
  async getNotificationsByMcpId(mcpId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter((notification) => notification.mcpId === mcpId)
      .sort((a, b) => {
        return (b.created_at?.getTime() || 0) - (a.created_at?.getTime() || 0);
      });
  }
  
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.notificationCurrentId++;
    const notification: Notification = { 
      ...insertNotification, 
      id, 
      created_at: new Date() 
    };
    this.notifications.set(id, notification);
    return notification;
  }
  
  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const notification = await this.getNotification(id);
    if (!notification) return undefined;
    
    const updatedNotification = { ...notification, read: true };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }
}

export const storage = new MemStorage();
