"""
Firebase configuration for LexAI application.
This module initializes Firebase services and provides helper functions.
"""

import os
import json
from firebase_admin import credentials, initialize_app, firestore, auth, storage

# Firebase configuration
firebase_config = {
    "apiKey": "AIzaSyB6d6Guvapg7UZjMWCenUolKT0Kf_UXh0A",
    "authDomain": "lexai-1e745.firebaseapp.com",
    "databaseURL": "https://lexai-1e745-default-rtdb.asia-southeast1.firebasedatabase.app",
    "projectId": "lexai-1e745",
    "storageBucket": "lexai-1e745.firebasestorage.app",
    "messagingSenderId": "307364280189",
    "appId": "1:307364280189:web:ee2688482a912d09673e14",
    "measurementId": "G-WZ3PJ6JHVE"
}

def initialize_firebase():
    """Initialize Firebase services for the application."""
    try:
        # Check if we have a service account key file
        if os.path.exists('serviceAccountKey.json'):
            cred = credentials.Certificate('serviceAccountKey.json')
        else:
            # If no file exists, we'll create one from attached_assets if available
            if os.path.exists('attached_assets/serviceAccountKey.json'):
                with open('attached_assets/serviceAccountKey.json', 'r') as f:
                    service_account = json.load(f)
                cred = credentials.Certificate(service_account)
            else:
                # Use application default credentials
                cred = credentials.ApplicationDefault()
        
        # Initialize Firebase app
        firebase_app = initialize_app(cred, {
            'storageBucket': firebase_config['storageBucket'],
            'databaseURL': firebase_config['databaseURL']
        })

        # Initialize Firestore
        db = firestore.client()
        
        # Initialize Storage
        bucket = storage.bucket()
        
        print("Firebase initialized successfully")
        return firebase_app, db, bucket
    except Exception as e:
        print(f"Error initializing Firebase: {e}")
        return None, None, None

# Get Firebase instances
firebase_app, db, bucket = initialize_firebase()

def get_firestore_db():
    """Get Firestore database instance."""
    return db

def get_storage_bucket():
    """Get Firebase Storage bucket instance."""
    return bucket

def get_firebase_auth():
    """Get Firebase Auth instance."""
    return auth