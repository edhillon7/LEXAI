import os
import logging

def configure_app(app):
    """Configure Flask application with environment settings."""
    # API keys and credentials
    gemini_key = os.environ.get('GEMINI_KEY', 'AIzaSyADQ47rBpvWfsQvZswBEtPNPbYGVxjqlDc')
    
    if gemini_key:
        app.logger.info(f"GEMINI_KEY loaded: {gemini_key[:5]}...")
    else:
        app.logger.error("GEMINI_KEY not found in environment")
    
    # Set both config keys to ensure compatibility
    app.config['GEMINI_API_KEY'] = gemini_key
    app.config['GEMINI_KEY'] = gemini_key
    
    # File upload configurations
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
    app.config['UPLOAD_FOLDER'] = 'uploads'
    app.config['ALLOWED_EXTENSIONS'] = {'txt', 'pdf', 'doc', 'docx', 'rtf'}
    
    # Ensure upload directory exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
