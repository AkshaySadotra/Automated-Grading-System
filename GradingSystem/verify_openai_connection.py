import os
from dotenv import load_dotenv
from openai import AzureOpenAI

# Load .env file
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

def verify_openai():
    endpoint = os.getenv('AZURE_OPENAI_ENDPOINT')
    api_key = os.getenv('AZURE_OPENAI_API_KEY')
    deployment = os.getenv('AZURE_OPENAI_DEPLOYMENT_NAME')
    api_version = os.getenv('AZURE_OPENAI_API_VERSION')

    print(f"Endpoint: {endpoint}")
    print(f"Deployment: {deployment}")
    print(f"API Version: {api_version}")
    
    if not endpoint or not api_key:
        print("❌ Error: Missing Endpoint or API Key in environment variables.")
        return

    client = AzureOpenAI(
        azure_endpoint=endpoint,
        api_key=api_key,
        api_version=api_version
    )

    try:
        print("Sending test request to Azure OpenAI...")
        response = client.chat.completions.create(
            model=deployment,
            messages=[{"role": "user", "content": "Hello, are you working?"}]
        )
        print("\n✅ OpenAI Connection Successful!")
        print(f"Response: {response.choices[0].message.content}")
    except Exception as e:
        print("\n❌ OpenAI Connection Failed!")
        print(f"Error: {e}")

if __name__ == "__main__":
    verify_openai()
