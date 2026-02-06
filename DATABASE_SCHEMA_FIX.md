# Database Schema Mapping Fix

## Problem
The dashboard was returning "Invalid column name" errors for:
- `'portfolio'` in buildings query  
- `'value'` in metrics query
- `'buildingId'`, `'areaId'`, `'id'`, `'ptagId'`, `'unit'` in EA Ptag query

## Root Cause
The original code was written for a different database schema than what exists in the Azure Synapse database. The queries assumed tables and columns that don't exist.

## Solution
Updated `database.py` to use the actual Azure Synapse schema:

### Buildings
**Old Query:**
```sql
SELECT buildingId, buildingName, region, portfolio
FROM dbo.DW_D_Building
```

**New Query:**
```sql
SELECT BuildingID, BuildingName, Region, PortfolioType
FROM dbo.DW_D_BUILDING_BK20260120
```

**Mapping:**
- `buildingId` → `BuildingID`
- `buildingName` → `BuildingName`
- `portfolio` → `PortfolioType`
- Table: `DW_D_Building` → `DW_D_BUILDING_BK20260120` (latest backup version)

### Areas/Locations  
**Old Query:**
```sql
SELECT areaId, areaName, buildingId
FROM dbo.DW_D_Area
```

**New Query:**
```sql
SELECT LocationName as areaName, Area as areaCode, Portfolio as buildingCode
FROM dbo.DM_F_IAQ_BuildingLayer_Hourly_Dashboard_AllDate_CN
```

**Mapping:**
- Uses IAQ (Indoor Air Quality) dashboard data which contains location/area information
- `LocationName` provides area names
- `Area` provides area codes  
- `Portfolio` links to buildings

### Energy Meter (EA Ptag) Data
**Old Query:**
```sql
SELECT id, buildingId, areaId, ptagId, value, unit, timestamp
FROM dbo.DW_F_EAPtag
```

**New Query:**
```sql
SELECT metercode as ptagId, timestamp, MeterReadings as value, UOM as unit
FROM dbo.DW_F_EAPtag_T
```

**Mapping:**
- `ptagId` ← `metercode`
- `value` ← `MeterReadings`
- `unit` ← `UOM`
- Table: `DW_F_EAPtag` → `DW_F_EAPtag_T` (general energy ptag table)

### Dashboard Metrics
**Old Query:**
```sql
SUM(CAST(value AS FLOAT))
```

**New Query:**
```sql
SUM(CAST(MeterReadings AS FLOAT))
```

## Actual Database Structure

### Key Dimension Tables
- `DW_D_BUILDING_BK*` - Building information (multiple versions with date suffixes)
- Columns: `BuildingID`, `BuildingName`, `Region`, `PortfolioType`, `Floor`, etc.

### Key Fact Tables - Energy Data
- `DW_F_EAPtag_T` - General EA Ptag (energy meter) readings
  - Columns: `MeterCode`, `DateKey`, `TimeKey`, `Timestamp`, `UOM`, `MeterReadings`, etc.
- Building-specific tables: `DW_F_EAPtag_HTH`, `DW_F_EAPtag_CP`, etc.
  - Same schema as above, partitioned by building code

### Key Fact Tables - IAQ Data  
- `DM_F_IAQ_BuildingLayer_Hourly_Dashboard_AllDate_*` - Indoor Air Quality data
  - Columns: `Portfolio`, `Area`, `LocationName`, `Floor`, `SiteName`, `PM2.5`, `PM10`, `CO2`, `Temperature`, `Humidity`, etc.
  - Multiple versions for different regions/countries (CN, HK, etc.)

## Testing
To verify the fix works locally:
```bash
python test_database.py
```

This will test:
1. Database connection
2. get_buildings()
3. get_areas(building_id)
4. get_eaptag_data()
5. get_dashboard_metrics()

## Deployment
Changes committed to GitHub and will be automatically deployed by the GitHub Actions workflow.

The web app log stream should now show successful database queries instead of "Invalid column" errors.

## Next Steps
1. Monitor Azure log stream for successful data retrieval
2. Check web app at https://tcld-dashboard.azurewebsites.net for data population
3. If specific building/area data is needed, additional table mappings may be required
