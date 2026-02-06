"""Quick schema lookup"""
import pyodbc
import os
from dotenv import load_dotenv

load_dotenv()

DB_SERVER = os.getenv("DB_SERVER")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")

CONNECTION_STRING = f"Driver={{ODBC Driver 17 for SQL Server}};Server={DB_SERVER};Database={DB_NAME};UID={DB_USER};PWD={DB_PASSWORD};Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;"

conn = pyodbc.connect(CONNECTION_STRING, timeout=30)
cursor = conn.cursor()

# Find all tables
cursor.execute("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE' ORDER BY TABLE_NAME")
tables = cursor.fetchall()

print("Looking for building-related tables...")
for table in tables:
    name = table[0].lower()
    if 'building' in name or 'area' in name or 'site' in name or ('d_' in name and ('equip' in name or 'ener' in name)):
        print(f"\nTable: {table[0]}")
        cursor.execute(f"SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '{table[0]}' ORDER BY ORDINAL_POSITION")
        cols = cursor.fetchall()
        for col in cols:
            print(f"  {col[0]:30} {col[1]}")

conn.close()
