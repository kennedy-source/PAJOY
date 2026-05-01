# PAJOY Pesapal Payment Integration Guide

## 🚀 Complete Production-Grade Pesapal Integration

This guide covers the full Pesapal payment gateway integration for PAJOY Uniforms POS system.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Setup](#setup)
4. [Configuration](#configuration)
5. [Payment Flow](#payment-flow)
6. [Security](#security)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

## 🎯 Overview

The PAJOY Pesapal integration provides:
- **Multiple Payment Methods**: M-Pesa, Cards, Bank Transfer, Mobile Wallets
- **Real-time Payment Status**: Live payment tracking and confirmation
- **Auto-recovery Backend**: Automatic backend restart and health monitoring
- **Production Ready**: Full error handling, logging, and security
- **Desktop Application**: Native Windows/macOS/Linux executable

## ✨ Features

### Payment Gateway Features
- ✅ **Pesapal API v3 Integration** - Latest Pesapal API
- ✅ **Multiple Payment Methods** - M-Pesa, Cards, Bank, Wallets
- ✅ **Real-time Status Polling** - Live payment tracking
- ✅ **Payment History** - Complete transaction logs
- ✅ **Refund Support** - Process refunds through Pesapal
- ✅ **Webhook Handling** - Secure payment callbacks

### Application Features
- ✅ **Auto-start Backend** - Backend starts automatically with desktop app
- ✅ **Health Monitoring** - Backend health checks and auto-recovery
- ✅ **Splash Screen** - Beautiful loading screen with status updates
- ✅ **System Tray** - Background operation with tray controls
- ✅ **Production Build** - Windows EXE installer with all dependencies

### Security Features
- ✅ **Signature Validation** - Webhook signature verification
- ✅ **Token Caching** - Secure token management
- ✅ **Error Handling** - Comprehensive error recovery
- ✅ **Audit Logging** - Complete payment audit trail
- ✅ **Data Encryption** - Sensitive data protection

## 🛠️ Setup

### Prerequisites
- Node.js 18+ 
- Git
- Pesapal Developer Account

### 1. Clone and Install
```bash
git clone <repository-url>
cd pajoy-system
npm install
```

### 2. Database Setup
```bash
# Run payment database migration
node scripts/migrate-payments.js
```

### 3. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit configuration
nano .env
```

### 4. Build Application
```bash
# Build for production
node scripts/build-production.js

# Or build for specific platform
npm run dist:win    # Windows
npm run dist:mac    # macOS  
npm run dist:linux  # Linux
```

## ⚙️ Configuration

### Environment Variables (.env)

```env
# Pesapal Payment Gateway
PESAPAL_CONSUMER_KEY=your_pesapal_consumer_key
PESAPAL_CONSUMER_SECRET=your_pesapal_consumer_secret
PESAPAL_BASE_URL=https://pay.pesapal.com/v3
PESAPAL_CALLBACK_URL=http://localhost:4000/api/payments/callback
PESAPAL_WEBHOOK_SECRET=your_webhook_secret

# Server Configuration
NODE_ENV=production
PORT=4000
HOST=localhost

# Database
DB_PATH=./database/pajoy.db

# Application
APP_NAME=PAJOY Uniforms POS
COMPANY_NAME=PAJOY Uniforms
COMPANY_ADDRESS=Nairobi, Kenya
COMPANY_PHONE=+254-XXX-XXX-XXX
COMPANY_EMAIL=info@pajoyuniforms.com
```

### Getting Pesapal Credentials

1. **Register on Pesapal Portal**
   - Visit [Pesapal Developer Portal](https://www.pesapal.com/)
   - Create developer account
   - Register your application

2. **Get API Credentials**
   - Consumer Key: From Pesapal dashboard
   - Consumer Secret: From Pesapal dashboard
   - Set callback URL: `https://yourdomain.com/api/payments/callback`

3. **Configure Webhooks**
   - Add webhook URL in Pesapal dashboard
   - Set webhook secret for security
   - Test webhook endpoints

## 💳 Payment Flow

### 1. Customer Checkout
1. Customer selects items in POS
2. Chooses "Pesapal" as payment method
3. Enters phone/email/customer details
4. Clicks "Pay with Pesapal"

### 2. Payment Initiation
1. Frontend calls `/api/payments/pesapal/initiate`
2. Backend generates unique order ID
3. Backend calls Pesapal API with payment details
4. Pesapal returns payment URL and tracking ID
5. Backend stores transaction in database

### 3. Payment Processing
1. Modal opens with Pesapal payment iframe
2. Customer completes payment on Pesapal
3. Pesapal sends callback to webhook endpoint
4. Backend updates transaction status
5. Frontend shows payment success

### 4. Order Completion
1. Backend marks sale as paid
2. Receipt is automatically printed
3. Transaction is logged in audit trail
4. Customer receives confirmation

## 🔒 Security

### Webhook Security
```javascript
// Signature validation
const signature = req.headers['x-pesapal-signature'];
const isValid = pesapalService.verifyWebhookSignature(payload, signature);
```

### Token Security
- Automatic token caching with expiry
- Secure token storage
- Token refresh on expiry

### Data Protection
- Sensitive data encryption
- Audit logging for all transactions
- PCI DSS compliance considerations

## 🧪 Testing

### 1. Development Testing
```bash
# Start development server
npm run dev

# Test payment flow
# 1. Add items to cart
# 2. Select Pesapal payment
# 3. Use test credentials
```

### 2. Production Testing
```bash
# Build production version
npm run dist:win

# Install and test
# 1. Run installer
# 2. Configure .env file
# 3. Test with real Pesapal credentials
```

### 3. Test Scenarios
- ✅ Successful payment flow
- ✅ Failed payment handling
- ✅ Network interruption recovery
- ✅ Backend crash recovery
- ✅ Webhook callback processing
- ✅ Payment status polling
- ✅ Mixed payment scenarios

## 🔧 Troubleshooting

### Common Issues

#### 1. Backend Not Starting
```bash
# Check logs
# Look for database connection errors
# Verify .env configuration
```

#### 2. Pesapal API Errors
```bash
# Verify credentials
# Check network connectivity
# Validate callback URL
# Review Pesapal dashboard settings
```

#### 3. Payment Status Not Updating
```bash
# Check webhook configuration
# Verify webhook URL accessibility
# Review payment logs in database
# Test webhook endpoint manually
```

#### 4. Build Errors
```bash
# Clear node_modules
rm -rf node_modules package-lock.json
npm install

# Check for missing dependencies
npm ls

# Rebuild
npm run dist:win
```

### Debug Mode
```bash
# Enable debug logging
DEBUG=pajoy:* npm start

# Check health endpoint
curl http://localhost:4000/api/health

# View payment history
curl http://localhost:4000/api/payments/history
```

### Log Files
- **Backend Logs**: Console output and database logs
- **Payment Logs**: `payment_logs` table in database
- **Error Logs**: Application error tracking
- **Audit Trail**: Complete transaction history

## 📱 API Endpoints

### Payment Endpoints
```
POST /api/payments/pesapal/initiate    # Initiate payment
GET  /api/payments/pesapal/status/:id   # Check payment status
GET  /api/payments/callback             # Payment callback
POST /api/payments/webhook              # Webhook handler
GET  /api/payments/history              # Payment history
GET  /api/payments/:id                  # Payment details
```

### Health Endpoints
```
GET  /api/health                         # Basic health check
GET  /api/health/detailed               # Detailed health info
GET  /api/health/ready                   # Readiness probe
GET  /api/health/alive                   # Liveness probe
```

## 🚀 Deployment

### Windows Deployment
1. Build Windows executable: `npm run dist:win`
2. Distribute `PAJOY-Uniforms-POS-Setup.exe`
3. Users run installer
4. Application auto-starts with backend

### Configuration for Production
- Set `NODE_ENV=production`
- Use real Pesapal credentials
- Configure proper callback URLs
- Set up SSL certificates (if needed)

## 📞 Support

### Pesapal Support
- **Documentation**: [Pesapal API Docs](https://developer.pesapal.com/)
- **Support**: support@pesapal.com
- **Dashboard**: [Pesapal Portal](https://www.pesapal.com/)

### PAJOY Support
- **Issues**: Create GitHub issue
- **Documentation**: This guide and code comments
- **Community**: GitHub discussions

## 📄 License

This integration follows the same license as PAJOY System.

---

**🎉 Congratulations!** Your PAJOY system now has full Pesapal payment integration with auto-starting backend and production-ready desktop application.
