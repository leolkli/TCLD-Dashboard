"""
Database Connection Module for TCLD Dashboard
Handles Azure Synapse database operations with Managed Identity authentication
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
# Use Managed Identity for Azure App Service, ActiveDirectory for local dev
DB_AUTH_METHOD = os.getenv("DB_AUTH_METHOD", "Active Directory Managed Identity")

# Connection string using Managed Identity (works on Azure App Service)
# For local development with ActiveDirectoryInteractive, change DB_AUTH_METHOD in .env
CONNECTION_STRING = (
    f"Driver={{ODBC Driver 17 for SQL Server}};"
    f"Server={DB_SERVER};"
    f"Database={DB_NAME};"
    f"Authentication={DB_AUTH_METHOD};"
    f"Encrypt=yes;"
    f"TrustServerCertificate=no;"
    f"Connection Timeout=30;"
)


def get_connection():
    """Get database connection"""
    try:
        conn = pyodbc.connect(CONNECTION_STRING)
        return conn
    except Exception as e:
        logger.error(f"Database connection error: {e}")
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
            return None

        query = """
        SELECT DISTINCT
            buildingId,
            buildingName,
            region,
            portfolio
        FROM dbo.DW_D_Building
        WHERE buildingId IS NOT NULL
        ORDER BY buildingName
        """

        df = pd.read_sql(query, conn)
        conn.close()

        if df.empty:
            return None

        return df.to_dict("records")
    except Exception as e:
        logger.error(f"Error getting buildings: {e}")
        return None


def get_areas(building_id):
    """Get areas for a specific building"""
    try:
        if not building_id:
            return None

        conn = get_connection()
        if not conn:
            return None

        query = """
        SELECT DISTINCT
            areaId,
            areaName,
            buildingId
        FROM dbo.DW_D_Area
        WHERE buildingId = ?
        ORDER BY areaName
        """

        df = pd.read_sql(query, conn, params=[building_id])
        conn.close()

        if df.empty:
            return None

        return df.to_dict("records")
    except Exception as e:
        logger.error(f"Error getting areas: {e}")
        return None


def get_eaptag_data(building_id=None, area_id=None, start_date=None, end_date=None, limit=100):
    """Get EA Ptag data with optional filters"""
    try:
        conn = get_connection()
        if not conn:
            return None

        query = f"""
        SELECT TOP {limit}
            ea.id,
            ea.buildingId,
            b.buildingName,
            ea.areaId,
            a.areaName,
            ea.ptagId,
            ea.value,
            ea.unit,
            ea.timestamp
        FROM dbo.DW_F_EAPtag ea
        LEFT JOIN dbo.DW_D_Building b ON ea.buildingId = b.buildingId
        LEFT JOIN dbo.DW_D_Area a ON ea.areaId = a.areaId
        WHERE 1=1
        """

        params = []

        if building_id:
            query += " AND ea.buildingId = ?"
            params.append(building_id)

        if area_id:
            query += " AND ea.areaId = ?"
            params.append(area_id)

        if start_date:
            query += " AND ea.timestamp >= ?"
            params.append(start_date)

        if end_date:
            query += " AND ea.timestamp <= ?"
            params.append(end_date)

        query += " ORDER BY ea.timestamp DESC"

        df = pd.read_sql(query, conn, params=params)
        conn.close()

        if df.empty:
            return None

        return df.to_dict("records")
    except Exception as e:
        logger.error(f"Error getting EA Ptag data: {e}")
        return None


def get_dashboard_metrics(building_id=None, start_date=None, end_date=None):
    """Get dashboard metrics (summary statistics)"""
    try:
        conn = get_connection()
        if not conn:
            return None

        query = """
        SELECT
            SUM(CAST(value AS FLOAT)) as totalEnergyConsumption,
            AVG(CAST(value AS FLOAT)) as averageConsumption,
            MAX(CAST(value AS FLOAT)) as peakConsumption,
            MIN(CAST(value AS FLOAT)) as lowestConsumption,
            COUNT(*) as recordCount,
            MIN(timestamp) as startDate,
            MAX(timestamp) as endDate
        FROM dbo.DW_F_EAPtag
        WHERE 1=1
        """

        params = []

        if building_id:
            query += " AND buildingId = ?"
            params.append(building_id)

        if start_date:
            query += " AND timestamp >= ?"
            params.append(start_date)

        if end_date:
            query += " AND timestamp <= ?"
            params.append(end_date)

        df = pd.read_sql(query, conn, params=params)
        conn.close()

        if df.empty:
            return None

        metrics = df.iloc[0].to_dict()

        # Handle None values
        metrics["totalEnergyConsumption"] = metrics.get("totalEnergyConsumption") or 0
        metrics["averageConsumption"] = metrics.get("averageConsumption") or 0
        metrics["peakConsumption"] = metrics.get("peakConsumption") or 0
        metrics["lowestConsumption"] = metrics.get("lowestConsumption") or 0
        metrics["recordCount"] = metrics.get("recordCount") or 0

        return metrics
    except Exception as e:
        logger.error(f"Error getting metrics: {e}")
        return None
