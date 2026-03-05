# Azure UAT Deployment Guide (Mock Auth) — TCLD Energy Dashboard

This guide covers deploying to the **existing** Azure App Service (`TCLD-Dashboard-UAT`) and Synapse environment, specifically configured to **bypass Microsoft Entra ID** authentication for UAT testing.

---

## 1. Prerequisites (Already Completed)

- **App Service**: `TCLD-Dashboard-UAT` exists.
- **Database**: `App_Widgets` and `App_Dashboards` tables created in Dev Synapse.
- **Codebase**: Updated to support SQL persistence (done automatically by the previous step).

---

## 2. Configure Mock Authentication

Since we are skipping Entra ID for now, we must build the frontend in **Mock Mode**. This uses a hardcoded developer user instead of redirecting to Microsoft login.

### Create `.env.production` file
Create a file named `.env.production` in the project root with the following content:

```dotenv
# AUTHENTICATION: MOCK MODE
# This bypasses MSAL/Entra ID completely
VITE_USE_MOCK_AUTH=true

# API Configuration
# In production, the API is served from the same origin
VITE_API_BASE_URL=/api

# (Optional) MSAL placeholders - required by build but ignored in mock mode
VITE_AZURE_CLIENT_ID=placeholder-client-id
VITE_AZURE_TENANT_ID=placeholder-tenant-id
VITE_REDIRECT_URI=http://localhost:3000
```

---

## 3. Build the Application

Run the build command locally. This embeds the `VITE_USE_MOCK_AUTH=true` flag into the React application.

```bash
# Install dependencies
npm install

# Build the project (output goes to /dist)
npm run build
```

---

## 4. Prepare Deployment Package

We need to zip the production-ready files.

**Include:**
- `dist/` (The built frontend)
- `server/` (The Express backend API)
- `package.json`
- `package-lock.json`

**Exclude:**
- `node_modules/`
- `src/`
- `.env` files

**PowerShell Command:**
```powershell
Compress-Archive -Path dist, server, package.json, package-lock.json -DestinationPath deploy.zip -Force
```

---

## 5. Configure App Service Settings (Service Principal)

Before deploying code, ensure the App Service has the correct environment variables for **Service Principal Authentication** to your Synapse database.

**Run in Azure CLI or set in Azure Portal → Configuration:**

```bash
# Replace <values> with your actual credentials

az webapp config appsettings set \
  --name TCLD-Dashboard-UAT \
  --resource-group <Your-Resource-Group> \
  --settings \
    NODE_ENV=production \
    AZURE_SYNAPSE_SQL_ENDPOINT="<your-synapse-workspace>.sql.azuresynapse.net" \
    AZURE_SYNAPSE_DATABASE="<your-database-name>" \
    AZURE_CLIENT_ID="<service-principal-client-id>" \
    AZURE_CLIENT_SECRET="<service-principal-secret>" \
    AZURE_TENANT_ID="<service-principal-tenant-id>" \
    PORT=8080
```

> **Note:** The updated code automatically detects `AZURE_CLIENT_ID` and switches to Service Principal authentication. You do NOT need `AZURE_SYNAPSE_USERNAME` or `AZURE_SYNAPSE_PASSWORD` anymore.

Also, set the startup command:

```bash
az webapp config set \
  --name TCLD-Dashboard-UAT \
  --resource-group <Your-Resource-Group> \
  --startup-file "node server/index.js"
```

---

## 6. Deploy Code

Deploy the zip file created in Step 4.

```bash
az webapp deploy \
  --name TCLD-Dashboard-UAT \
  --resource-group <Your-Resource-Group> \
  --src-path deploy.zip \
  --type zip
```

---

## 7. Verification

1. **Visit the URL**: `https://tcld-dashboard-uat.azurewebsites.net`
2. **Login**: Click "Login" — it should **immediately** log you in as "Mock Developer" without redirecting to Microsoft.
3. **Database Test**:
   - Go to **Widget Configurator**.
   - Create a test widget and save it.
   - Refresh the page.
   - Ensure the widget is still listed (this confirms the SQL connection to `App_Widgets` is working).

---

## 8. Troubleshooting

- **"Login failed" loop**: Ensure `VITE_USE_MOCK_AUTH=true` was exactly correct in `.env.production` when you ran `npm run build`.
- **Widgets valid but not saving** or **Database Connection Failed**:
  - Check App Service logs (`Log Stream`).
  - Verify your **Service Principal** has been granted access to the Synapse SQL Pool:
    ```sql
    -- Run this in Synapse Studio map the service principal
    -- Replace 'ServicePrincipalName' with the Name of SP (not ID)
    CREATE USER [ServicePrincipalName] FROM EXTERNAL PROVIDER;
    EXEC sp_addrolemember 'db_owner', 'ServicePrincipalName';
    ```
