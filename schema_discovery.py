"""
Schema Discovery Script - Identifies actual table and column names in Azure Synapse
"""

import pyodbc
import os
from dotenv import load_dotenv

load_dotenv()

# Database configuration
DB_SERVER = os.getenv("DB_SERVER", "dev-saw-tcld-01.sql.azuresynapse.net")
DB_NAME = os.getenv("DB_NAME", "tcld_syn_db_dev")
DB_USER = os.getenv("DB_USER", "readonlyappuser")
DB_PASSWORD = os.getenv("DB_PASSWORD", "sqHbKRVQmk7TYDyEXtfWG6")

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

try:
    print("Connecting to database...")
    conn = pyodbc.connect(CONNECTION_STRING, timeout=30)
    cursor = conn.cursor()
    
    # Get all tables
    print("\n" + "="*80)
    print("AVAILABLE TABLES:")
    print("="*80)
    cursor.execute("""
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_TYPE='BASE TABLE'
        ORDER BY TABLE_NAME
    """)
    tables = cursor.fetchall()
    for table in tables:
        print(f"  - {table[0]}")
    
    # For each table that looks relevant, show columns
    relevant_keywords = ['building', 'area', 'ptag', 'energy', 'metric', 'tag', 'fact', 'dimension']
    
    for table_row in tables:
        table_name = table_row[0]
        # Check if table name contains relevant keywords
        table_lower = table_name.lower()
        
        if any(keyword in table_lower for keyword in relevant_keywords):
            print(f"\n{'-'*80}")
            print(f"TABLE: {table_name}")
            print(f"{'-'*80}")
            
            # Get columns for this table
            cursor.execute(f"""
                SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_NAME = '{table_name}'
                ORDER BY ORDINAL_POSITION
            """)
            
            columns = cursor.fetchall()
            for col in columns:
                nullable = "NULL" if col[2] == 'YES' else "NOT NULL"
                print(f"  {col[0]:30} {col[1]:20} {nullable}")
    
    # Also try to peek at data from likely tables
    print(f"\n{'='*80}")
    print("SAMPLE DATA EXPLORATION:")
    print(f"{'='*80}")
    
    # Try to find building-related tables
    cursor.execute("""
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_NAME LIKE '%[Bb]uilding%'
           OR TABLE_NAME LIKE '%[Dd]im%'
           OR TABLE_NAME LIKE '%[Ff]act%'
    """)
    
    sample_tables = cursor.fetchall()
    
    for table_row in sample_tables:
        table_name = table_row[0]
        print(f"\nTable: {table_name}")
        try:
            cursor.execute(f"SELECT TOP 3 * FROM [{table_name}]")
            rows = cursor.fetchall()
            
            # Get column names
            cursor.execute(f"""
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_NAME = '{table_name}'
                ORDER BY ORDINAL_POSITION
            """)
            col_names = [col[0] for col in cursor.fetchall()]
            
            print("  Columns:", ", ".join(col_names))
            print(f"  Sample rows ({len(rows)}): ")
            for row in rows:
                print(f"    {row}")
        except Exception as e:
            print(f"  Error reading table: {e}")
    
    conn.close()
    print("\n" + "="*80)
    print("Schema discovery complete!")
    print("="*80)

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
