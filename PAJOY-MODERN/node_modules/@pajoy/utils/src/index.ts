import { Product, Customer, Sale, PaymentMethod, User, UserRole } from '@pajoy/types';
import { CURRENCIES, VALIDATION_RULES } from '@pajoy/constants';

// Currency Utilities
export const formatCurrency = (amount: number, currency = CURRENCIES.KES): string => {
  return `${currency.symbol} ${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

export const parseCurrency = (formatted: string, currency = CURRENCIES.KES): number => {
  const clean = formatted.replace(new RegExp(`[^\\d.]`, 'g'), '');
  return parseFloat(clean) || 0;
};

export const calculateTax = (amount: number, rate = 0.16): number => {
  return amount * rate;
};

export const calculateTotal = (subtotal: number, tax = 0.16, discount = 0): number => {
  const taxAmount = calculateTax(subtotal, tax);
  return subtotal + taxAmount - discount;
};

// Phone Validation Utilities
export const validateKenyanPhone = (phone: string): boolean => {
  return VALIDATION_RULES.PHONE.KENYA.test(phone);
};

export const formatKenyanPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('254') && cleaned.length === 12) {
    return cleaned;
  } else if (cleaned.startsWith('0') && cleaned.length === 10) {
    return '254' + cleaned.substring(1);
  } else if (cleaned.startsWith('7') && cleaned.length === 9) {
    return '254' + cleaned;
  }
  
  return phone;
};

// Email Validation
export const validateEmail = (email: string): boolean => {
  return VALIDATION_RULES.EMAIL.test(email);
};

// SKU Generation
export const generateSKU = (category: string, name: string, variant?: string): string => {
  const prefix = category.substring(0, 3).toUpperCase();
  const suffix = name.substring(0, 6).toUpperCase().replace(/\s/g, '');
  const variantCode = variant ? variant.substring(0, 3).toUpperCase() : '';
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  
  return `${prefix}${suffix}${variantCode}${random}`;
};

// Barcode Generation
export const generateBarcode = (): string => {
  return Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
};

// Receipt Number Generation
export const generateReceiptNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `RC${year}${month}${day}${random}`;
};

// Job Number Generation
export const generateJobNumber = (prefix: string): string => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const sequence = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  
  return `${prefix.toUpperCase()}${year}${month}${day}${sequence}`;
};

// Date Utilities
export const formatDate = (date: Date, format = 'short'): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: format === 'short' ? 'short' : 'long',
    day: 'numeric'
  };
  
  return date.toLocaleDateString('en-KE', options);
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-KE', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDateTime = (date: Date): string => {
  return `${formatDate(date)} ${formatTime(date)}`;
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

export const isThisWeek = (date: Date): boolean => {
  const today = new Date();
  const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
  const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
  
  return date >= weekStart && date <= weekEnd;
};

export const isThisMonth = (date: Date): boolean => {
  const today = new Date();
  return date.getMonth() === today.getMonth() && 
         date.getFullYear() === today.getFullYear();
};

// Inventory Utilities
export const calculateStockValue = (stock: number, unitPrice: number): number => {
  return stock * unitPrice;
};

export const isLowStock = (currentStock: number, threshold = 10): boolean => {
  return currentStock <= threshold;
};

export const calculateProfit = (salePrice: number, costPrice: number, quantity = 1): number => {
  return (salePrice - costPrice) * quantity;
};

export const calculateProfitMargin = (salePrice: number, costPrice: number): number => {
  if (salePrice === 0) return 0;
  return ((salePrice - costPrice) / salePrice) * 100;
};

// Customer Utilities
export const calculateCustomerBalance = (totalPurchases: number, totalPayments: number): number => {
  return totalPurchases - totalPayments;
};

export const isCreditLimitExceeded = (currentBalance: number, creditLimit: number): boolean => {
  return currentBalance > creditLimit;
};

// Payment Utilities
export const validatePayment = (amount: number, method: PaymentMethod, customerBalance = 0): boolean => {
  if (amount <= 0) return false;
  
  if (method === 'credit' && customerBalance > 0) {
    return false; // Can't use credit if customer has outstanding balance
  }
  
  return true;
};

export const splitPayment = (total: number, methods: { method: PaymentMethod; amount: number }[]): boolean => {
  const totalPaid = methods.reduce((sum, payment) => sum + payment.amount, 0);
  return Math.abs(totalPaid - total) < 0.01; // Allow for floating point precision
};

// Search Utilities
export const searchProducts = (products: Product[], query: string): Product[] => {
  const lowercaseQuery = query.toLowerCase();
  
  return products.filter(product => 
    product.name.toLowerCase().includes(lowercaseQuery) ||
    product.sku.toLowerCase().includes(lowercaseQuery) ||
    product.category.toLowerCase().includes(lowercaseQuery) ||
    (product.barcode && product.barcode.includes(query))
  );
};

export const searchCustomers = (customers: Customer[], query: string): Customer[] => {
  const lowercaseQuery = query.toLowerCase();
  
  return customers.filter(customer => 
    customer.name.toLowerCase().includes(lowercaseQuery) ||
    (customer.phone && customer.phone.includes(query)) ||
    (customer.email && customer.email.toLowerCase().includes(lowercaseQuery)) ||
    (customer.schoolName && customer.schoolName.toLowerCase().includes(lowercaseQuery))
  );
};

// Array Utilities
export const groupBy = <T, K extends keyof any>(array: T[], key: (item: T) => K): Record<K, T[]> => {
  return array.reduce((groups, item) => {
    const groupKey = key(item);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<K, T[]>);
};

export const sortBy = <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

export const unique = <T>(array: T[]): T[] => {
  return [...new Set(array)];
};

// Validation Utilities
export const validateRequired = (value: any, fieldName: string): string | null => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateNumber = (value: any, fieldName: string, min = 0, max?: number): string | null => {
  const num = parseFloat(value);
  
  if (isNaN(num)) {
    return `${fieldName} must be a valid number`;
  }
  
  if (num < min) {
    return `${fieldName} must be at least ${min}`;
  }
  
  if (max && num > max) {
    return `${fieldName} must be at most ${max}`;
  }
  
  return null;
};

export const validateLength = (value: string, fieldName: string, min: number, max?: number): string | null => {
  if (value.length < min) {
    return `${fieldName} must be at least ${min} characters`;
  }
  
  if (max && value.length > max) {
    return `${fieldName} must be at most ${max} characters`;
  }
  
  return null;
};

// Error Handling Utilities
export const createError = (code: string, message: string, details?: any): Error => {
  const error = new Error(message) as any;
  error.code = code;
  error.details = details;
  error.timestamp = new Date();
  return error;
};

export const isError = (value: any): value is Error => {
  return value instanceof Error;
};

// Async Utilities
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const retry = async <T>(
  fn: () => Promise<T>,
  attempts = 3,
  delayMs = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < attempts - 1) {
        await delay(delayMs * Math.pow(2, i)); // Exponential backoff
      }
    }
  }
  
  throw lastError!;
};

// Local Storage Utilities
export const storage = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch {
      return defaultValue || null;
    }
  },
  
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },
  
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  },
  
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }
};

// User Permission Utilities
export const hasPermission = (user: User, permission: string): boolean => {
  return user.permissions.includes(permission);
};

export const hasRole = (user: User, role: UserRole): boolean => {
  return user.role === role;
};

export const canAccess = (user: User, requiredPermissions: string[]): boolean => {
  return requiredPermissions.every(permission => hasPermission(user, permission));
};

// File Utilities
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

export const isImageFile = (filename: string): boolean => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
  return imageExtensions.includes(getFileExtension(filename));
};

export const isDocumentFile = (filename: string): boolean => {
  const docExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
  return docExtensions.includes(getFileExtension(filename));
};

// Debounce Utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle Utility
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Deep Clone Utility
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any;
  if (typeof obj === 'object') {
    const cloned = {} as any;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
  return obj;
};

// Generate UUID
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Hash Utility (simple)
export const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
};
