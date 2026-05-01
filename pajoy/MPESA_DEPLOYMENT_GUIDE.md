# 🚀 PESAPAL PRODUCTION DEPLOYMENT GUIDE

## 📋 OVERVIEW
Your PAJOY System M-Pesa integration is now **production-ready** with proper validation and error handling.

## 🔧 PRODUCTION SETUP

### **Step 1: Get Live Credentials**
1. Go to [Safaricom Daraja Portal](https://developer.safaricom.co.ke/)
2. Select your app
3. Get **LIVE** credentials:
   - Consumer Key
   - Consumer Secret
   - Short Code (your business number)
   - Passkey
4. **Important**: Use LIVE credentials, NOT sandbox

### **Step 2: Set Environment Variables**
In your deployment platform (Render.com, Vercel, etc.):

```bash
# Required
MPESA_CONSUMER_KEY=your_live_consumer_key
MPESA_CONSUMER_SECRET=your_live_consumer_secret
MPESA_SHORTCODE=your_business_number
MPESA_PASSKEY=your_live_passkey

# Optional (for callbacks)
MPESA_CALLBACK_URL=https://pajoy.onrender.com/api/mpesa/callback
```

### **Step 3: Update API Endpoints**
The system now automatically detects production vs sandbox:

- **Production**: Uses live credentials → `https://api.safaricom.co.ke`
- **Sandbox**: Uses test credentials → `https://sandbox.safaricom.co.ke`

## 🧪 TESTING INSTRUCTIONS

### **Before Going Live:**
1. **Test with small amounts**: KES 10, 50, 100
2. **Use your real M-Pesa number**: Not test numbers
3. **Check logs**: All transactions are logged
4. **Verify callbacks**: Ensure callback URL is accessible

### **Test Transaction:**
```javascript
// Example test payload
{
  "phone": "254712345678",
  "amount": 10,
  "order_id": 123,
  "customer_name": "John Doe"
}
```

## 📱 PRODUCTION FEATURES

### **✅ What Works:**
- **STK Push**: Real M-Pesa prompts
- **Payment Processing**: Automatic order updates
- **Transaction Tracking**: Complete payment history
- **Error Handling**: Comprehensive error management
- **Database Integration**: Automatic status updates
- **Callback Processing**: Real-time payment confirmation

### **🔒 Security Features:**
- **Environment Variable Validation**: Prevents deployment with missing credentials
- **Error Logging**: Clear error messages for debugging
- **Credential Protection**: No hardcoded secrets in code

## 🚨 TROUBLESHOOTING

### **Common Issues & Solutions:**

#### **1. "Payment not reaching phone"**
- **Cause**: Wrong credentials or sandbox vs live mismatch
- **Solution**: Use correct live credentials

#### **2. "Callback not working"**
- **Cause**: Callback URL not accessible
- **Solution**: 
  - Ensure HTTPS callback URL
  - Check firewall settings
  - Use ngrok for local testing

#### **3. "500 Internal Server Error"**
- **Cause**: Missing environment variables
- **Solution**: Set all required MPESA_* variables

## 📊 MONITORING

### **Check These Logs:**
```bash
# Production logs
tail -f /var/log/pajoy/app.log | grep "M-Pesa"

# Transaction status
curl https://pajoy.onrender.com/api/pesapal/status/{merchant_request_id}
```

### **Database Queries:**
```sql
-- Check pending transactions
SELECT * FROM pesapal_transactions WHERE status = 'PENDING';

-- Check completed transactions
SELECT * FROM pesapal_transactions WHERE status = 'COMPLETED' ORDER BY completed_at DESC LIMIT 10;

-- Check failed transactions
SELECT * FROM pesapal_transactions WHERE status = 'FAILED' ORDER BY created_at DESC LIMIT 10;
```

## 🔄 LIVE DEPLOYMENT CHECKLIST

- [ ] **Live credentials obtained from Safaricom**
- [ ] **Environment variables set in deployment**
- [ ] **HTTPS callback URL configured**
- [ ] **Database tables created**
- [ ] **Test transaction with small amount**
- [ ] **Verify payment confirmation works**
- [ ] **Check order status updates**
- [ ] **Monitor error logs**
- [ ] **Set up monitoring alerts**

## 📞 SUPPORT

### **If Issues Occur:**
1. **Check application logs** for detailed error messages
2. **Verify credentials** are correct and not expired
3. **Test callback URL** accessibility
4. **Check database** connection and permissions
5. **Monitor Safaricom API status** at [developer.safaricom.co.ke](https://developer.safaricom.co.ke/)

## 🎯 NEXT STEPS

### **After Production Deployment:**
1. **Set up monitoring** for failed transactions
2. **Implement retry logic** for failed payments
3. **Add email notifications** for payment confirmations
4. **Set up analytics** for payment tracking
5. **Consider webhook reliability** improvements

---

## 📞 EMERGENCY CONTACT

If Pesapal integration fails in production:
1. **Check credentials immediately**
2. **Verify callback URL is accessible**
3. **Monitor transaction status**
4. **Have backup payment method ready**
5. **Check Safaricom API status** at [developer.safaricom.co.ke](https://developer.safaricom.co.ke/)

---

**🚀 Your PAJOY System is now production-ready for Pesapal payments!**
