"""
Database Diagnostic Script
Checks connection and available tables
"""

import pyodbc
import os
from dotenv import load_dotenv

load_dotenv()

DB_SERVER = os.getenv("DB_SERVER", "dev-saw-tcld-01.sql.azuresynapse.net")
DB_NAME = os.getenv("DB_NAME", "tcld_syn_db_dev")
DB_AUTH_METHOD = os.getenv("DB_AUTH_METHOD", "ActiveDirectoryInteractive")

CONNECTION_STRING = (
    f"Driver={{ODBC Driver 17 for SQL Server}};"
    f"Server={DB_SERVER};"
    f"Database={DB_NAME};"
    f"Authentication={DB_AUTH_METHOD};"
    f"Encrypt=yes;"
    f"TrustServerCertificate=no;"
    f"Connection Timeout=30;"
)

print("=" * 60)
print("DATABASE DIAGNOSTIC REPORT")
print("=" * 60)
print(f"\nConnection Details:")
print(f"  Server: {DB_SERVER}")
print(f"  Database: {DB_NAME}")
print(f"  Auth Method: {DB_AUTH_METHOD}")

print("\n" + "=" * 60)
print("STEP 1: Testing Connection...")
print("=" * 60)

try:
    conn = pyodbc.connect(CONNECTION_STRING)
    print("✓ Connection SUCCESSFUL")
    
    cursor = conn.cursor()
    
    # Test basic query
    print("\n" + "=" * 60)
    print("STEP 2: Testing Basic Query...")
    print("=" * 60)
    
    cursor.execute("SELECT 1 as test")
    result = cursor.fetchone()
    print(f"✓ Basic query works: {result}")
    
    # Get all tables
    print("\n" + "=" * 60)
    print("STEP 3: Available Tables in Database...")
    print("=" * 60)
    
    cursor.execute("""
    SELECT TABLE_SCHEMA, TABLE_NAME
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_TYPE = 'BASE TABLE'
    ORDER BY TABLE_SCHEMA, TABLE_NAME
    """)
    
    tables = cursor.fetchall()
    print(f"\nFound {len(tables)} tables:")
    for schema, table_name in tables:
        print(f"  - {schema}.{table_name}")
    
    # Check for specific tables we're querying
    print("\n" + "=" * 60)
    print("STEP 4: Checking Tables Used by Dashboard...")
    print("=" * 60)
    
    tables_to_check = [
        ("dbo", "DW_D_Building"),
        ("dbo", "DW_D_Area"),
        ("dbo", "DW_F_EAPtag"),
        ("dbo", "Config_AlertEmail_SmartWaste"),
    ]
    
    for schema, table in tables_to_check:
        cursor.execute(f"""
        SELECT COUNT(*) as row_count
        FROM {schema}.{table}
        """)
        count = cursor.fetchone()[0]
        status = "✓" if count > 0 else "✗"
        print(f"{status} {schema}.{table}: {count} rows")
    
    # Check building data
    print("\n" + "=" * 60)
    print("STEP 5: Sample Data from DW_D_Building...")
    print("=" * 60)
    
    cursor.execute("SELECT TOP 5 * FROM dbo.DW_D_Building")
    buildings = cursor.fetchall()
    print(f"Found {len(buildings)} buildings:")
    for row in buildings:
        print(f"  - {row}")
    
    conn.close()
    
except pyodbc.Error as e:
    print(f"✗ Database Error: {e}")
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
print("DIAGNOSTIC COMPLETE")
print("=" * 60)
