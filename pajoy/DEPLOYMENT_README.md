# PAJOY POS System - Production Deployment Guide

## 🚀 Quick Start for Tomorrow's Installation

### Prerequisites
- Node.js 18+ installed
- Git installed
- Internet connection
- M-Pesa phone number for testing

### Step 1: Get Production Pesapal Credentials
1. Go to https://pesapal.com
2. Sign up/Login to your merchant account
3. Navigate to **API Settings** or **Integration**
4. Copy your **Production Consumer Key** and **Consumer Secret**
5. Ensure your account is **activated for API access** (contact support if needed)

### Step 2: Setup Public Callback URL
Since Pesapal needs to send callbacks to your PC, you need a public URL:

**Option A: Use Ngrok (Recommended for local deployment)**
```bash
# Install ngrok from https://ngrok.com
ngrok http 4000
# Copy the https URL (e.g., https://abc123.ngrok.io)
```

**Option B: Use a domain** (if you have one)
- Point your domain to your PC's public IP
- Ensure port 4000 is forwarded in your router

### Step 3: Configure Environment
1. Open `.env` file in the `pajoy/` folder
2. Replace the placeholder values:
```
PESAPAL_CONSUMER_KEY=your_real_production_key_here
PESAPAL_CONSUMER_SECRET=your_real_production_secret_here
PESAPAL_CALLBACK_URL=https://your-ngrok-url.ngrok.io/api/pesapal/callback
```

### Step 4: Install and Run
```bash
cd pajoy-system/pajoy
npm install
npm start
```

### Step 5: Test Real M-Pesa Payment
1. Open the app
2. Go to POS/Sales section
3. Add items to cart
4. Select M-Pesa payment
5. Enter your phone number
6. Click "Pay Now"
7. **STK Push should arrive on your phone**
8. Complete payment on phone
9. Payment status should update in app

## 🔧 Troubleshooting

### If STK Push doesn't come:
- Check Pesapal credentials are correct
- Verify callback URL is accessible
- Check app logs for errors
- Contact Pesapal support to activate API

### If app won't start:
- Ensure port 4000 is free
- Check Node.js version
- Run `npm install` again

### For production use:
- Set up proper domain instead of ngrok
- Use HTTPS certificates
- Configure firewall properly
- Set up automatic backups

## 📞 Support
- Pesapal: support@pesapal.com
- Technical issues: Check app logs and error messages