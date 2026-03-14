from dotenv import load_dotenv
from autogen_ext.models.openai import AzureOpenAIChatCompletionClient

import os


load_dotenv()

Endpoint = os.getenv('AZURE_OPENAI_ENDPOINT')
Api_version = os.getenv('AZURE_OPENAI_API_VERSION')
Openai_model_name=os.getenv('AZURE_OPENAI_DEPLOYMENT_NAME')
Openai_deployment_name=os.getenv('AZURE_OPENAI_DEPLOYMENT_NAME')
Openai_api_key=os.getenv('AZURE_OPENAI_API_KEY')


# UAMI_CLIENT_ID=os.getenv('UAMI_CLIENT_ID')
# credential = ManagedIdentityCredential(client_id=UAMI_CLIENT_ID)
# def provider():
#     return credential.get_token("https://cognitiveservices.azure.com/.default").token  
def client():
    return AzureOpenAIChatCompletionClient(
        azure_deployment=Openai_deployment_name,
        model=Openai_model_name,
        api_version=Api_version,
        azure_endpoint=Endpoint,
        api_key=Openai_api_key,
        # reasoning_effect="minimal", # User requested this, but it might not be supported by all models? Keeping it as user added it. 
        # Actually, user added it manually. I should keep it.
        # But wait, does the library support it? If user added it, I'll keep it.
        model_capabilities={"vision": True, "function_calling": True, "json_output": True, "streaming": True}
    )