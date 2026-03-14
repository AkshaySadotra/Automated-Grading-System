import pyodbc, os
from dotenv import load_dotenv
load_dotenv()
server = os.getenv("SERVER")
database = os.getenv("DATABASE")
conn = pyodbc.connect(
    f"Driver={{ODBC Driver 17 for SQL Server}};"
    f"Server={server};Database={database};Trusted_Connection=yes;"
)
cursor = conn.cursor()
cursor.execute("SELECT FolderName, LEFT(Response, 100) FROM [AutomatedGrading].[dbo].[AssignmentsFolderUploads]")
for r in cursor.fetchall():
    resp = r[1][:80] if r[1] else "NULL"
    print(f"{r[0]} | Response: {resp}")
cursor.close()
conn.close()
