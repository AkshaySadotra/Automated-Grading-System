import pyodbc, os, json
from dotenv import load_dotenv
load_dotenv()
server = os.getenv("SERVER")
database = os.getenv("DATABASE")
conn = pyodbc.connect(
    f"Driver={{ODBC Driver 17 for SQL Server}};"
    f"Server={server};Database={database};Trusted_Connection=yes;"
)
cursor = conn.cursor()

# Test the exact query from run.py
cursor.execute("""
    SELECT 
        a.FolderId,
        a.FolderName,
        a.UploadedAt,
        a.studyMaterialid,
        a.Response,
        s.FolderName AS StudyFolderName
    FROM [AutomatedGrading].[dbo].[AssignmentsFolderUploads] a
    LEFT JOIN [AutomatedGrading].[dbo].[StudyMaterialFolderUploads] s 
        ON UPPER(a.studyMaterialid) = UPPER(CAST(s.FolderId AS NVARCHAR(250)))
    ORDER BY a.UploadedAt DESC
""")

rows = cursor.fetchall()
print(f"Total rows returned: {len(rows)}")
for r in rows:
    print(f"  {r[1]} | StudyFolder: {r[5]} | studyMatId: {r[3]}")

cursor.close()
conn.close()
