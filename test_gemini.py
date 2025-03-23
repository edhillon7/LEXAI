import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get the API key
api_key = os.environ.get('GEMINI_KEY')
print(f"API key exists: {bool(api_key)}")

# Configure the Gemini API
genai.configure(api_key=api_key)

# List available models
try:
    models = genai.list_models()
    print("Available models:")
    for model in models:
        print(f"- {model.name}")
    
    # Print the library version
    print(f"Google Generative AI library version: {genai.__version__}")
except Exception as e:
    print(f"Error listing models: {e}")

# Try to use the model
try:
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content("Say hello!")
    print(f"Model response: {response.text}")
except Exception as e:
    print(f"Error using model: {e}")