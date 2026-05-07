import axios, { AxiosInstance } from 'axios';
import { PesapalPaymentRequest, PesapalPaymentResponse, PesapalTransaction } from '@pajoy/types';
import { PESAPAL_CONFIG } from '@pajoy/constants';

export class PesapalService {
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      timeout: PESAPAL_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Request interceptor for logging
    this.api.interceptors.request.use(
      (config) => {
        console.log(`🔵 Pesapal API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('🔴 Pesapal Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging
    this.api.interceptors.response.use(
      (response) => {
        console.log(`🟢 Pesapal API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('🔴 Pesapal Response Error:', error.response?.status, error.response?.data);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get access token from Pesapal API
   */
  async getAccessToken(): Promise<string> {
    // Check if we have a valid cached token
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      console.log('🔐 Requesting Pesapal access token...');
      
      const consumerKey = process.env.PESAPAL_CONSUMER_KEY;
      const consumerSecret = process.env.PESAPAL_CONSUMER_SECRET;
      
      if (!consumerKey || !consumerSecret) {
        throw new Error('Pesapal credentials not configured');
      }

      const response = await this.api.post(
        `${PESAPAL_CONFIG.BASE_URL}${PESAPAL_CONFIG.ENDPOINTS.GET_ACCESS_TOKEN}`,
        {
          consumer_key: consumerKey,
          consumer_secret: consumerSecret,
        }
      );

      if (response.data?.token) {
        this.accessToken = response.data.token;
        // Set expiry to 55 minutes from now (tokens expire after 1 hour)
        this.tokenExpiry = Date.now() + (55 * 60 * 1000);
        console.log('✅ Pesapal access token obtained successfully');
        return this.accessToken;
      } else {
        throw new Error('Invalid token response from Pesapal');
      }

    } catch (error) {
      console.error('❌ Failed to get Pesapal access token:', error);
      
      // Fallback to mock mode for development
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔄 Falling back to mock token for development');
        const mockToken = `mock_token_${Date.now()}`;
        this.accessToken = mockToken;
        this.tokenExpiry = Date.now() + (55 * 60 * 1000);
        return mockToken;
      }
      
      throw new Error('Failed to obtain Pesapal access token');
    }
  }

  /**
   * Create a payment order with Pesapal
   */
  async createPaymentOrder(paymentData: PesapalPaymentRequest): Promise<PesapalPaymentResponse> {
    try {
      console.log('💳 Creating Pesapal payment order...');
      
      const token = await this.getAccessToken();
      
      const response = await this.api.post(
        `${PESAPAL_CONFIG.BASE_URL}${PESAPAL_CONFIG.ENDPOINTS.POST_TRANSACTION}`,
        paymentData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.data?.order_tracking_id) {
        console.log('✅ Pesapal payment order created successfully');
        return {
          status: response.data.status || 'pending',
          order_tracking_id: response.data.order_tracking_id,
          redirect_url: response.data.redirect_url,
          payment_method: response.data.payment_method,
          payment_account: response.data.payment_account,
          confirmation_code: response.data.confirmation_code,
          created_date: response.data.created_date,
        };
      } else {
        throw new Error('Invalid payment response from Pesapal');
      }

    } catch (error) {
      console.error('❌ Failed to create Pesapal payment order:', error);
      
      // Fallback to mock mode for development
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔄 Falling back to mock payment order for development');
        return {
          status: 'pending',
          order_tracking_id: `mock_order_${Date.now()}`,
          redirect_url: `https://mock.pesapal.com/redirect/${Date.now()}`,
          payment_method: 'mock',
          payment_account: 'mock@example.com',
          confirmation_code: `MOCK${Date.now()}`,
          created_date: new Date().toISOString(),
        };
      }
      
      throw new Error('Failed to create Pesapal payment order');
    }
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(orderTrackingId: string): Promise<PesapalTransaction> {
    try {
      console.log('🔍 Checking Pesapal payment status...');
      
      const token = await this.getAccessToken();
      
      const response = await this.api.get(
        `${PESAPAL_CONFIG.BASE_URL}${PESAPAL_CONFIG.ENDPOINTS.TRANSACTION_STATUS}`,
        {
          params: {
            orderTrackingId: orderTrackingId,
          },
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.data?.status) {
        console.log('✅ Pesapal payment status retrieved successfully');
        return {
          id: response.data.pesapal_transaction_id || orderTrackingId,
          merchantRequestId: orderTrackingId,
          amount: parseFloat(response.data.amount) || 0,
          currency: response.data.currency || 'KES',
          status: this.mapPesapalStatus(response.data.status),
          paymentMethod: response.data.payment_method,
          paymentAccount: response.data.payment_account,
          pesapalReceipt: response.data.pesapal_receipt,
          transactionDate: response.data.created_date,
          createdAt: new Date(),
          completedAt: response.data.status === 'completed' ? new Date() : undefined,
        };
      } else {
        throw new Error('Invalid status response from Pesapal');
      }

    } catch (error) {
      console.error('❌ Failed to check Pesapal payment status:', error);
      throw new Error('Failed to check Pesapal payment status');
    }
  }

  /**
   * Process Pesapal callback
   */
  processCallback(callbackData: any): PesapalTransaction {
    console.log('📡 Processing Pesapal callback:', callbackData);

    try {
      const transaction: PesapalTransaction = {
        id: callbackData.pesapal_transaction_id || callbackData.orderTrackingId,
        merchantRequestId: callbackData.orderTrackingId,
        amount: parseFloat(callbackData.amount) || 0,
        currency: callbackData.currency || 'KES',
        status: this.mapPesapalStatus(callbackData.payment_status),
        paymentMethod: callbackData.payment_method,
        paymentAccount: callbackData.payment_account,
        pesapalReceipt: callbackData.confirmation_code,
        transactionDate: callbackData.created_date,
        createdAt: new Date(),
        completedAt: callbackData.payment_status === 'completed' ? new Date() : undefined,
      };

      console.log('✅ Pesapal callback processed successfully');
      return transaction;

    } catch (error) {
      console.error('❌ Failed to process Pesapal callback:', error);
      throw new Error('Failed to process Pesapal callback');
    }
  }

  /**
   * Map Pesapal status to our internal status
   */
  private mapPesapalStatus(pesapalStatus: string): any {
    const statusMap: Record<string, any> = {
      'completed': 'paid',
      'pending': 'pending',
      'failed': 'failed',
      'cancelled': 'failed',
      'refunded': 'refunded',
    };

    return statusMap[pesapalStatus] || 'pending';
  }

  /**
   * Validate payment data
   */
  validatePaymentData(paymentData: PesapalPaymentRequest): string[] {
    const errors: string[] = [];

    if (!paymentData.id || paymentData.id.trim() === '') {
      errors.push('Order ID is required');
    }

    if (!paymentData.amount || paymentData.amount <= 0) {
      errors.push('Valid amount is required');
    }

    if (!paymentData.currency) {
      errors.push('Currency is required');
    }

    if (!paymentData.description || paymentData.description.trim() === '') {
      errors.push('Description is required');
    }

    if (!paymentData.callback_url) {
      errors.push('Callback URL is required');
    }

    // Validate phone number format for Kenya
    if (paymentData.phone_number) {
      const phoneRegex = /^(\+254|254|0)[7]\d{8}$/;
      if (!phoneRegex.test(paymentData.phone_number)) {
        errors.push('Invalid Kenyan phone number format');
      }
    }

    // Validate email format
    if (paymentData.email_address) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(paymentData.email_address)) {
        errors.push('Invalid email format');
      }
    }

    return errors;
  }

  /**
   * Generate payment request data
   */
  generatePaymentRequest(orderId: string, amount: number, customerInfo: {
    name?: string;
    email?: string;
    phone?: string;
  }, description: string): PesapalPaymentRequest {
    return {
      id: orderId,
      currency: 'KES',
      amount: amount,
      description: description,
      callback_url: process.env.PESAPAL_CALLBACK_URL || 'https://pajoy.onrender.com/api/pesapal/callback',
      redirect_mode: '',
      notification_id: '',
      branch: '',
      email_address: customerInfo.email || '',
      phone_number: customerInfo.phone || '',
      billing_address: '',
      billing_city: '',
      billing_state: '',
      billing_zipcode: '',
      billing_country: 'KE',
    };
  }

  /**
   * Retry failed operations
   */
  async retryOperation<T>(
    operation: () => Promise<T>,
    maxAttempts: number = PESAPAL_CONFIG.RETRY_ATTEMPTS,
    delay: number = PESAPAL_CONFIG.RETRY_DELAY
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        console.log(`🔄 Retry attempt ${attempt}/${maxAttempts} failed:`, error.message);
        
        if (attempt < maxAttempts) {
          await this.delay(delay * Math.pow(2, attempt - 1)); // Exponential backoff
        }
      }
    }

    throw lastError!;
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clear cached token
   */
  clearToken(): void {
    this.accessToken = null;
    this.tokenExpiry = 0;
    console.log('🗑️ Pesapal token cache cleared');
  }

  /**
   * Get token status
   */
  getTokenStatus(): { hasToken: boolean; isExpired: boolean; timeToExpiry: number } {
    const now = Date.now();
    return {
      hasToken: !!this.accessToken,
      isExpired: now >= this.tokenExpiry,
      timeToExpiry: Math.max(0, this.tokenExpiry - now),
    };
  }
}

// Export singleton instance
export const pesapalService = new PesapalService();
