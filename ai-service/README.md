# FarmLink AI Service

AI Quality Grading Service for the FarmLink AI Platform.

## Overview

This service provides automated quality grading for agricultural products using rule-based image analysis. It's designed to work as part of the larger FarmLink AI ecosystem.

## API Endpoints

### POST /grade
Grade produce quality from an image URL.

**Request:**
```json
{
  "image_url": "https://example.com/image.jpg",
  "product_name": "Tomato"
}
```

**Response:**
```json
{
  "grade": "Grade A",
  "score": 92.5,
  "confidence": 0.925,
  "product_name": "Tomato"
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "message": "AI Quality Grading Service is running",
  "model": "Rule-based system"
}
```

### GET /test
Test endpoint.

**Response:**
```json
{
  "message": "AI service is working!",
  "model": "Rule-based system",
  "endpoints": ["/health", "/grade", "/test"]
}
```

## Local development

```bash
pip install -r requirements.txt
python app.py
```

## Deploying on Render

- Root Directory: ai-service
- Build Command: pip install -r requirements.txt
- Start Command: gunicorn -w 1 -b 0.0.0.0:$PORT app:app
- Python version: Render may default to Python 3.13; wheels are pinned to support it. If you must pin, use runtime.txt (python-3.13.0).

Troubleshooting:
- If build fails on Pillow with source build logs, ensure you're using a Pillow version with wheels for your Python (we pin to 11.0.0 which has Py3.13 wheels).
- If Render ignores runtime.txt and still uses Py3.13, this config will still succeed.

## Environment Variables

- `PORT`: Port to run the service on (Render provides this)
- `TWILIO_ACCOUNT_SID`: Twilio Account SID (optional, for downloading Twilio media)
- `TWILIO_AUTH_TOKEN`: Twilio Auth Token (optional, for downloading Twilio media)

## Dependencies

- Flask
- Pillow
- Requests
- python-dotenv
- gunicorn

## License

MIT
