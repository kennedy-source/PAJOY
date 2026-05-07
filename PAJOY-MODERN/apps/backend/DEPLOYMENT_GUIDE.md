# PAJOY Backend Deployment Guide

## 🚀 Deployment Options

### Option 1: Railway (Recommended)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link project
railway link

# Deploy
railway up
```

### Option 2: Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Option 3: DigitalOcean App Platform
```bash
# Install doctl
curl -sSL https://github.com/digitalocean/doctl/releases/latest/download/doctl-Windows-amd64.zip -o doctl.zip
unzip doctl.zip
./doctl auth init

# Deploy
doctl apps create --spec .do/app.yaml
```

### Option 4: Docker Deployment
```bash
# Build Docker image
docker build -t pajoy-backend .

# Run container
docker run -p 5179:5179 --env-file .env pajoy-backend
```

### Option 5: Manual Server Deployment
```bash
# Build application
npm run build

# Install PM2
npm install -g pm2

# Start with PM2
pm2 start dist/index.js --name pajoy-backend
```

## 📋 Environment Variables Required

Create `.env` file with:
```bash
NODE_ENV=production
PORT=5179
HOST=0.0.0.0

# Database (choose one)
DATABASE_URL=postgresql://username:password@host:port/database
# OR
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pajoy_production
DB_USER=your_username
DB_PASSWORD=your_password
DB_SSL=true

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Pesapal (optional)
PESAPAL_CONSUMER_KEY=your_consumer_key
PESAPAL_CONSUMER_SECRET=your_consumer_secret
PESAPAL_CALLBACK_URL=https://your-domain.com/api/pesapal/callback

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# CORS
CORS_ORIGIN=https://your-domain.com
```

## 🔧 Health Check

The backend includes a health check endpoint:
```
GET /health
```

Returns:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "database": "connected",
  "memory": {
    "used": "50MB",
    "total": "512MB"
  }
}
```

## 📚 API Documentation

Swagger documentation available at:
```
GET /api-docs
```

## 🚦 Production Checklist

- [ ] Environment variables configured
- [ ] Database connected and migrated
- [ ] SSL certificates installed
- [ ] Domain pointed to deployment
- [ ] Health checks passing
- [ ] API documentation accessible
- [ ] Error logging configured
- [ ] Rate limiting configured
- [ ] CORS settings configured
- [ ] File upload permissions set

## 🔄 CI/CD Pipeline

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy PAJOY Backend

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: railway-app/railway-action@v1
        with:
          api-token: ${{ secrets.RAILWAY_TOKEN }}
```

## 🐛 Troubleshooting

### Common Issues:
1. **Database Connection**: Check DATABASE_URL format
2. **JWT Secret**: Ensure JWT_SECRET is set
3. **Port Conflicts**: Use PORT environment variable
4. **File Permissions**: Ensure upload directory exists
5. **CORS Issues**: Configure CORS_ORIGIN

### Debug Mode:
```bash
NODE_ENV=development npm run dev
```

## 📞 Support

For deployment issues:
- Check logs: `pm2 logs pajoy-backend`
- Health check: `curl http://localhost:5179/health`
- API docs: `http://localhost:5179/api-docs`
