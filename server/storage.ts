import { 
  User, InsertUser, 
  PickupPartner, InsertPickupPartner,
  Wallet, InsertWallet,
  Transaction, InsertTransaction,
  Order, InsertOrder,
  Notification, InsertNotification
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Pickup Partner methods
  getPartners(): Promise<PickupPartner[]>;
  getPartner(id: number): Promise<PickupPartner | undefined>;
  createPartner(partner: InsertPickupPartner): Promise<PickupPartner>;
  updatePartner(id: number, updates: Partial<PickupPartner>): Promise<PickupPartner | undefined>;
  deletePartner(id: number): Promise<boolean>;
  
  // Wallet methods
  getWallet(id: number): Promise<Wallet | undefined>;
  getWalletByUserId(userId: number): Promise<Wallet | undefined>;
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  updateWalletBalance(id: number, amount: number): Promise<Wallet | undefined>;
  
  // Transaction methods
  getTransactions(): Promise<Transaction[]>;
  getTransactionsByWalletId(walletId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Order methods
  getOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  getOrdersByPartnerId(partnerId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  assignOrderToPartner(orderId: number, partnerId: number): Promise<Order | undefined>;
  
  // Notification methods
  getNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private partners: Map<number, PickupPartner>;
  private wallets: Map<number, Wallet>;
  private transactions: Map<number, Transaction>;
  private orders: Map<number, Order>;
  private notifications: Map<number, Notification>;
  
  private userId: number;
  private partnerId: number;
  private walletId: number;
  private transactionId: number;
  private orderId: number;
  private notificationId: number;
  private orderIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.partners = new Map();
    this.wallets = new Map();
    this.transactions = new Map();
    this.orders = new Map();
    this.notifications = new Map();
    
    this.userId = 1;
    this.partnerId = 1;
    this.walletId = 1;
    this.transactionId = 1;
    this.orderId = 1;
    this.notificationId = 1;
    this.orderIdCounter = 2485; // Start with ORD-2485 for demo
    
    this.seedData();
  }

  // Seed some initial data for demo purposes
  private seedData() {
    // Create admin user
    const adminUser: InsertUser = {
      username: "admin",
      password: "password", // In real world, this would be hashed
      fullName: "John Doe",
      email: "john.doe@example.com",
      phone: "1234567890",
      role: "mcp",
    };
    
    const admin = this.createUser(adminUser);
    
    // Create wallet for admin
    const adminWallet: InsertWallet = {
      userId: admin.id,
      balance: 24500,
    };
    
    this.createWallet(adminWallet);
    
    // Create some pickup partners
    const partners = [
      { name: "Rahul Kumar", email: "rahul@example.com", phone: "9876543210", status: "active", commissionType: "percentage", commissionValue: 10 },
      { name: "Anita Rao", email: "anita@example.com", phone: "9876543211", status: "active", commissionType: "fixed", commissionValue: 20 },
      { name: "Sanjay Patel", email: "sanjay@example.com", phone: "9876543212", status: "active", commissionType: "percentage", commissionValue: 15 },
      { name: "Meera Gupta", email: "meera@example.com", phone: "9876543213", status: "inactive", commissionType: "fixed", commissionValue: 25 }
    ];
    
    partners.forEach(partnerData => {
      const partner: InsertPickupPartner = {
        userId: admin.id,
        ...partnerData
      };
      const createdPartner = this.createPartner(partner);
      
      // Create wallet for each partner
      const partnerWallet: InsertWallet = {
        userId: createdPartner.id,
        balance: Math.floor(Math.random() * 1000) + 500,
      };
      
      this.createWallet(partnerWallet);
      
      // Create some orders for active partners
      if (createdPartner.status === "active") {
        const orderStatuses = ["pending", "in_progress", "completed"];
        const orderLocations = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata"];
        
        for (let i = 0; i < Math.floor(Math.random() * 10) + 5; i++) {
          const orderStatus = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
          
          const order: InsertOrder = {
            orderId: `#ORD-${this.orderIdCounter++}`,
            partnerId: createdPartner.id,
            status: orderStatus,
            amount: Math.floor(Math.random() * 500) + 100,
            pickupLocation: orderLocations[Math.floor(Math.random() * orderLocations.length)],
            dropLocation: orderLocations[Math.floor(Math.random() * orderLocations.length)],
          };
          
          this.createOrder(order);
        }
      }
    });
    
    // Create some transactions
    const transactionTypes = ["deposit", "withdrawal", "transfer"];
    const descriptions = ["Added to wallet", "Withdrawal", "Transfer to partner"];
    
    for (let i = 0; i < 10; i++) {
      const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
      const amount = Math.floor(Math.random() * 1000) + 100;
      
      const transaction: InsertTransaction = {
        walletId: 1, // Admin wallet
        type,
        amount: type === "withdrawal" || type === "transfer" ? -amount : amount,
        description: descriptions[transactionTypes.indexOf(type)],
        status: "completed",
        metadata: {
          date: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000).toISOString(),
          method: type === "deposit" ? "UPI" : "Wallet"
        }
      };
      
      this.createTransaction(transaction);
    }
    
    // Create some notifications
    const notificationTypes = ["order_update", "transaction", "system"];
    const messages = [
      "New order assigned",
      "Order status updated",
      "Funds added to wallet",
      "Partner completed an order",
      "Low wallet balance"
    ];
    
    for (let i = 0; i < 5; i++) {
      const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
      
      const notification: InsertNotification = {
        userId: admin.id,
        type,
        message: messages[Math.floor(Math.random() * messages.length)],
        read: Math.random() > 0.7, // 30% read, 70% unread
        metadata: {
          timestamp: new Date(Date.now() - Math.floor(Math.random() * 3) * 24 * 60 * 60 * 1000).toISOString()
        }
      };
      
      this.createNotification(notification);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Pickup Partner methods
  async getPartners(): Promise<PickupPartner[]> {
    return Array.from(this.partners.values());
  }
  
  async getPartner(id: number): Promise<PickupPartner | undefined> {
    return this.partners.get(id);
  }
  
  async createPartner(insertPartner: InsertPickupPartner): Promise<PickupPartner> {
    const id = this.partnerId++;
    const now = new Date();
    const partner: PickupPartner = { 
      ...insertPartner, 
      id, 
      totalOrders: 0, 
      completedOrders: 0, 
      createdAt: now
    };
    this.partners.set(id, partner);
    return partner;
  }
  
  async updatePartner(id: number, updates: Partial<PickupPartner>): Promise<PickupPartner | undefined> {
    const partner = this.partners.get(id);
    if (!partner) return undefined;
    
    const updatedPartner = { ...partner, ...updates };
    this.partners.set(id, updatedPartner);
    return updatedPartner;
  }
  
  async deletePartner(id: number): Promise<boolean> {
    return this.partners.delete(id);
  }
  
  // Wallet methods
  async getWallet(id: number): Promise<Wallet | undefined> {
    return this.wallets.get(id);
  }
  
  async getWalletByUserId(userId: number): Promise<Wallet | undefined> {
    return Array.from(this.wallets.values()).find(wallet => wallet.userId === userId);
  }
  
  async createWallet(insertWallet: InsertWallet): Promise<Wallet> {
    const id = this.walletId++;
    const now = new Date();
    const wallet: Wallet = { ...insertWallet, id, updatedAt: now };
    this.wallets.set(id, wallet);
    return wallet;
  }
  
  async updateWalletBalance(id: number, amount: number): Promise<Wallet | undefined> {
    const wallet = this.wallets.get(id);
    if (!wallet) return undefined;
    
    const now = new Date();
    const updatedWallet: Wallet = {
      ...wallet,
      balance: wallet.balance + amount,
      updatedAt: now
    };
    
    this.wallets.set(id, updatedWallet);
    return updatedWallet;
  }
  
  // Transaction methods
  async getTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values());
  }
  
  async getTransactionsByWalletId(walletId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.walletId === walletId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionId++;
    const now = new Date();
    const transaction: Transaction = { ...insertTransaction, id, createdAt: now };
    this.transactions.set(id, transaction);
    return transaction;
  }
  
  // Order methods
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }
  
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
  
  async getOrdersByPartnerId(partnerId: number): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(order => order.partnerId === partnerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.orderId++;
    const now = new Date();
    
    // Generate a readable order ID if not provided
    const orderId = insertOrder.orderId || `#ORD-${this.orderIdCounter++}`;
    
    const order: Order = {
      ...insertOrder,
      id,
      orderId,
      createdAt: now,
      updatedAt: now
    };
    
    this.orders.set(id, order);
    
    // Update partner's total orders count
    if (order.partnerId) {
      const partner = await this.getPartner(order.partnerId);
      if (partner) {
        await this.updatePartner(partner.id, {
          totalOrders: partner.totalOrders + 1
        });
      }
    }
    
    return order;
  }
  
  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const now = new Date();
    const updatedOrder: Order = {
      ...order,
      status,
      updatedAt: now
    };
    
    this.orders.set(id, updatedOrder);
    
    // If order is completed, update partner's completed orders count
    if (status === "completed" && order.partnerId) {
      const partner = await this.getPartner(order.partnerId);
      if (partner) {
        await this.updatePartner(partner.id, {
          completedOrders: partner.completedOrders + 1
        });
      }
    }
    
    return updatedOrder;
  }
  
  async assignOrderToPartner(orderId: number, partnerId: number): Promise<Order | undefined> {
    const order = this.orders.get(orderId);
    if (!order) return undefined;
    
    const now = new Date();
    const updatedOrder: Order = {
      ...order,
      partnerId,
      updatedAt: now
    };
    
    this.orders.set(orderId, updatedOrder);
    return updatedOrder;
  }
  
  // Notification methods
  async getNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.notificationId++;
    const now = new Date();
    const notification: Notification = { ...insertNotification, id, createdAt: now };
    this.notifications.set(id, notification);
    return notification;
  }
  
  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    if (!notification) return undefined;
    
    const updatedNotification: Notification = {
      ...notification,
      read: true
    };
    
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }
}

export const storage = new MemStorage();
