import pyodbc
import os
from dotenv import load_dotenv

load_dotenv()
server = os.getenv('SERVER')
database = os.getenv('DATABASE')

conn = pyodbc.connect(f'Driver={{ODBC Driver 17 for SQL Server}};Server={server};Database={database};Trusted_Connection=yes;')
cursor = conn.cursor()
cursor.execute("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Feedback'")
for row in cursor.fetchall():
    print(f"{row[0]}: {row[1]}")
