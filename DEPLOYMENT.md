# Azure Deployment Guide - Dash Dashboard

## Overview

Deploy your Dash dashboard to Azure using **Azure App Service** or **Container Instances**.

## Option 1: Azure App Service (Recommended for Beginners)

### Prerequisites

- Azure account with "dev-technicalcloud" resource group
- Azure CLI installed (or use Azure Portal)
- GitHub repository (optional, for CI/CD)

### Step 1: Create App Service Plan

**Using Azure Portal:**

1. Go to Azure Portal → dev-technicalcloud resource group
2. Click "+ Create" → Search "App Service"
3. Click "Create"
4. **Basics tab:**
   - **Subscription**: Your subscription
   - **Resource Group**: dev-technicalcloud
   - **Name**: tcld-cbsemp-dash
   - **Runtime stack**: Python 3.11
   - **Operating System**: Linux
   - **Region**: East US (or your region)
5. **App Service Plan:**
   - **Pricing tier**: B1 (recommended for testing)
6. Click "Review + Create" → "Create"

### Step 2: Configure Application Settings

1. Go to created App Service
2. Settings → Configuration
3. Add these **Connection strings**:
   ```
   Name: SQLSERVER_CONNECTION
   Value: Driver={ODBC Driver 17 for SQL Server};Server=dev-saw-tcld-01.database.windows.net;Database=your_db;UID=your_user;PWD=your_password;
   Type: SQLServer
   ```

4. Add **Application settings**:
   ```
   DB_SERVER=dev-saw-tcld-01.database.windows.net
   DB_NAME=your_database_name
   DB_USER=your_username
   DB_PASSWORD=your_password (use Key Vault reference)
   DASH_PORT=8000
   DEBUG=False
   ```

### Step 3: Deploy Code

#### Option A: Using Git/GitHub Actions

```bash
# Initialize git
git init
git remote add azure <deployment-url>

# Push to Azure
git push azure main
```

#### Option B: Using ZIP Deploy

```powershell
# Create deployment package
cd c:\Users\leolkli\DataWrang\TCLD-CBSEMP-Dash
Compress-Archive -Path . -DestinationPath deploy.zip

# Deploy using Azure CLI
az webapp deployment source config-zip `
  --resource-group dev-technicalcloud `
  --name tcld-cbsemp-dash `
  --src-path deploy.zip
```

### Step 4: Configure Startup Script

1. In App Service → Configuration → General settings
2. **Startup command**:
   ```
   gunicorn --workers 1 --worker-class sync --timeout 600 --access-logfile - --error-logfile - app:server
   ```

### Step 5: Test Deployment

Access: `https://tcld-cbsemp-dash.azurewebsites.net`

## Option 2: Docker Container

### Create Dockerfile

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install ODBC Driver
RUN apt-get update && apt-get install -y \
    unixodbc-dev \
    odbcinst \
    && rm -rf /var/lib/apt/lists/*

# Copy files
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Expose port
EXPOSE 8050

# Run app
CMD ["gunicorn", "--bind", "0.0.0.0:8050", "--workers", "1", "app:server"]
```

### Build and Push to Azure Container Registry

```bash
# Build image
docker build -t tcld-cbsemp-dash:latest .

# Tag for registry
docker tag tcld-cbsemp-dash:latest <your-registry>.azurecr.io/tcld-cbsemp-dash:latest

# Push to registry
docker push <your-registry>.azurecr.io/tcld-cbsemp-dash:latest

# Deploy to Container Instances
az container create \
  --resource-group dev-technicalcloud \
  --name tcld-cbsemp-dash \
  --image <your-registry>.azurecr.io/tcld-cbsemp-dash:latest \
  --cpu 1 \
  --memory 1 \
  --environment-variables \
    DB_SERVER=dev-saw-tcld-01.database.windows.net \
    DB_NAME=your_db \
    DB_USER=your_user
```

## Security Configuration

### Use Azure Key Vault

1. Create Key Vault in resource group
2. Store database password as secret
3. Grant App Service access:
   ```
   az keyvault set-policy \
     --name your-keyvault \
     --object-id <app-service-identity> \
     --secret-permissions get
   ```

4. Reference in App Service settings:
   ```
   @Microsoft.KeyVault(SecretUri=https://your-keyvault.vault.azure.net/secrets/db-password/)
   ```

### SQL Firewall Rules

1. Go to Azure SQL Server → Firewalls and virtual networks
2. Enable "Allow Azure services and resources to access this server"
3. Or add specific App Service IP (if available)

## Monitoring and Logging

### Enable Application Insights

1. App Service → Settings → Application Insights
2. Click "Enable Application Insights"
3. Select or create new insight

### View Logs

```bash
# Stream logs in real-time
az webapp log tail --resource-group dev-technicalcloud --name tcld-cbsemp-dash

# Download logs
az webapp log download \
  --resource-group dev-technicalcloud \
  --name tcld-cbsemp-dash \
  --log-file logs.zip
```

## Scaling Configuration

### Vertical Scaling (More powerful VM)
- App Service Plan → Scale up
- Choose larger tier (B2, B3, S1, etc.)

### Horizontal Scaling (More instances)
- App Service Plan → Scale out
- Set minimum/maximum instances
- Set auto-scale rules based on CPU/Memory

## Cost Estimation

| Resource | Cost (USD/month) |
|----------|-----------------|
| App Service B1 | ~$10 |
| SQL Database (S0) | ~$15 |
| **Total** | **~$25** |

## Troubleshooting

### App Service shows "502 Bad Gateway"

```bash
# Check logs
az webapp log tail --resource-group dev-technicalcloud --name tcld-cbsemp-dash

# Common causes:
# 1. Database connection failed
# 2. Missing ODBC driver
# 3. Timeout too short
# 4. Out of memory
```

### Database Connection Timeout

1. Check firewall rules
2. Verify credentials in settings
3. Increase timeout in gunicorn command
4. Check SQL Server status

### Application Insights Shows Errors

1. Check error details in Portal
2. Review application logs
3. Verify all dependencies installed
4. Check environment variables

## Continuous Deployment

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Azure

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Azure Login
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}
      
      - name: Deploy to App Service
        uses: azure/webapps-deploy@v2
        with:
          app-name: tcld-cbsemp-dash
          package: .
```

## Cleanup

### Delete Resources (to save costs)

```bash
# Delete App Service
az appservice plan delete --name tcld-cbsemp-dash-plan --resource-group dev-technicalcloud

# Delete Container (if using)
az container delete --name tcld-cbsemp-dash --resource-group dev-technicalcloud
```

## Summary

**Local Testing** → **Azure App Service** → **Production**

1. Test locally: `python app.py`
2. Deploy to App Service
3. Monitor performance
4. Scale as needed
5. Enable CI/CD for automation

## Next Steps

1. Create Azure App Service
2. Configure application settings
3. Deploy using your preferred method
4. Test at https://your-app-name.azurewebsites.net
5. Monitor logs and performance

## Support

- **Azure Docs**: https://docs.microsoft.com/azure/
- **App Service**: https://learn.microsoft.com/azure/app-service/
- **Dash Deployment**: https://dash.plotly.com/deployment

---

For questions, refer to README.md or LOCAL-SETUP.md
