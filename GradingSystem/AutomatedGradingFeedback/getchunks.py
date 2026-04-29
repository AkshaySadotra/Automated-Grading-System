from azure.search.documents import SearchClient 
from azure.core.credentials import AzureKeyCredential
import os 

searchendpoint = os.getenv("SEARCH_ENDPOINT") 
search_key = os.getenv("SEARCH_API_KEY")
indexname = os.getenv("INDEX_NAME") 
credential = AzureKeyCredential(search_key) 

def _fetch_chunks(file_names: list[str]):
    """Helper: fetch chunks for a list of files from Azure Cognitive Search."""
    if not file_names:
        return []

    client = SearchClient(endpoint=searchendpoint, index_name=indexname, credential=credential)

    # Normalize filenames: Ensure they have .pdf extension to match Index
    normalized_names = []
    for name in file_names:
        if not name.lower().endswith('.pdf'):
            normalized_names.append(f"{name}.pdf")
        else:
            normalized_names.append(name)
            
    file_names_str = ",".join(normalized_names)  
    filter_expr = f"search.in(title, '{file_names_str}', ',')"
    
    print(f"DEBUG: Input filenames: {file_names}")
    print(f"DEBUG: Normalized for Search: {normalized_names}")
    print(f"DEBUG: Filter Expression: {filter_expr}")

    results = client.search(
        search_text="*",
        select=["chunk_text", "title"],
        filter=filter_expr,
        include_total_count=True
    )
    
    count = results.get_count()
    print(f"DEBUG: Found {count} matches.")

    if count == 0:
        print("DEBUG: No matches found. Checking what IS in the index...")
        diagnostic_results = client.search(search_text="*", select=["title"], top=5)
        print("DEBUG: Sample 'title' values in index:")
        for r in diagnostic_results:
            print(f"   - {r.get('title', 'MISSING FIELD')}")

    chunks = []
    for result in results:
        if "chunk_text" in result:
            chunks.append(result["chunk_text"])
    return chunks


def get_chunks(StudyFiles: list[str], AssignmentFiles: list[str]):
    """
    Fetch chunks separately for study files and assignment files in one call.
    """
    study_chunks = _fetch_chunks(StudyFiles) if StudyFiles else []
    assignment_chunks = _fetch_chunks(AssignmentFiles) if AssignmentFiles else []

    return {
        "StudyChunks": study_chunks,
        "AssignmentChunks": assignment_chunks
    }