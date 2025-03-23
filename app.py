import os
import logging
from flask import Flask
from dotenv import load_dotenv
from routes.api import api_bp
from routes.views import views_bp

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Create the Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "lex-ai-secret-key")

# Register blueprints
app.register_blueprint(api_bp)
app.register_blueprint(views_bp)

# Import config settings
from config import configure_app
configure_app(app)

# Initialize Firebase services
try:
    from firebase_config import firebase_app, db, bucket
    if firebase_app:
        logger.info("Firebase initialized successfully in app.py")
        # Add Firebase instances to app config for access in routes
        app.config['FIREBASE_APP'] = firebase_app
        app.config['FIRESTORE_DB'] = db
        app.config['FIREBASE_STORAGE'] = bucket
    else:
        logger.warning("Firebase initialization failed")
except Exception as e:
    logger.error(f"Error setting up Firebase: {e}")
