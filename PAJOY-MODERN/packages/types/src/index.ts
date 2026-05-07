// Core Business Types
export interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  basePrice: number;
  costPrice: number;
  sku: string;
  barcode?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  productId: string;
  size: string;
  colour: string;
  stock: number;
  price: number;
  sku: string;
  barcode?: string;
  isActive: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  customerType: 'individual' | 'school' | 'organization';
  schoolName?: string;
  creditLimit?: number;
  currentBalance: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Sale {
  id: string;
  receiptNumber: string;
  customerId?: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: SaleStatus;
  cashierId: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  variantId?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discount: number;
}

export interface EmbroideryJob {
  id: string;
  customerId: string;
  jobNumber: string;
  designType: 'logo' | 'text' | 'custom';
  designFile?: string;
  designDescription: string;
  garmentType: string;
  quantity: number;
  pricePerItem: number;
  totalPrice: number;
  status: JobStatus;
  priority: 'low' | 'medium' | 'high';
  estimatedCompletion?: Date;
  actualCompletion?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrintingJob {
  id: string;
  customerId: string;
  jobNumber: string;
  designType: 'screen' | 'digital' | 'heat-transfer';
  designFile?: string;
  designDescription: string;
  garmentType: string;
  colors: number;
  quantity: number;
  pricePerItem: number;
  totalPrice: number;
  status: JobStatus;
  priority: 'low' | 'medium' | 'high';
  estimatedCompletion?: Date;
  actualCompletion?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Payment Types
export type PaymentMethod = 'cash' | 'mpesa' | 'card' | 'pesapal' | 'bank-transfer' | 'credit';
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'failed' | 'refunded';
export type SaleStatus = 'draft' | 'confirmed' | 'paid' | 'cancelled' | 'refunded';
export type JobStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

// Pesapal Integration Types
export interface PesapalPaymentRequest {
  id: string;
  currency: 'KES' | 'USD' | 'EUR';
  amount: number;
  description: string;
  callback_url: string;
  redirect_mode?: string;
  notification_id?: string;
  branch?: string;
  email_address?: string;
  phone_number?: string;
  billing_address?: string;
  billing_city?: string;
  billing_state?: string;
  billing_zipcode?: string;
  billing_country?: string;
}

export interface PesapalPaymentResponse {
  status: string;
  order_tracking_id: string;
  redirect_url?: string;
  payment_method?: string;
  payment_account?: string;
  confirmation_code?: string;
  created_date?: string;
  error?: string;
}

export interface PesapalTransaction {
  id: string;
  merchantRequestId: string;
  orderId?: string;
  customerId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod?: string;
  paymentAccount?: string;
  pesapalReceipt?: string;
  transactionDate?: string;
  createdAt: Date;
  completedAt?: Date;
}

// User & Auth Types
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'admin' | 'manager' | 'cashier' | 'owner';
export type Permission = 
  | 'sales.create'
  | 'sales.edit'
  | 'sales.delete'
  | 'sales.view'
  | 'inventory.manage'
  | 'customers.manage'
  | 'embroidery.manage'
  | 'printing.manage'
  | 'reports.view'
  | 'settings.manage'
  | 'users.manage';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Sync Types
export interface SyncOperation {
  id: string;
  entityType: string;
  entityId: string;
  operation: 'create' | 'update' | 'delete';
  data: any;
  timestamp: Date;
  synced: boolean;
  syncAttempt?: number;
  lastError?: string;
}

export interface SyncStatus {
  lastSyncAt?: Date;
  pendingOperations: number;
  failedOperations: number;
  isOnline: boolean;
  syncInProgress: boolean;
}

// Report Types
export interface SalesReport {
  period: string;
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: Product[];
  paymentMethodBreakdown: Record<PaymentMethod, number>;
  salesByHour: Record<number, number>;
}

export interface InventoryReport {
  totalProducts: number;
  totalStockValue: number;
  lowStockItems: ProductVariant[];
  topSellingItems: ProductVariant[];
  stockMovements: StockMovement[];
}

export interface StockMovement {
  id: string;
  productId: string;
  variantId?: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  referenceId?: string;
  createdAt: Date;
}

// Settings Types
export interface BusinessSettings {
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
  logo?: string;
  currency: 'KES' | 'USD' | 'EUR';
  taxRate: number;
  receiptHeader: string;
  receiptFooter: string;
  lowStockThreshold: number;
  enableCreditSales: boolean;
  creditLimitDays: number;
}

export interface PrinterSettings {
  receiptPrinter: string;
  labelPrinter?: string;
  receiptWidth: number;
  autoPrintReceipt: boolean;
  printCopies: number;
}

// Database Types
export interface DatabaseConfig {
  type: 'sqlite' | 'postgresql';
  host?: string;
  port?: number;
  database: string;
  username?: string;
  password?: string;
  ssl?: boolean;
  synchronize: boolean;
  logging: boolean;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  stack?: string;
}

// Event Types
export interface AppEvent {
  type: string;
  payload: any;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
}

export type EventType = 
  | 'sale.created'
  | 'sale.updated'
  | 'payment.received'
  | 'inventory.updated'
  | 'customer.created'
  | 'job.created'
  | 'job.completed'
  | 'sync.started'
  | 'sync.completed'
  | 'user.login'
  | 'user.logout';
