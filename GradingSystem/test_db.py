import pyodbc
import os
from dotenv import load_dotenv

load_dotenv()
server = os.getenv('SERVER')
database = os.getenv('DATABASE')

conn = pyodbc.connect(f'Driver={{ODBC Driver 17 for SQL Server}};Server={server};Database={database};Trusted_Connection=yes;')
cursor = conn.cursor()
cursor.execute("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'")
for row in cursor.fetchall():
    print(row[0])
