"""
Database Connection Module for TCLD Dashboard
Handles Azure Synapse database operations with username/password authentication
"""

import pyodbc
import pandas as pd
import logging
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

# Database configuration
DB_SERVER = os.getenv("DB_SERVER", "dev-saw-tcld-01.sql.azuresynapse.net")
DB_NAME = os.getenv("DB_NAME", "tcld_syn_db_dev")
DB_USER = os.getenv("DB_USER", "readonlyappuser")
DB_PASSWORD = os.getenv("DB_PASSWORD", "sqHbKRVQmk7TYDyEXtfWG6")

# Connection string using SQL Server authentication (username/password)
CONNECTION_STRING = (
    f"Driver={{ODBC Driver 17 for SQL Server}};"
    f"Server={DB_SERVER};"
    f"Database={DB_NAME};"
    f"UID={DB_USER};"
    f"PWD={DB_PASSWORD};"
    f"Encrypt=yes;"
    f"TrustServerCertificate=no;"
    f"Connection Timeout=30;"
)


def get_connection():
    """Get database connection"""
    try:
        logger.info(f"Attempting to connect to {DB_SERVER}/{DB_NAME} as {DB_USER}")
        conn = pyodbc.connect(CONNECTION_STRING, timeout=30)
        logger.info("Database connection successful")
        return conn
    except Exception as e:
        logger.error(f"Database connection error: {str(e)}")
        logger.error(f"Connection string: Driver=ODBC Driver 17 for SQL Server;Server={DB_SERVER};Database={DB_NAME};UID={DB_USER};[PASSWORD_SET]")
        return None


def test_connection():
    """Test database connection"""
    try:
        conn = get_connection()
        if conn:
            cursor = conn.cursor()
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            conn.close()
            return result is not None
        return False
    except Exception as e:
        logger.error(f"Connection test failed: {e}")
        return False


def get_buildings():
    """Get list of all buildings"""
    try:
        conn = get_connection()
        if not conn:
            logger.error("Failed to get database connection in get_buildings()")
            return None

        # Query the most recent building dimension table
        query = """
        SELECT DISTINCT
            BuildingID,
            BuildingName,
            Region,
            PortfolioType
        FROM dbo.DW_D_BUILDING_BK20260120
        WHERE BuildingID IS NOT NULL
        ORDER BY BuildingName
        """

        logger.info("Executing query to get buildings...")
        df = pd.read_sql(query, conn)
        conn.close()
        
        logger.info(f"Retrieved {len(df)} buildings from database")

        if df.empty:
            logger.warning("Buildings query returned no results")
            return None

        return df.to_dict("records")
    except Exception as e:
        logger.error(f"Error getting buildings: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return None


def get_areas(building_id):
    """Get areas/locations for a specific building from IAQ dashboard data"""
    try:
        if not building_id:
            return None

        conn = get_connection()
        if not conn:
            return None

        # Query the IAQ dashboard to get unique locations/areas for a building
        query = """
        SELECT DISTINCT
            LocationName as areaName,
            Area as areaCode,
            Portfolio as buildingCode
        FROM dbo.DM_F_IAQ_BuildingLayer_Hourly_Dashboard_AllDate_CN
        WHERE Portfolio = ?
        ORDER BY LocationName
        """

        df = pd.read_sql(query, conn, params=[building_id])
        conn.close()

        if df.empty:
            logger.warning(f"No areas found for building {building_id}")
            return None

        return df.to_dict("records")
    except Exception as e:
        logger.error(f"Error getting areas: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return None


def get_eaptag_data(building_id=None, area_id=None, start_date=None, end_date=None, limit=100):
    """Get EA Ptag (energy meter) data from available tables with building and location info"""
    try:
        conn = get_connection()
        if not conn:
            return None

        # Query combines EA Ptag data with building and location information
        query = f"""
        SELECT TOP {limit}
            b.BuildingName,
            iaq.LocationName,
            e.metercode as ptagId,
            e.timestamp,
            e.MeterReadings as value,
            e.UOM as unit
        FROM dbo.DW_F_EAPtag_T e
        LEFT JOIN dbo.DW_D_BUILDING_BK20260120 b ON e.metercode LIKE b.BuildingName + '%'
        LEFT JOIN dbo.DM_F_IAQ_BuildingLayer_Hourly_Dashboard_AllDate_CN iaq ON iaq.Portfolio = b.BuildingID
        WHERE 1=1
        """

        params = []

        if building_id:
            query += " AND b.BuildingID = ?"
            params.append(building_id)

        if area_id:
            query += " AND iaq.LocationName = ?"
            params.append(area_id)

        if start_date:
            query += " AND e.timestamp >= ?"
            params.append(start_date)

        if end_date:
            query += " AND e.timestamp <= ?"
            params.append(end_date)

        query += " ORDER BY e.timestamp DESC"

        logger.info(f"Executing EA Ptag query with {len(params)} parameters...")
        df = pd.read_sql(query, conn, params=params)
        conn.close()

        if df.empty:
            logger.warning("EA Ptag query returned no results")
            return None

        return df.to_dict("records")
    except Exception as e:
        logger.error(f"Error getting EA Ptag data: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return None


def get_dashboard_metrics(building_id=None, start_date=None, end_date=None):
    """Get dashboard metrics (summary statistics)"""
    try:
        conn = get_connection()
        if not conn:
            return None

        query = """
        SELECT
            SUM(CAST(MeterReadings AS FLOAT)) as totalEnergyConsumption,
            AVG(CAST(MeterReadings AS FLOAT)) as averageConsumption,
            MAX(CAST(MeterReadings AS FLOAT)) as peakConsumption,
            MIN(CAST(MeterReadings AS FLOAT)) as lowestConsumption,
            COUNT(*) as recordCount,
            MIN(timestamp) as startDate,
            MAX(timestamp) as endDate
        FROM dbo.DW_F_EAPtag_T
        WHERE 1=1
        """

        params = []

        if start_date:
            query += " AND timestamp >= ?"
            params.append(start_date)

        if end_date:
            query += " AND timestamp <= ?"
            params.append(end_date)

        logger.info("Executing metrics query...")
        df = pd.read_sql(query, conn, params=params)
        conn.close()

        if df.empty:
            logger.warning("Metrics query returned no results")
            return None

        metrics = df.iloc[0].to_dict()

        # Handle None values
        metrics["totalEnergyConsumption"] = metrics.get("totalEnergyConsumption") or 0
        metrics["averageConsumption"] = metrics.get("averageConsumption") or 0
        metrics["peakConsumption"] = metrics.get("peakConsumption") or 0
        metrics["lowestConsumption"] = metrics.get("lowestConsumption") or 0
        metrics["recordCount"] = metrics.get("recordCount") or 0

        logger.info(f"Retrieved metrics: Total={metrics['totalEnergyConsumption']}, Records={metrics['recordCount']}")
        return metrics
    except Exception as e:
        logger.error(f"Error getting metrics: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return None
