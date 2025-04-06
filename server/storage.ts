import { 
  users, type User, type InsertUser,
  pickupPartners, type PickupPartner, type InsertPickupPartner,
  orders, type Order, type InsertOrder,
  transactions, type Transaction, type InsertTransaction,
  notifications, type Notification, type InsertNotification
} from "@shared/schema";

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserWallet(id: number, amount: number): Promise<User | undefined>;
  
  // Pickup Partner operations
  getPartner(id: number): Promise<PickupPartner | undefined>;
  getPartnerByCode(code: string): Promise<PickupPartner | undefined>;
  getAllPartners(): Promise<PickupPartner[]>;
  createPartner(partner: InsertPickupPartner): Promise<PickupPartner>;
  updatePartner(id: number, updates: Partial<InsertPickupPartner>): Promise<PickupPartner | undefined>;
  updatePartnerWallet(id: number, amount: number): Promise<PickupPartner | undefined>;
  
  // Order operations
  getOrder(id: number): Promise<Order | undefined>;
  getOrderByNumber(orderNumber: string): Promise<Order | undefined>;
  getAllOrders(): Promise<Order[]>;
  getOrdersByPartner(partnerId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string, partnerId?: number): Promise<Order | undefined>;
  
  // Transaction operations
  getTransaction(id: number): Promise<Transaction | undefined>;
  getAllTransactions(): Promise<Transaction[]>;
  getUserTransactions(userId: number): Promise<Transaction[]>;
  getPartnerTransactions(partnerId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Notification operations
  getNotification(id: number): Promise<Notification | undefined>;
  getUserNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;

  // Dashboard data
  getDashboardStats(userId: number): Promise<{
    walletBalance: number;
    totalPartners: number;
    activePartners: number;
    inactivePartners: number;
    totalOrders: number;
    pendingOrders: number;
    inProgressOrders: number;
    completedOrders: number;
    todaysEarnings: number;
  }>;
}

// In-memory implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private partners: Map<number, PickupPartner>;
  private orders: Map<number, Order>;
  private transactions: Map<number, Transaction>;
  private notifications: Map<number, Notification>;
  
  private userId: number;
  private partnerId: number;
  private orderId: number;
  private transactionId: number;
  private notificationId: number;

  constructor() {
    this.users = new Map();
    this.partners = new Map();
    this.orders = new Map();
    this.transactions = new Map();
    this.notifications = new Map();
    
    this.userId = 1;
    this.partnerId = 1;
    this.orderId = 1;
    this.transactionId = 1;
    this.notificationId = 1;

    // Add default user with some initial data
    this.setupDefaultData();
  }

  private setupDefaultData() {
    // Create a default MCP user
    const defaultUser: InsertUser = {
      username: "mcp_admin",
      password: "password123", // In a real app, this would be hashed
      name: "MCP Admin",
      email: "admin@mcpsystem.com",
      phone: "+919876543210"
    };
    
    const user = this.createUser(defaultUser);
    
    // Set wallet balance for the user
    this.updateUserWallet(user.id, 15245);

    // Create some sample partners
    const partners = [
      {
        name: "Rahul Patel",
        phone: "+919876543201",
        email: "rahul@example.com",
        commissionType: "percentage",
        commissionValue: 10,
        isActive: true
      },
      {
        name: "Sanjay Kumar",
        phone: "+919876543202",
        email: "sanjay@example.com",
        commissionType: "fixed",
        commissionValue: 50,
        isActive: true
      },
      {
        name: "Amit Gupta",
        phone: "+919876543203",
        email: "amit@example.com",
        commissionType: "percentage",
        commissionValue: 8,
        isActive: false
      },
      {
        name: "Priya Singh",
        phone: "+919876543204",
        email: "priya@example.com",
        commissionType: "fixed",
        commissionValue: 60,
        isActive: true
      }
    ];

    partners.forEach(async (partnerData) => {
      const partner = await this.createPartner(partnerData as InsertPickupPartner);
      
      // Add wallet balance for partners
      if (partner.name === "Rahul Patel") {
        this.updatePartnerWallet(partner.id, 1245);
      } else if (partner.name === "Sanjay Kumar") {
        this.updatePartnerWallet(partner.id, 780);
      } else if (partner.name === "Amit Gupta") {
        this.updatePartnerWallet(partner.id, 50);
      } else if (partner.name === "Priya Singh") {
        this.updatePartnerWallet(partner.id, 950);
      }
    });

    // Create sample transactions
    const sampleTransactions = [
      {
        amount: 5000,
        type: "wallet_funded",
        description: "Wallet Funded",
        userId: user.id,
        partnerId: null,
        orderId: null
      },
      {
        amount: -500,
        type: "transfer_to_partner",
        description: "Transfer to Rahul Patel",
        userId: user.id,
        partnerId: 1,
        orderId: null
      },
      {
        amount: -750,
        type: "transfer_to_partner",
        description: "Transfer to Priya Singh",
        userId: user.id,
        partnerId: 4,
        orderId: null
      },
      {
        amount: 10000,
        type: "wallet_funded",
        description: "Wallet Funded",
        userId: user.id,
        partnerId: null,
        orderId: null
      }
    ];

    sampleTransactions.forEach((txData) => {
      this.createTransaction(txData as InsertTransaction);
    });

    // Create sample notifications
    const sampleNotifications = [
      {
        userId: user.id,
        title: "New order assigned to Rahul Patel",
        message: "Order #ORD-7890 has been assigned.",
        type: "info"
      },
      {
        userId: user.id,
        title: "Sanjay Kumar's wallet balance low",
        message: "Balance below ₹500.00. Consider adding funds.",
        type: "warning"
      },
      {
        userId: user.id,
        title: "Priya Singh completed 3 orders",
        message: "Orders #ORD-7845, #ORD-7846, and #ORD-7847 completed.",
        type: "success"
      },
      {
        userId: user.id,
        title: "System maintenance scheduled",
        message: "System will be down for maintenance on Sunday, 2 AM - 4 AM.",
        type: "info"
      }
    ];

    sampleNotifications.forEach((notifData) => {
      this.createNotification(notifData as InsertNotification);
    });

    // Create some orders
    const createOrdersForPartner = async (partnerId: number, count: number, completedCount: number) => {
      for (let i = 0; i < count; i++) {
        const status = i < completedCount ? "completed" : i < completedCount + 2 ? "in_progress" : "pending";
        const orderData: InsertOrder = {
          customerId: `CUST-${10000 + i}`,
          customerName: `Customer ${i + 1}`,
          orderValue: 100 + Math.floor(Math.random() * 900),
          pickupPartnerId: partnerId
        };
        
        const order = await this.createOrder(orderData);
        await this.updateOrderStatus(order.id, status, partnerId);
      }
    };

    // Delay to ensure partners are created first
    setTimeout(() => {
      createOrdersForPartner(1, 12, 8); // Rahul: 12 orders, 8 completed
      createOrdersForPartner(2, 7, 5);  // Sanjay: 7 orders, 5 completed
      createOrdersForPartner(4, 9, 6);  // Priya: 9 orders, 6 completed
    }, 100);
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
    const user: User = { ...insertUser, id, walletBalance: 0 };
    this.users.set(id, user);
    return user;
  }

  async updateUserWallet(id: number, amount: number): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = {
      ...user,
      walletBalance: amount,
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Pickup Partner methods
  async getPartner(id: number): Promise<PickupPartner | undefined> {
    return this.partners.get(id);
  }

  async getPartnerByCode(code: string): Promise<PickupPartner | undefined> {
    return Array.from(this.partners.values()).find(
      (partner) => partner.partnerCode === code,
    );
  }

  async getAllPartners(): Promise<PickupPartner[]> {
    return Array.from(this.partners.values());
  }

  async createPartner(insertPartner: InsertPickupPartner): Promise<PickupPartner> {
    const id = this.partnerId++;
    const partnerCode = `P-${10000 + id}`;
    const createdAt = new Date();
    
    const partner: PickupPartner = {
      ...insertPartner,
      id,
      partnerCode,
      walletBalance: 0,
      createdAt,
    };
    
    this.partners.set(id, partner);
    return partner;
  }

  async updatePartner(id: number, updates: Partial<InsertPickupPartner>): Promise<PickupPartner | undefined> {
    const partner = this.partners.get(id);
    if (!partner) return undefined;
    
    const updatedPartner = {
      ...partner,
      ...updates,
    };
    
    this.partners.set(id, updatedPartner);
    return updatedPartner;
  }

  async updatePartnerWallet(id: number, amount: number): Promise<PickupPartner | undefined> {
    const partner = this.partners.get(id);
    if (!partner) return undefined;
    
    const updatedPartner = {
      ...partner,
      walletBalance: amount,
    };
    
    this.partners.set(id, updatedPartner);
    return updatedPartner;
  }

  // Order methods
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    return Array.from(this.orders.values()).find(
      (order) => order.orderNumber === orderNumber,
    );
  }

  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getOrdersByPartner(partnerId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.pickupPartnerId === partnerId,
    );
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.orderId++;
    const orderNumber = `ORD-${10000 + id}`;
    const createdAt = new Date();
    
    const order: Order = {
      ...insertOrder,
      id,
      orderNumber,
      status: "pending",
      createdAt,
      completedAt: null,
    };
    
    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(id: number, status: string, partnerId?: number): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = {
      ...order,
      status,
      pickupPartnerId: partnerId !== undefined ? partnerId : order.pickupPartnerId,
      completedAt: status === "completed" ? new Date() : order.completedAt,
    };
    
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // Transaction methods
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values());
  }

  async getUserTransactions(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (tx) => tx.userId === userId,
    );
  }

  async getPartnerTransactions(partnerId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (tx) => tx.partnerId === partnerId,
    );
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionId++;
    const createdAt = new Date();
    
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      createdAt,
    };
    
    this.transactions.set(id, transaction);
    return transaction;
  }

  // Notification methods
  async getNotification(id: number): Promise<Notification | undefined> {
    return this.notifications.get(id);
  }

  async getUserNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values()).filter(
      (notif) => notif.userId === userId,
    );
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.notificationId++;
    const createdAt = new Date();
    
    const notification: Notification = {
      ...insertNotification,
      id,
      isRead: false,
      createdAt,
    };
    
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    if (!notification) return undefined;
    
    const updatedNotification = {
      ...notification,
      isRead: true,
    };
    
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }

  // Dashboard stats
  async getDashboardStats(userId: number): Promise<{
    walletBalance: number;
    totalPartners: number;
    activePartners: number;
    inactivePartners: number;
    totalOrders: number;
    pendingOrders: number;
    inProgressOrders: number;
    completedOrders: number;
    todaysEarnings: number;
  }> {
    const user = await this.getUser(userId);
    const partners = await this.getAllPartners();
    const orders = await this.getAllOrders();
    const transactions = await this.getAllTransactions();
    
    // Count partners
    const activePartners = partners.filter(p => p.isActive).length;
    const inactivePartners = partners.filter(p => !p.isActive).length;
    
    // Count orders by status
    const pendingOrders = orders.filter(o => o.status === "pending").length;
    const inProgressOrders = orders.filter(o => o.status === "in_progress").length;
    const completedOrders = orders.filter(o => o.status === "completed").length;
    
    // Calculate today's earnings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaysEarnings = transactions
      .filter(tx => 
        tx.type === "order_payment" && 
        tx.createdAt >= today &&
        tx.amount > 0
      )
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    return {
      walletBalance: user?.walletBalance || 0,
      totalPartners: partners.length,
      activePartners,
      inactivePartners,
      totalOrders: orders.length,
      pendingOrders,
      inProgressOrders,
      completedOrders,
      todaysEarnings,
    };
  }
}

export const storage = new MemStorage();
