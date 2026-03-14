import os
import asyncio
from dotenv import load_dotenv
from openai import AzureOpenAI
import socket
from urllib.parse import urlparse

# Load .env file
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

async def check_endpoint(endpoint, api_key, api_version, deployment):
    print(f"Testing: {endpoint}")
    
    # DNS Check
    hostname = urlparse(endpoint).hostname
    try:
        socket.gethostbyname(hostname)
    except socket.gaierror:
        print(f"  ❌ DNS Lookup Failed for {hostname}")
        return False

    # Connection Check
    client = AzureOpenAI(
        azure_endpoint=endpoint,
        api_key=api_key,
        api_version=api_version
    )
    
    try:
        client.chat.completions.create(
            model=deployment,
            messages=[{"role": "user", "content": "Ping"}]
        )
        print(f"  ✅ SUCCESS! Connected to {endpoint}")
        return True
    except Exception as e:
        print(f"  ❌ Connection Failed: {e}")
        return False

async def main():
    api_key = os.getenv('AZURE_OPENAI_API_KEY')
    api_version = os.getenv('AZURE_OPENAI_API_VERSION')
    deployment = os.getenv('AZURE_OPENAI_DEPLOYMENT_NAME')
    
    base_names = [
        "sn-gradingsystem", 
        "gradingsystem",
        "automatedgrading",
        "aimcsqlteam01",
        "aimc-sql-team-01",
        "gpt4o-service",    
        "gpt4o-server",
        "gpt4o-app",
        "sn-openai",
        "aimc-openai",
        "grading-openai",
        "gpt-4-1-mini",
        "gpt4-1-mini",
        "gpt41mini",
        "gpt-4o-srvc",
        "gpt4osrvc"
    ]
    
    found = False
    for name in base_names:
        endpoint = f"https://{name}.openai.azure.com/"
        if await check_endpoint(endpoint, api_key, api_version, deployment):
            print(f"\n🎉 FOUND VALID ENDPOINT: {endpoint}")
            # Update .env file? No, just report for now.
            found = True
            break
            
    if not found:
        print("\n❌ Could not guess the correct endpoint.")

if __name__ == "__main__":
    asyncio.run(main())
