import pyodbc
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def verify_connection():
    server = os.getenv('SERVER')
    database = os.getenv('DATABASE')
    
    print(f"Attempting to connect to:")
    print(f"Server: {server}")
    print(f"Database: {database}")
    print("Authentication: Windows Authentication (Trusted Connection)")

    try:
        # Establishing Connection with SQL Server using Windows Authentication
        connection = pyodbc.connect(
            f"Driver={{ODBC Driver 17 for SQL Server}};"
            f"Server={server};Database={database};Trusted_Connection=yes;"
        )
        print("\n✅ Connection Successful!")
        
        cursor = connection.cursor()
        cursor.execute("SELECT @@VERSION")
        row = cursor.fetchone()
        print(f"SQL Server Version: {row[0]}")
        
        cursor.close()
        connection.close()
        
    except Exception as e:
        print("\n❌ Connection Failed!")
        print(f"Error: {e}")

if __name__ == "__main__":
    verify_connection()
