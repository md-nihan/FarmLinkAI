"""
Render-specific entry point for the AI service.
This file is used by Render to run the Python service with Gunicorn.
"""

from app import app

if __name__ == "__main__":
    app.run()