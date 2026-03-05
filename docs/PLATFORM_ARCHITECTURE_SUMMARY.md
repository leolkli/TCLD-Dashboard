# TCLD Energy Management Platform: Architecture & Data Flow Summary

## Overall Architecture

The platform follows a modern, decoupled three-tier architecture hosted entirely within the Microsoft Azure ecosystem.

### 1. Frontend (Presentation Tier)
* **Framework:** React 18, rendered as a Single Page Application (SPA), built with Vite.
* **UI Library:** Material UI (MUI) for consistent, responsive, and accessible components.
* **Visualization:** Apache ECharts (via `echarts-for-react`) for high-performance, interactive data widget rendering, alongside Recharts for static dashboard elements.
* **State Management:** Zustand for lightweight global state (e.g., dashboard layouts) and React Context for Auth state.
* **Authentication:** MSAL (Microsoft Authentication Library) React wrapper, connecting to Entra ID (Azure AD) for enterprise SSO.
* **Hosting:** Hosted remotely within the Azure App Service (served statically by the Node.js backend).

### 2. Backend (Application/API Tier)
* **Framework:** Node.js running Express 4.x.
* **Deployment:** Containerized Web App hosted on **Azure App Service (Linux)**. Continuous Integration/Continuous Deployment (CI/CD) is managed via **GitHub Actions** from the `main` branch.
* **Database Driver:** `mssql` (Tedious) module to maintain a persistent connection pool to the data storage.
* **Role:** Acts as the secure middleware. It handles RESTful API requests, performs authentication checks (validating Entra ID tokens), dynamically constructs efficient SQL and aggregation commands, and prevents direct public access to the data warehouse.

### 3. Data Storage (Data Tier)
* **Platform:** Azure Synapse Analytics (Dedicated SQL Pool).
* **Architecture Strategy:** Star Schema / Snow-flake hybrid.
  * **Dimension Tables:** `DW_D_EAPtag` maps the hierarchy (Portfolios -> Buildings -> Systems -> Equipment -> Tags).
  * **Fact Tables:** Heavily partitioned dynamic fact tables (e.g., `F_tagfact...`) using Clustered Columnstore Indexes for massive analytical read performance.
  * **App Metadata:** Custom `dbo.App_Widgets` and `dbo.App_Dashboards` tables store the configuration state of the frontend UI directly alongside the big data.

---

## End-to-End Data Flow

### A. Analytics Data Flow (Reading Telemetry)
1. **User Action:** A user opens the Dashboard.
2. **API Call:** The React frontend identifies which widgets are on screen and fires a `GET /api/readings` to the App Service, passing the required tag codes, date ranges, and aggregation modes (hourly, daily).
3. **Dimension Lookup:** The Node.js server queries the Synapse `DW_D_EAPtag` dimension table to find out exactly which physical Fact Table (`F_tablename`) holds the requested telemetry.
4. **Data Extraction:** The Node.js server constructs an optimized `SELECT` with `GROUP BY` roll-ups (aggregations happen on the Synapse compute engine) and fetches the results over the TCP Tabular Data Stream (TDS) protocol.
5. **Payload Delivery:** The Node server formats the output into clean JSON and returns it to the browser.
6. **Rendering:** ECharts plots the JSON arrays onto the screen.

### B. Configuration Data Flow (Saving/Creating Dashboards)
1. **User Action:** An admin creates a new chart in the "Widget Configurator" and clicks "Save Widget".
2. **JSON Serialization:** The React app serializes the chart's structural settings (colors, axis styles, binding tags) into a JSON string.
3. **API Call:** React sends a `POST /api/widgets` request containing the configuration payload.
4. **Database Commit:** The Node.js backend executes a parameterized `INSERT` directly into the `dbo.App_Widgets` table in Synapse, saving the structured app metadata. (No Azure Data Factory or Pipelines are required for this app operational flow).

### C. Active Directory (Entra ID) Flow
1. **Login Redirect:** When a user lands on the site, MSAL redirects them to the Microsoft Login portal.
2. **Token Acquisition:** Upon success, the browser receives an Access Token.
3. **API Authorization:** For every API outbound call, this Token is placed in the HTTP `Authorization: Bearer` header.
4. **Service Principal Backend:** The Node.js server connects to the Synapse workspace using a background Service Principal (App Registration `AZURE_CLIENT_ID` + Secret), securely executing the downstream actions on the authorized user's behalf.
