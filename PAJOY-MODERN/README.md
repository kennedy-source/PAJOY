# PAJOY SYSTEM v2.0.0

🎓 **Production-Grade Hybrid Business Platform for Kenyan School Uniforms Retail**

---

## 📋 Overview

PAJOY SYSTEM is a comprehensive business management platform designed specifically for Kenyan retail businesses selling school uniforms, embroidery services, and printing solutions. The system features offline-first desktop POS functionality with cloud synchronization for multi-device operations.

---

## 🏗️ Architecture

### **Monorepo Structure**
```
PAJOY-MODERN/
├── apps/
│   ├── desktop/        # Electron + React Desktop POS
│   ├── backend/        # Node.js Express API (Railway)
│   └── web-admin/      # React Admin Dashboard
├── packages/
│   ├── shared/         # Shared Components & Services
│   ├── types/          # TypeScript Types
│   ├── utils/          # Utility Functions
│   └── constants/      # Business Constants
├── databases/
│   ├── local-sqlite/   # Desktop Database
│   └── cloud-postgres/ # Cloud Database
└── docs/              # Documentation
```

### **Key Features**
- ✅ **Offline-First Desktop App** - Complete POS functionality without internet
- ✅ **Cloud Backend** - Railway-deployed with PostgreSQL
- ✅ **Real-time Sync** - Bidirectional SQLite ↔ PostgreSQL synchronization
- ✅ **Pesapal Integration** - Complete payment gateway with fallback
- ✅ **Modern UI** - Tailwind CSS + React components
- ✅ **Multi-Device Support** - Work across multiple computers
- ✅ **Admin Dashboard** - Web-based analytics and management
- ✅ **TypeScript** - Full type safety across all packages

---

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+ 
- npm 9+
- Git

### **Installation**
```bash
# Clone the repository
git clone <repository-url>
cd PAJOY-MODERN

# Install dependencies
npm install

# Build all packages
npm run build
```

### **Development**
```bash
# Start all services
npm run dev

# Individual services
npm run dev:backend     # Backend API (port 5179)
npm run dev:desktop     # Desktop App (port 5174)
npm run dev:web-admin   # Admin Dashboard (port 5175)
```

---

## 📱 Desktop Application

### **Features**
- **POS System** - Barcode scanning, cart management, receipt printing
- **Inventory Management** - Stock tracking, low stock alerts, purchase orders
- **Customer Management** - School clients, credit accounts, loyalty tracking
- **Embroidery Jobs** - Design upload, job queue, status tracking
- **Printing Jobs** - T-shirt printing, queue management
- **Reports** - Daily sales, inventory analytics, profit reports
- **Offline Mode** - Complete functionality without internet

### **Building Desktop App**
```bash
cd apps/desktop
npm run build
npm run dist          # Build distributables
```

---

## 🌐 Backend API

### **Features**
- **RESTful API** - Express.js with TypeScript
- **Database** - PostgreSQL with SQLite fallback
- **Authentication** - JWT with role-based permissions
- **Pesapal Integration** - Complete payment gateway
- **Sync Engine** - Multi-device synchronization
- **File Uploads** - Design files, images
- **Rate Limiting** - API protection
- **Logging** - Winston with structured logs

### **API Endpoints**
```
/api/v1/auth          # Authentication
/api/v1/products      # Product management
/api/v1/customers     # Customer management
/api/v1/sales         # Sales transactions
/api/v1/embroidery    # Embroidery jobs
/api/v1/printing      # Printing jobs
/api/v1/inventory     # Stock management
/api/v1/reports       # Analytics
/api/v1/pesapal       # Payment gateway
/api/v1/sync          # Data synchronization
```

### **Environment Variables**
```bash
# Backend
NODE_ENV=production
PORT=5179
DATABASE_URL=postgresql://...
JWT_SECRET=your-super-secret-jwt-key
PESAPAL_CONSUMER_KEY=your-pesapal-key
PESAPAL_CONSUMER_SECRET=your-pesapal-secret
PESAPAL_CALLBACK_URL=https://your-app.railway.app/api/pesapal/callback
```

---

## 🖥️ Web Admin Dashboard

### **Features**
- **Analytics Dashboard** - Revenue charts, sales trends, KPIs
- **Customer Analytics** - Purchase history, segmentation, loyalty
- **Inventory Reports** - Stock levels, movements, valuations
- **Sales Reports** - Daily/weekly/monthly summaries
- **User Management** - Role-based access control
- **Settings** - Business configuration, system preferences

### **Access**
- URL: `http://localhost:5175` (development)
- Default credentials: `admin@pajoy.co.ke` / `admin123`

---

## 💳 Pesapal Payment Integration

### **Features**
- **Token Management** - Automatic token refresh with fallback
- **Payment Initiation** - Create orders with validation
- **Status Checking** - Real-time payment verification
- **Callback Handling** - Secure payment confirmations
- **Error Handling** - Comprehensive error recovery
- **Mock Mode** - Development testing without real payments

### **Configuration**
```bash
# Pesapal Settings
PESAPAL_CONSUMER_KEY=your_consumer_key
PESAPAL_CONSUMER_SECRET=your_consumer_secret
PESAPAL_BASE_URL=https://pay.pesapal.com/v3
PESAPAL_CALLBACK_URL=https://your-domain.com/api/pesapal/callback
```

---

## 🔄 Sync Engine

### **Features**
- **Bidirectional Sync** - Desktop ↔ Cloud synchronization
- **Conflict Resolution** - Last-write-wins strategy
- **Offline Support** - Queue operations when offline
- **Batch Processing** - Efficient bulk operations
- **Retry Logic** - Automatic retry with exponential backoff
- **Device Management** - Multi-device support

### **Sync Process**
1. **Local Operations** - Changes saved to local SQLite
2. **Queue Management** - Operations queued for sync
3. **Batch Upload** - Operations sent to cloud in batches
4. **Remote Download** - Changes from other devices downloaded
5. **Conflict Resolution** - Applied with conflict handling
6. **Status Updates** - Real-time sync status

---

## 🗄️ Database Schemas

### **PostgreSQL (Cloud)**
- **Production-ready** with proper indexing
- **UUID Primary Keys** for distributed systems
- **JSONB Fields** for flexible data storage
- **Triggers** for automated timestamp updates
- **Views** for reporting and analytics
- **Audit Logs** for compliance

### **SQLite (Local)**
- **Offline-first** with full functionality
- **Foreign Key Constraints** for data integrity
- **Indexes** for performance
- **Triggers** for automated updates
- **Views** for local reporting

---

## 🚀 Deployment

### **Railway (Backend)**
```bash
# Deploy to Railway
cd apps/backend
npm run build
railway login
railway deploy

# Environment Variables (Railway Dashboard)
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
PESAPAL_CONSUMER_KEY=your-key
PESAPAL_CONSUMER_SECRET=your-secret
```

### **Desktop App Distribution**
```bash
# Build distributables
cd apps/desktop
npm run build
npm run dist:win      # Windows
npm run dist:mac      # macOS
npm run dist:linux    # Linux
```

### **Web Admin (Vercel/Netlify)**
```bash
# Build and deploy
cd apps/web-admin
npm run build
# Deploy dist/ folder to your hosting provider
```

---

## 🧪 Testing

### **Unit Tests**
```bash
# Run all tests
npm test

# Test specific package
npm run test --workspace=@pajoy/backend
npm run test --workspace=@pajoy/desktop
```

### **Integration Tests**
```bash
# Test Pesapal integration
cd apps/backend
npm run test:pesapal

# Test sync engine
npm run test:sync
```

---

## 📊 Business Modules

### **POS System**
- Barcode scanning
- Cart management
- Multiple payment methods
- Receipt printing
- Discount support
- Split payments

### **Inventory Management**
- Product catalog
- Stock tracking
- Low stock alerts
- Purchase orders
- Supplier management
- Stock movements

### **Customer Management**
- Individual customers
- School accounts
- Credit management
- Purchase history
- Loyalty tracking
- Contact management

### **Embroidery Services**
- Design upload
- Job queue
- Status tracking
- Pricing calculator
- Completion tracking
- Quality control

### **Printing Services**
- T-shirt printing
- Design management
- Job tracking
- Color separation
- Pricing calculator
- Production workflow

---

## 🔧 Configuration

### **Business Settings**
```json
{
  "businessName": "PAJOY Uniforms",
  "businessAddress": "Nairobi, Kenya",
  "businessPhone": "+254700000000",
  "currency": "KES",
  "taxRate": 0.16,
  "receiptHeader": "PAJOY Uniforms",
  "receiptFooter": "Thank you for your business!"
}
```

### **Printer Settings**
```json
{
  "receiptPrinter": "thermal_printer",
  "receiptWidth": 80,
  "autoPrintReceipt": true,
  "printCopies": 1
}
```

---

## 🔒 Security

### **Authentication**
- JWT tokens with expiration
- Role-based permissions
- Password hashing with bcrypt
- Session management
- Rate limiting

### **Data Protection**
- SQL injection prevention
- Input validation
- XSS protection
- CSRF protection
- Secure headers (Helmet)

### **API Security**
- Rate limiting (100 requests/15min)
- Request size limits
- IP blocking
- Audit logging

---

## 📈 Monitoring & Logging

### **Application Logs**
- Structured logging with Winston
- Error tracking
- Performance metrics
- User activity logs
- Sync operation logs

### **Health Checks**
- `/health` endpoint
- Database connectivity
- External service status
- Sync status
- System metrics

---

## 🤝 Contributing

### **Development Workflow**
1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request
5. Code review and merge

### **Code Standards**
- TypeScript with strict mode
- ESLint + Prettier
- Conventional commits
- Test coverage > 80%
- Documentation required

---

## 📞 Support

### **Contact**
- **Email**: info@pajoyuniforms.co.ke
- **Phone**: +254 700 000 000
- **Website**: https://pajoyuniforms.co.ke

### **Documentation**
- [API Documentation](./docs/api.md)
- [User Manual](./docs/user-manual.md)
- [Deployment Guide](./docs/deployment.md)
- [Troubleshooting](./docs/troubleshooting.md)

---

## 📄 License

This software is proprietary and licensed to PAJOY Uniforms. All rights reserved.

---

## 🎯 Version History

### **v2.0.0** (Current)
- ✅ Complete monorepo refactor
- ✅ Modern TypeScript architecture
- ✅ Offline-first desktop app
- ✅ Cloud backend with Railway deployment
- ✅ Pesapal payment integration
- ✅ Real-time sync engine
- ✅ Web admin dashboard
- ✅ Enhanced security features

### **v1.0.0** (Legacy)
- Basic POS functionality
- Simple inventory management
- Local SQLite database
- Limited payment options

---

**🎓 PAJOY SYSTEM - Empowering Kenyan Education Through Technology**
