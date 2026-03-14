import os
import zipfile
import uuid
import tempfile
import pyodbc
from werkzeug.utils import secure_filename
from azure.storage.blob import BlobServiceClient
from azure.core.credentials import AzureKeyCredential
from azure.search.documents.indexes import SearchIndexerClient
import requests

def process_uploaded_zip(file_obj, upload_type, study_material_id=None):
    """
    Extracts ZIP, uploads to Blob Storage, inserts into SQL Server, and triggers Indexer.
    upload_type: 'StudyMaterial' or 'Assignments'
    study_material_id: Optional UUID string linking an assignment to its study material
    Returns: FolderId (UUID string)
    """
    # 1. Setup paths and UUID
    folder_id_uuid = uuid.uuid4()
    folder_id = str(folder_id_uuid)
    original_filename = secure_filename(file_obj.filename)
    
    # Create a temporary directory to extract files
    temp_dir = tempfile.mkdtemp()
    zip_path = os.path.join(temp_dir, original_filename)
    file_obj.save(zip_path)
    
    extracted_files = []
    try:
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(temp_dir)
            
            # List all extracted PDF/Word/txt files (ignoring __MACOSX or hidden)
            for root, dirs, files in os.walk(temp_dir):
                for file in files:
                    if file.startswith('._') or '__MACOSX' in root:
                        continue
                    if file.endswith('.zip'):
                        continue
                    extracted_files.append({
                        "filename": file,
                        "filepath": os.path.join(root, file)
                    })
    except zipfile.BadZipFile:
        return None, "Invalid ZIP file."

    # 2. Upload to Azure Blob Storage
    blob_conn_str = os.getenv('AZURE_STORAGE_CONNECTION_STRING')
    container_name = os.getenv('BLOB_CONTAINER_NAME')
    
    if blob_conn_str and container_name:
        try:
            blob_service_client = BlobServiceClient.from_connection_string(blob_conn_str)
            container_client = blob_service_client.get_container_client(container_name)
            
            # If container doesn't exist, this might fail, assume it exists or handle it
            if not container_client.exists():
                container_client.create_container()

            for ef in extracted_files:
                # Use a specific blob name to prevent collisions, e.g., folder_id/filename
                blob_name = f"{folder_id}/{ef['filename']}"
                blob_client = blob_service_client.get_blob_client(container=container_name, blob=blob_name)
                
                with open(ef['filepath'], "rb") as data:
                    blob_client.upload_blob(data, overwrite=True)
                
                # We could save the blob URL, but current schema just says FileBlobUrl, mostly filename is used
                ef['blob_url'] = blob_client.url
                
        except Exception as e:
            print(f"Error uploading to Blob Storage: {e}")
            # Proceeding anyway just to get metadata in SQL if required, or we could fail here.

    # 3. Store in SQL Server
    server = os.getenv('SERVER')
    database = os.getenv('DATABASE')
    
    try:
        conn = pyodbc.connect(
            f"Driver={{ODBC Driver 17 for SQL Server}};"
            f"Server={server};Database={database};Trusted_Connection=yes;"
        )
        cursor = conn.cursor()
        
        # Insert parent record
        if upload_type == 'StudyMaterial':
            folder_insert_query = """
                INSERT INTO [AutomatedGrading].[dbo].[StudyMaterialFolderUploads] 
                (FolderId, FolderName, BlobUrl, IsProcessed, UploadedAt, subject)
                VALUES (?, ?, ?, ?, GETDATE(), ?)
            """
            cursor.execute(folder_insert_query, (folder_id, original_filename, "", 0, "Uploaded via API"))
            
            # Insert child records
            file_insert_query = """
                INSERT INTO [AutomatedGrading].[dbo].[StudyMaterialContainedFiles]
                (FolderId, FileName, FileBlobUrl)
                VALUES (?, ?, ?)
            """
            for ef in extracted_files:
                cursor.execute(file_insert_query, (folder_id, ef['filename'], ef.get('blob_url', '')))
                
        elif upload_type == 'Assignments':
            folder_insert_query = """
                INSERT INTO [AutomatedGrading].[dbo].[AssignmentsFolderUploads] 
                (FolderId, FolderName, BlobUrl, IsProcessed, UploadedAt, studyMaterialid)
                VALUES (?, ?, ?, ?, GETDATE(), ?)
            """
            cursor.execute(folder_insert_query, (folder_id, original_filename, "", 0, study_material_id))
            
            # Insert child records
            file_insert_query = """
                INSERT INTO [AutomatedGrading].[dbo].[AssignmentsContainedFiles]
                (FolderId, FileName, FileBlobUrl)
                VALUES (?, ?, ?)
            """
            for ef in extracted_files:
                cursor.execute(file_insert_query, (folder_id, ef['filename'], ef.get('blob_url', '')))
                
        cursor.commit()
    except Exception as e:
        print(f"Database error: {e}")
        return None, f"Database error: {e}"
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

    # 4. Trigger Azure Cognitive Search Indexer
    indexer_name = os.getenv('SEARCH_INDEXER_NAME')
    search_endpoint = os.getenv('SEARCH_ENDPOINT')
    search_api_key = os.getenv('SEARCH_API_KEY')
    
    if indexer_name and search_endpoint and search_api_key:
        try:
            url = f"{search_endpoint}/indexers('{indexer_name}')/search.run?api-version=2024-05-01-preview"
            headers = {
                'Content-Type': 'application/json',
                'api-key': search_api_key
            }
            response = requests.post(url, headers=headers)
            if response.status_code not in (202, 204):
                print(f"Failed to trigger indexer: {response.text}")
        except Exception as e:
            print(f"Error triggering indexer: {e}")

    # Clean up temp files (optional, OS will eventually clean up temp, but good practice)
    import shutil
    try:
        shutil.rmtree(temp_dir)
    except:
        pass

    return folder_id, None

