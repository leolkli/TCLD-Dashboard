# Database Schema Documentation

This document outlines the database schema required for the **TCLD Energy Dashboard** features, specifically the widget library, scoped dashboards, and sidebar navigation.

**Note:** As Azure Synapse Analytics does not support enforced Primary Key or Foreign Key constraints, these relationships are logical only and must be maintained by the application layer.

---

## Design Overview

The system uses two application tables:

| Table | Purpose |
|---|---|
| `App_Widgets` | Saved widget configurations (chart type, data-point bindings, styling). |
| `App_Dashboards` | Dashboard definitions with a **scope** that controls where they appear. |

### Dashboard Scopes

| Scope | Cardinality | Description |
|---|---|---|
| `portfolio-main` | **1 per portfolio** | Shown when a portfolio is clicked in the sidebar. |
| `building-main` | **1 per building** | Shown when a building is clicked in the sidebar. |
| `building-sub` | **Unlimited per building** | Listed below the building in the sidebar. |

Dashboards reference widgets by ID. A single widget can be placed on multiple dashboards. Layout positions are stored as a JSON array compatible with `react-grid-layout`.

---

## Required Tables

Run the following SQL scripts in Azure Synapse with a user that has `CREATE TABLE` permissions.

### 1. App_Widgets

Stores the reusable widget configurations created in the Widget Configurator. Each widget has a **scope** (`building` or `portfolio`) and is tied to either a building or a portfolio.

**Keys:**
- `id`: Unique Identifier (Identity Column)
- `WidgetScope`: `'building'` or `'portfolio'`
- `BuildingCode`: Logical link to `DW_D_BuildingName` (set when WidgetScope = `building`)
- `PortfolioName`: Logical link to `DW_D_Portfolio_New.PortfolioName` (set when WidgetScope = `portfolio`)

```sql
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'App_Widgets')
BEGIN
    CREATE TABLE App_Widgets (
        id              INT IDENTITY(1,1) NOT NULL,
        Name            NVARCHAR(255) NOT NULL,
        WidgetScope     NVARCHAR(20) NOT NULL DEFAULT 'building', -- 'building' | 'portfolio'
        BuildingCode    NVARCHAR(50),          -- Set when WidgetScope = 'building'
        BuildingName    NVARCHAR(255),          -- Denormalized for display
        PortfolioName   NVARCHAR(255),          -- Set when WidgetScope = 'portfolio'
        Config          NVARCHAR(4000) NOT NULL,-- Full WidgetConfiguration JSON (dataPoints, chart, scales, etc.)
        CreatedBy       NVARCHAR(100),
        CreatedAt       DATETIME, -- App must populate
        UpdatedAt       DATETIME
    )
    WITH (DISTRIBUTION = ROUND_ROBIN, CLUSTERED COLUMNSTORE INDEX)
END
```

#### Config JSON shape (matches `WidgetConfiguration` TypeScript type)

```jsonc
{
  "name": "Electricity Trend",
  "widgetScope": "building",
  "buildingCode": "B001",
  "buildingName": "Tower A",
  "portfolioName": "",
  "dataPoints": [
    { "code": "TAG001", "name": "Main Meter kWh", "building": "B001", "system": "Electrical", "uom": "kWh", "commodity": "Electricity", "color": "#4F46E5", "axisIndex": 0 }
  ],
  "size": { "useContainerSize": true, "width": "100%", "height": "100%" },
  "dateRange": { "preset": "1M", "aggregation": "daily" },
  "general": { "title": "Electricity Trend", "refreshInterval": 300 },
  "header": { "visible": true, "fontSize": "medium", "showLastValue": true, "showChangePercent": true },
  "chart": { "type": "line", "lineWidth": 2, "fillOpacity": 30, "showGridLines": true, "backgroundColor": "#ffffff", "upColor": "#22ab94", "downColor": "#f7525f" },
  "comparison": { "enabled": false, "mode": "same-axis", "showVolume": false },
  "scales": { "yAxisMode": "auto", "scaleType": "linear", "showPriceScale": true, "precision": 2 }
}
```

### 2. App_Dashboards

Stores dashboard definitions visible in the sidebar. Each dashboard has a **scope** that determines its position in the hierarchy and uniqueness constraints.

**Keys:**
- `id`: Unique Identifier (Identity Column)
- `Scope`: One of `portfolio-main`, `building-main`, `building-sub`
- `PortfolioName`: Logical link to `DW_D_Portfolio_New.PortfolioName` (set when scope = `portfolio-main`)
- `BuildingCode`: Logical link to `DW_D_BuildingName.BuildingCode` (set when scope = `building-main` or `building-sub`)

**Uniqueness constraints (enforced by application layer):**
- Only **one** `portfolio-main` dashboard per `PortfolioName`
- Only **one** `building-main` dashboard per `BuildingCode`
- Unlimited `building-sub` dashboards per `BuildingCode`

```sql
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'App_Dashboards')
BEGIN
    CREATE TABLE App_Dashboards (
        id              INT IDENTITY(1,1) NOT NULL,
        Name            NVARCHAR(255) NOT NULL,
        Scope           NVARCHAR(20) NOT NULL,  -- 'portfolio-main' | 'building-main' | 'building-sub'
        PortfolioName   NVARCHAR(255),           -- Set when Scope = 'portfolio-main'
        BuildingCode    NVARCHAR(50),            -- Set when Scope = 'building-main' or 'building-sub'
        BuildingName    NVARCHAR(255),           -- Denormalized for display
        Layout          NVARCHAR(4000) NOT NULL, -- JSON array of react-grid-layout positions
        Widgets         NVARCHAR(4000) NOT NULL, -- JSON array of DashboardWidgetInstance objects
        SortOrder       INT DEFAULT 0,
        CreatedBy       NVARCHAR(100),
        CreatedAt       DATETIME, -- App must populate
        UpdatedAt       DATETIME
    )
    WITH (DISTRIBUTION = ROUND_ROBIN, CLUSTERED COLUMNSTORE INDEX)
END
```

#### Layout JSON shape (matches `react-grid-layout` `Layout[]`)

```jsonc
[
  { "i": "w-1709312345-abc", "x": 0, "y": 0, "w": 6, "h": 4 },
  { "i": "w-1709312345-def", "x": 6, "y": 0, "w": 6, "h": 4 }
]
```

#### Widgets JSON shape (matches `DashboardWidgetInstance[]`)

```jsonc
[
  { "layoutId": "w-1709312345-abc", "widgetId": "42", "widgetName": "Electricity Trend" },
  { "layoutId": "w-1709312345-def", "widgetId": "7",  "widgetName": "Gas Usage" }
]
```

> `layoutId` in each `DashboardWidgetInstance` matches the `i` property of the corresponding `Layout` entry.

*Note: `NVARCHAR(4000)` is used for JSON columns because Azure Synapse does not have a native `JSON` column type, but fully supports JSON functions (`JSON_VALUE`, `OPENJSON`, etc.) on string columns.*

---

## Migration: Dropping Old Tables

If you previously created the old folder-based tables, you can remove them:

```sql
-- Drop legacy tables (only if they exist)
IF OBJECT_ID('App_DashboardFolders', 'U') IS NOT NULL DROP TABLE App_DashboardFolders;
IF OBJECT_ID('App_DashboardTemplates', 'U') IS NOT NULL DROP TABLE App_DashboardTemplates;
-- Note: App_Dashboards is recreated above with a new schema.
-- Drop the old version first if it has the legacy FolderId column:
-- IF COL_LENGTH('App_Dashboards', 'FolderId') IS NOT NULL DROP TABLE App_Dashboards;
```

---

## Existing Dependency Tables

The application relies on the following existing Data Warehouse tables for the building/portfolio hierarchy:

| Table | Key Columns | Used For |
|---|---|---|
| `dbo.DW_D_Portfolio_New` | `PortfolioName`, `BuildingCode` | Portfolio → Building mapping; sidebar hierarchy |
| `dbo.DW_D_BuildingName` | `BuildingCode`, `BuildingName` | Building display names; widget building selector |
| `dbo.DW_D_EAPtag` | `Code`, `Name`, `BuildingCode`, `System`, `UOM`, `Commodity` | Tag search in Widget Configurator |

---

## Troubleshooting

If you encounter permission errors when running these scripts from the application, please use a dedicated SQL Admin account to execute them directly in the database.
