import os
import sys
import socket
from urllib.parse import urlparse
from dotenv import load_dotenv
from openai import AzureOpenAI

# Helpers
def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')

def get_env_path():
    return os.path.join(os.path.dirname(__file__), '.env')

def load_env():
    load_dotenv(get_env_path())

def update_env_variable(key, value):
    env_path = get_env_path()
    with open(env_path, 'r') as f:
        lines = f.readlines()
    
    new_lines = []
    found = False
    for line in lines:
        if line.strip().startswith(f"{key}="):
            new_lines.append(f'{key}="{value}"\n')
            found = True
        else:
            new_lines.append(line)
            
    if not found:
        new_lines.append(f'{key}="{value}"\n')
        
    with open(env_path, 'w') as f:
        f.writelines(new_lines)
    
    # Reload env
    os.environ[key] = value

def check_endpoint_validity(endpoint):
    try:
        hostname = urlparse(endpoint).hostname
        if not hostname:
            return False, "Invalid URL format"
        socket.gethostbyname(hostname)
        return True, "Valid DNS"
    except Exception as e:
        return False, f"DNS Lookup Failed: {e}"

def verify_connection():
    try:
        client = AzureOpenAI(
            azure_endpoint=os.getenv('AZURE_OPENAI_ENDPOINT'),
            api_key=os.getenv('AZURE_OPENAI_API_KEY'),
            api_version=os.getenv('AZURE_OPENAI_API_VERSION')
        )
        deployment = os.getenv('AZURE_OPENAI_DEPLOYMENT_NAME')
        
        print("\nVerifying connection to OpenAI...")
        client.chat.completions.create(
            model=deployment,
            messages=[{"role": "user", "content": "Ping"}]
        )
        return True, "Connection Successful!"
    except Exception as e:
        return False, str(e)

# Main Wizard
def run_wizard():
    print("=========================================")
    print("   Azure OpenAI Configuration Wizard     ")
    print("=========================================")
    
    load_env()
    current_endpoint = os.getenv('AZURE_OPENAI_ENDPOINT')
    print(f"\nCurrent Endpoint: {current_endpoint}")
    
    valid_dns, msg = check_endpoint_validity(current_endpoint)
    if not valid_dns:
        print(f"Status: ❌ Invalid ({msg})")
        print("\nThe current endpoint is unreachable. We need to fix this.")
    else:
        print(f"Status: ✅ Reachable (DNS OK)")
        
    print("\nPlease enter your Azure OpenAI Endpoint URL.")
    print("(You can find this in the Azure Portal under your OpenAI resource > Keys and Endpoint)")
    print("Example: https://my-resource-name.openai.azure.com/")
    
    while True:
        new_endpoint = input("\nEnter Endpoint URL (or 'q' to quit): ").strip()
        if new_endpoint.lower() == 'q':
            sys.exit()
            
        if not new_endpoint.startswith("http"):
            print("❌ URL must start with https://")
            continue
            
        valid, msg = check_endpoint_validity(new_endpoint)
        if valid:
            print("✅ DNS check passed!")
            break
        else:
            print(f"❌ Could not resolve hostname: {msg}")
            retry = input("Try specific resource name instead? (e.g. 'my-resource' -> 'https://my-resource.openai.azure.com/') [y/n]: ")
            if retry.lower() == 'y':
                res_name = input("Resource Name: ").strip()
                new_endpoint = f"https://{res_name}.openai.azure.com/"
                valid, msg = check_endpoint_validity(new_endpoint)
                if valid:
                    print(f"✅ Constructed valid URL: {new_endpoint}")
                    break
                else:
                    print(f"❌ Still invalid: {new_endpoint}")

    # Update .env
    update_env_variable("AZURE_OPENAI_ENDPOINT", new_endpoint)
    print("\n✅ Updated .env file.")
    
    # Verify
    success, msg = verify_connection()
    if success:
        print(f"\n🎉 {msg}")
        print("You are all set! Please restart your server now.")
    else:
        print(f"\n❌ Connection failed even with valid DNS: {msg}")
        print("Please check your API Key and Deployment Name.")

if __name__ == "__main__":
    run_wizard()
