# Azure Deployment Guide — TCLD Energy Management Platform

This guide walks you through deploying the TCLD Energy Management Platform to **Azure App Service** with an **Azure Synapse Analytics** backend and **Microsoft Entra ID** (Azure AD) authentication.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Prerequisites](#2-prerequisites)
3. [Step 1 — Provision Azure Resources](#step-1--provision-azure-resources)
4. [Step 2 — Create Database Tables](#step-2--create-database-tables)
5. [Step 3 — Register the App in Microsoft Entra ID](#step-3--register-the-app-in-microsoft-entra-id)
6. [Step 4 — Build the Application](#step-4--build-the-application)
7. [Step 5 — Deploy to Azure App Service](#step-5--deploy-to-azure-app-service)
8. [Step 6 — Configure App Service Settings](#step-6--configure-app-service-settings)
9. [Step 7 — Verify the Deployment](#step-7--verify-the-deployment)
10. [CI/CD with GitHub Actions](#cicd-with-github-actions)
11. [Troubleshooting](#troubleshooting)

---

## 1. Architecture Overview

```
┌─────────────────────────┐
│   Browser (React SPA)   │
│   Vite build → /dist    │
└──────────┬──────────────┘
           │  HTTPS
           ▼
┌─────────────────────────┐
│   Azure App Service     │
│   Node.js 20 LTS        │
│   Express server        │
│   - Serves /dist (SPA)  │
│   - /api/* routes        │
└──────────┬──────────────┘
           │  TDS (port 1433)
           ▼
┌─────────────────────────┐
│  Azure Synapse Analytics │
│  Dedicated SQL Pool      │
│  - DW_D_* (existing)    │
│  - App_Widgets           │
│  - App_Dashboards        │
└─────────────────────────┘
```

| Component | Azure Service | SKU Recommendation |
|---|---|---|
| Frontend + API | Azure App Service | B1 (Basic) or P1v3 (Production) |
| Database | Azure Synapse Dedicated SQL Pool | DW100c (dev) / DW200c+ (prod) |
| Auth | Microsoft Entra ID | Free tier included |
| Secrets | Azure Key Vault (optional) | Standard |

---

## 2. Prerequisites

- **Azure CLI** installed and logged in (`az login`)
- **Node.js 20 LTS** installed locally
- **Azure subscription** with permissions to create App Service, and access to the existing Synapse workspace
- Your Synapse SQL endpoint, database name, and credentials
- Git repository with the project code

```bash
# Verify Azure CLI
az version
az account show
```

---

## Step 1 — Provision Azure Resources

### 1a. Create a Resource Group (if needed)

```bash
az group create \
  --name rg-tcld-energy \
  --location australiaeast
```

### 1b. Create an App Service Plan

```bash
az appservice plan create \
  --name plan-tcld-energy \
  --resource-group rg-tcld-energy \
  --sku B1 \
  --is-linux
```

### 1c. Create a Web App

```bash
az webapp create \
  --name tcld-energy-dashboard \
  --resource-group rg-tcld-energy \
  --plan plan-tcld-energy \
  --runtime "NODE:20-lts"
```

> **Note:** Replace `tcld-energy-dashboard` with your preferred globally unique app name.

### 1d. (Optional) Create Azure Key Vault

```bash
az keyvault create \
  --name kv-tcld-energy \
  --resource-group rg-tcld-energy \
  --location australiaeast
```

---

## Step 2 — Create Database Tables

Connect to your Azure Synapse Dedicated SQL Pool and run the SQL scripts from [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md):

1. **App_Widgets** — stores saved widget configurations
2. **App_Dashboards** — stores dashboard definitions with scope

Use Azure Data Studio, SSMS, or Synapse Studio to execute:

```sql
-- Run both CREATE TABLE scripts from DATABASE_SCHEMA.md
-- See: docs/DATABASE_SCHEMA.md → "Required Tables"
```

### Validate tables exist

```sql
SELECT name FROM sys.tables WHERE name LIKE 'App_%' ORDER BY name;
-- Expected: App_Dashboards, App_Widgets
```

---

## Step 3 — Register the App in Microsoft Entra ID

### 3a. Create App Registration

1. Go to **Azure Portal → Microsoft Entra ID → App registrations → New registration**
2. Name: `TCLD Energy Dashboard`
3. Supported account types: **Single tenant** (your org only)
4. Redirect URI:
   - Type: **Single-page application (SPA)**
   - URI: `https://tcld-energy-dashboard.azurewebsites.net` (your App Service URL)
   - Also add `http://localhost:3000` for local development

### 3b. Note the IDs

After creation, copy:
- **Application (client) ID** → used as `VITE_AZURE_CLIENT_ID`
- **Directory (tenant) ID** → used as `VITE_AZURE_TENANT_ID`

### 3c. Configure Authentication

1. Go to **Authentication** blade
2. Under **Implicit grant and hybrid flows**, check:
   - ✅ Access tokens
   - ✅ ID tokens
3. Set **Supported account types** to match your org needs

### 3d. API Permissions (Optional)

If you need Microsoft Graph access:
1. Go to **API permissions → Add a permission → Microsoft Graph**
2. Add: `User.Read` (delegated)
3. Click **Grant admin consent**

---

## Step 4 — Build the Application

### 4a. Install Dependencies

```bash
npm install
```

### 4b. Create Production Environment File

Create `.env.production` in the project root:

```dotenv
# Microsoft Entra ID
VITE_AZURE_CLIENT_ID=<your-client-id-from-step-3b>
VITE_AZURE_TENANT_ID=<your-tenant-id-from-step-3b>
VITE_REDIRECT_URI=https://tcld-energy-dashboard.azurewebsites.net

# API (relative path — same origin in production)
VITE_API_BASE_URL=/api
```

> `VITE_` prefixed vars are embedded at build time by Vite. Server-side vars (`AZURE_SYNAPSE_*`) are set as App Service Application Settings (Step 6).

### 4c. Build

```bash
npm run build
```

This runs `tsc && vite build` producing the `dist/` folder.

### 4d. Verify Build Locally

```bash
# Set server env vars
export NODE_ENV=production
export AZURE_SYNAPSE_SQL_ENDPOINT=<your-endpoint>
export AZURE_SYNAPSE_DATABASE=<your-db>
export AZURE_SYNAPSE_USERNAME=<your-user>
export AZURE_SYNAPSE_PASSWORD=<your-password>

npm start
# → http://localhost:5000
```

---

## Step 5 — Deploy to Azure App Service

### Option A: ZIP Deploy (Simplest)

```bash
# From the project root
# Create a deployment zip (include dist/, server/, package.json, package-lock.json)
# Exclude: node_modules, src, .env.local, .env

# PowerShell
Compress-Archive -Path dist, server, package.json, package-lock.json -DestinationPath deploy.zip -Force

# Deploy
az webapp deploy \
  --resource-group rg-tcld-energy \
  --name tcld-energy-dashboard \
  --src-path deploy.zip \
  --type zip
```

### Option B: GitHub Actions (Recommended for CI/CD)

See [CI/CD with GitHub Actions](#cicd-with-github-actions) below.

### Option C: VS Code Azure Extension

1. Install the **Azure App Service** VS Code extension
2. Right-click the App Service → **Deploy to Web App**
3. Select the project folder

---

## Step 6 — Configure App Service Settings

### 6a. Application Settings (Environment Variables)

These are the **server-side** environment variables the Express backend needs:

```bash
az webapp config appsettings set \
  --resource-group rg-tcld-energy \
  --name tcld-energy-dashboard \
  --settings \
    NODE_ENV=production \
    AZURE_SYNAPSE_SQL_ENDPOINT="<your-synapse-workspace>.sql.azuresynapse.net" \
    AZURE_SYNAPSE_DATABASE="<your-database-name>" \
    AZURE_SYNAPSE_USERNAME="<your-sql-username>" \
    AZURE_SYNAPSE_PASSWORD="<your-sql-password>" \
    PORT=8080
```

> **Security Note:** For production, store secrets in Azure Key Vault and use Key Vault References:
> ```
> @Microsoft.KeyVault(SecretUri=https://kv-tcld-energy.vault.azure.net/secrets/synapse-password/)
> ```

### 6b. Startup Command

Azure App Service needs to know how to start the app:

```bash
az webapp config set \
  --resource-group rg-tcld-energy \
  --name tcld-energy-dashboard \
  --startup-file "node server/index.js"
```

### 6c. Enable HTTPS Only

```bash
az webapp update \
  --resource-group rg-tcld-energy \
  --name tcld-energy-dashboard \
  --https-only true
```

### 6d. Configure CORS (if needed separately)

If you need frontend and API on separate origins:

```bash
az webapp cors add \
  --resource-group rg-tcld-energy \
  --name tcld-energy-dashboard \
  --allowed-origins "https://tcld-energy-dashboard.azurewebsites.net"
```

> In our architecture, frontend and API are on the **same origin**, so CORS is not strictly needed in production.

---

## Step 7 — Verify the Deployment

### 7a. Check App Status

```bash
az webapp show \
  --resource-group rg-tcld-energy \
  --name tcld-energy-dashboard \
  --query "state" -o tsv
# Expected: Running
```

### 7b. Test API Health

```bash
curl https://tcld-energy-dashboard.azurewebsites.net/api/health
# Expected: { "status": "API Online", "timestamp": "..." }
```

### 7c. Test Database Connection

```bash
curl https://tcld-energy-dashboard.azurewebsites.net/api/test-db
# Expected: { "success": true, "version": "...", "message": "Connected to Synapse successfully" }
```

### 7d. Open the App

Navigate to `https://tcld-energy-dashboard.azurewebsites.net` — you should see the login page, then be redirected through Microsoft Entra ID login.

### 7e. Check Logs (if errors occur)

```bash
# Stream live logs
az webapp log tail \
  --resource-group rg-tcld-energy \
  --name tcld-energy-dashboard

# Or download recent logs
az webapp log download \
  --resource-group rg-tcld-energy \
  --name tcld-energy-dashboard \
  --log-file logs.zip
```

---

## CI/CD with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Azure App Service

on:
  push:
    branches: [main]

env:
  AZURE_WEBAPP_NAME: tcld-energy-dashboard
  NODE_VERSION: '20.x'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build frontend
        run: npm run build
        env:
          VITE_AZURE_CLIENT_ID: ${{ secrets.VITE_AZURE_CLIENT_ID }}
          VITE_AZURE_TENANT_ID: ${{ secrets.VITE_AZURE_TENANT_ID }}
          VITE_REDIRECT_URI: https://${{ env.AZURE_WEBAPP_NAME }}.azurewebsites.net
          VITE_API_BASE_URL: /api

      - name: Prepare deployment package
        run: |
          mkdir -p deploy
          cp -r dist deploy/
          cp -r server deploy/
          cp package.json deploy/
          cp package-lock.json deploy/
          cd deploy && npm ci --omit=dev

      - name: Deploy to Azure Web App
        uses: azure/webapps-deploy@v3
        with:
          app-name: ${{ env.AZURE_WEBAPP_NAME }}
          package: deploy
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
```

### GitHub Secrets to Configure

| Secret | Value |
|---|---|
| `AZURE_WEBAPP_PUBLISH_PROFILE` | Download from Azure Portal → App Service → **Get publish profile** |
| `VITE_AZURE_CLIENT_ID` | Your Entra App registration Client ID |
| `VITE_AZURE_TENANT_ID` | Your Entra Tenant ID |

---

## Troubleshooting

### "Application Error" on load

1. Check startup command is set: `node server/index.js`
2. Check Node version: `az webapp config show --query linuxFxVersion`
3. Stream logs: `az webapp log tail --resource-group rg-tcld-energy --name tcld-energy-dashboard`

### "Cannot GET /" — SPA routes return 404

Ensure `server/index.js` has the production catch-all:
```js
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../dist')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../dist', 'index.html'));
    });
}
```

### Database connection timeout

- Verify Synapse firewall allows the App Service outbound IPs
- Check Application Settings match your Synapse credentials exactly
- Add the App Service outbound IP to Synapse firewall:
  ```bash
  # Get outbound IPs
  az webapp show --resource-group rg-tcld-energy --name tcld-energy-dashboard --query outboundIpAddresses -o tsv
  ```

### Entra ID redirect loop

- Ensure the Redirect URI in the App Registration exactly matches your App Service URL (including `https://`)
- Check `VITE_AZURE_CLIENT_ID` and `VITE_AZURE_TENANT_ID` were set correctly at **build time**

### In-memory data lost on restart

The current `server/routes/api.js` uses in-memory arrays for widgets and dashboards. Data resets when the App Service restarts. **To persist data**, update the API routes to use the `App_Widgets` and `App_Dashboards` Synapse tables (see DATABASE_SCHEMA.md for the table definitions). This migration involves:

1. Replace in-memory `savedWidgets[]` and `savedDashboards[]` with SQL queries
2. `POST /widgets` → `INSERT INTO App_Widgets ...`
3. `GET /widgets` → `SELECT * FROM App_Widgets ...`
4. `PUT /widgets/:id` → `UPDATE App_Widgets SET ... WHERE id = :id`
5. `DELETE /widgets/:id` → `DELETE FROM App_Widgets WHERE id = :id`
6. Same pattern for `/dashboards` CRUD
7. Parse/stringify the `Config`, `Layout`, and `Widgets` JSON columns

---

## Summary Checklist

- [ ] Azure Resource Group created
- [ ] App Service Plan + Web App created (Node 20 LTS)
- [ ] Synapse tables created (`App_Widgets`, `App_Dashboards`)
- [ ] Entra ID App Registration configured with SPA redirect URI
- [ ] `.env.production` created with `VITE_*` vars
- [ ] `npm run build` succeeds (produces `dist/`)
- [ ] App Service Application Settings set (`AZURE_SYNAPSE_*`, `NODE_ENV`, `PORT`)
- [ ] Startup command set to `node server/index.js`
- [ ] ZIP deploy or GitHub Actions pipeline configured
- [ ] `/api/health` and `/api/test-db` return success
- [ ] SPA loads and Entra ID login works
- [ ] Synapse firewall permits App Service outbound IPs
