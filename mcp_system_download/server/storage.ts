import {
  User,
  InsertUser,
  users,
  PickupPartner,
  InsertPickupPartner,
  pickupPartners,
  Order,
  InsertOrder,
  orders,
  Transaction,
  InsertTransaction,
  transactions,
  Notification,
  InsertNotification,
  notifications,
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserWalletBalance(userId: number, amount: number): Promise<User | undefined>;

  // Pickup Partner methods
  getAllPickupPartners(mcpId: number): Promise<PickupPartner[]>;
  getPickupPartner(id: number): Promise<PickupPartner | undefined>;
  createPickupPartner(partner: InsertPickupPartner): Promise<PickupPartner>;
  updatePickupPartner(id: number, update: Partial<InsertPickupPartner>): Promise<PickupPartner | undefined>;
  deletePickupPartner(id: number): Promise<boolean>;
  updatePickupPartnerWalletBalance(id: number, amount: number): Promise<PickupPartner | undefined>;

  // Order methods
  getAllOrders(mcpId: number): Promise<Order[]>;
  getOrdersByPickupPartner(pickupPartnerId: number): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string, pickupPartnerId?: number): Promise<Order | undefined>;

  // Transaction methods
  getAllTransactions(mcpId: number): Promise<Transaction[]>;
  getTransactionsByPickupPartner(pickupPartnerId: number): Promise<Transaction[]>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;

  // Notification methods
  getAllNotifications(mcpId: number): Promise<Notification[]>;
  getNotification(id: number): Promise<Notification | undefined>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  getUnreadNotificationsCount(mcpId: number): Promise<number>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private pickupPartners: Map<number, PickupPartner>;
  private orders: Map<number, Order>;
  private transactions: Map<number, Transaction>;
  private notifications: Map<number, Notification>;
  private userIdCounter: number;
  private partnerIdCounter: number;
  private orderIdCounter: number;
  private transactionIdCounter: number;
  private notificationIdCounter: number;

  constructor() {
    this.users = new Map();
    this.pickupPartners = new Map();
    this.orders = new Map();
    this.transactions = new Map();
    this.notifications = new Map();
    this.userIdCounter = 1;
    this.partnerIdCounter = 1;
    this.orderIdCounter = 1;
    this.transactionIdCounter = 1;
    this.notificationIdCounter = 1;

    // Add a default user (for demo purposes)
    this.createUser({
      username: "mcp_admin",
      password: "password123",
      name: "Rajesh Kumar",
      email: "rajesh@example.com",
      phone: "+91 9876543210",
    }).then((user) => {
      this.updateUserWalletBalance(user.id, 25432.50);
      
      // Add some demo pickup partners
      this.createPickupPartner({
        name: "Amit Mishra",
        phone: "+91 9876543210",
        email: "amit@example.com",
        address: "123 Main St, Delhi",
        isActive: true,
        commissionType: "percentage",
        commissionValue: 10,
        mcpId: user.id,
      }).then((partner1) => {
        this.updatePickupPartnerWalletBalance(partner1.id, 1250);
        
        // Add some orders for this partner
        this.createOrder({
          orderNumber: "ORD12345",
          amount: 120,
          status: "completed",
          location: "Sector 15, Delhi",
          customerId: "CUST001",
          mcpId: user.id,
          pickupPartnerId: partner1.id,
        });
        
        this.createOrder({
          orderNumber: "ORD12341",
          amount: 110,
          status: "completed",
          location: "Sector 10, Delhi",
          customerId: "CUST002",
          mcpId: user.id,
          pickupPartnerId: partner1.id,
        });
      });
      
      this.createPickupPartner({
        name: "Suresh Patel",
        phone: "+91 8765432109",
        email: "suresh@example.com",
        address: "456 Park Ave, Mumbai",
        isActive: true,
        commissionType: "fixed",
        commissionValue: 50,
        mcpId: user.id,
      }).then((partner2) => {
        this.updatePickupPartnerWalletBalance(partner2.id, 850);
        
        this.createOrder({
          orderNumber: "ORD12344",
          amount: 85,
          status: "in_progress",
          location: "Sector 18, Mumbai",
          customerId: "CUST003",
          mcpId: user.id,
          pickupPartnerId: partner2.id,
        });
      });
      
      this.createPickupPartner({
        name: "Ramesh Kumar",
        phone: "+91 7654321098",
        email: "ramesh@example.com",
        address: "789 Lake View, Bangalore",
        isActive: false,
        commissionType: "percentage",
        commissionValue: 8,
        mcpId: user.id,
      }).then((partner3) => {
        this.updatePickupPartnerWalletBalance(partner3.id, 320);
        
        this.createOrder({
          orderNumber: "ORD12342",
          amount: 95,
          status: "completed",
          location: "Sector 20, Bangalore",
          customerId: "CUST004",
          mcpId: user.id,
          pickupPartnerId: partner3.id,
        });
      });
      
      // Create an unassigned order
      this.createOrder({
        orderNumber: "ORD12343",
        amount: 75,
        status: "unassigned",
        location: "Sector 15, Noida",
        customerId: "CUST005",
        mcpId: user.id,
        pickupPartnerId: undefined,
      });
      
      // Add some transactions
      this.createTransaction({
        type: "deposit",
        amount: 5000,
        description: "Added Funds to Wallet",
        mcpId: user.id,
        pickupPartnerId: undefined,
        orderId: undefined,
      });
      
      this.createTransaction({
        type: "transfer",
        amount: -500,
        description: "Transferred to Amit Mishra",
        mcpId: user.id,
        pickupPartnerId: 1,
        orderId: undefined,
      });
      
      this.createTransaction({
        type: "transfer",
        amount: -750,
        description: "Transferred to Suresh Patel",
        mcpId: user.id,
        pickupPartnerId: 2,
        orderId: undefined,
      });
      
      this.createTransaction({
        type: "withdrawal",
        amount: -10000,
        description: "Withdrawal to Bank Account",
        mcpId: user.id,
        pickupPartnerId: undefined,
        orderId: undefined,
      });
      
      // Add some notifications
      this.createNotification({
        type: "order",
        message: "New order #ORD12345 has been assigned to Amit Mishra",
        mcpId: user.id,
      });
      
      this.createNotification({
        type: "wallet",
        message: "Successfully added ₹5,000 to your wallet",
        mcpId: user.id,
      });
      
      this.createNotification({
        type: "partner",
        message: "Amit Mishra has completed order #ORD12345",
        mcpId: user.id,
      });
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id, walletBalance: "0" };
    this.users.set(id, user);
    return user;
  }

  async updateUserWalletBalance(userId: number, amount: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const currentBalance = parseFloat(user.walletBalance);
    const updatedUser = {
      ...user,
      walletBalance: (currentBalance + amount).toFixed(2),
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Pickup Partner methods
  async getAllPickupPartners(mcpId: number): Promise<PickupPartner[]> {
    return Array.from(this.pickupPartners.values()).filter(
      partner => partner.mcpId === mcpId
    );
  }

  async getPickupPartner(id: number): Promise<PickupPartner | undefined> {
    return this.pickupPartners.get(id);
  }

  async createPickupPartner(partner: InsertPickupPartner): Promise<PickupPartner> {
    const id = this.partnerIdCounter++;
    const newPartner: PickupPartner = { ...partner, id, walletBalance: "0" };
    this.pickupPartners.set(id, newPartner);
    return newPartner;
  }

  async updatePickupPartner(id: number, update: Partial<InsertPickupPartner>): Promise<PickupPartner | undefined> {
    const partner = await this.getPickupPartner(id);
    if (!partner) return undefined;
    
    const updatedPartner = { ...partner, ...update };
    this.pickupPartners.set(id, updatedPartner);
    return updatedPartner;
  }

  async deletePickupPartner(id: number): Promise<boolean> {
    return this.pickupPartners.delete(id);
  }

  async updatePickupPartnerWalletBalance(id: number, amount: number): Promise<PickupPartner | undefined> {
    const partner = await this.getPickupPartner(id);
    if (!partner) return undefined;
    
    const currentBalance = parseFloat(partner.walletBalance);
    const updatedPartner = {
      ...partner,
      walletBalance: (currentBalance + amount).toFixed(2),
    };
    
    this.pickupPartners.set(id, updatedPartner);
    return updatedPartner;
  }

  // Order methods
  async getAllOrders(mcpId: number): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(order => order.mcpId === mcpId)
      .sort((a, b) => {
        // Sort by created date (newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }

  async getOrdersByPickupPartner(pickupPartnerId: number): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(order => order.pickupPartnerId === pickupPartnerId)
      .sort((a, b) => {
        // Sort by created date (newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.orderIdCounter++;
    const newOrder: Order = { 
      ...order, 
      id, 
      createdAt: new Date() 
    };
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async updateOrderStatus(id: number, status: string, pickupPartnerId?: number): Promise<Order | undefined> {
    const order = await this.getOrder(id);
    if (!order) return undefined;
    
    const updatedOrder = { 
      ...order, 
      status,
      ...(pickupPartnerId !== undefined && { pickupPartnerId }),
    };
    
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // Transaction methods
  async getAllTransactions(mcpId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.mcpId === mcpId)
      .sort((a, b) => {
        // Sort by created date (newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }

  async getTransactionsByPickupPartner(pickupPartnerId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.pickupPartnerId === pickupPartnerId)
      .sort((a, b) => {
        // Sort by created date (newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionIdCounter++;
    const newTransaction: Transaction = { 
      ...transaction, 
      id, 
      createdAt: new Date() 
    };
    this.transactions.set(id, newTransaction);
    return newTransaction;
  }

  // Notification methods
  async getAllNotifications(mcpId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.mcpId === mcpId)
      .sort((a, b) => {
        // Sort by created date (newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }

  async getNotification(id: number): Promise<Notification | undefined> {
    return this.notifications.get(id);
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = this.notificationIdCounter++;
    const newNotification: Notification = { 
      ...notification, 
      id, 
      isRead: false,
      createdAt: new Date() 
    };
    this.notifications.set(id, newNotification);
    return newNotification;
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const notification = await this.getNotification(id);
    if (!notification) return undefined;
    
    const updatedNotification = { ...notification, isRead: true };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }

  async getUnreadNotificationsCount(mcpId: number): Promise<number> {
    const notifications = await this.getAllNotifications(mcpId);
    return notifications.filter(notification => !notification.isRead).length;
  }
}

export const storage = new MemStorage();
