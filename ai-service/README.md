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
- Python version: set via runtime.txt (python-3.10.13)

Troubleshooting:
- If build fails on Pillow/numpy, ensure the Python version matches runtime.txt and that Render is using a compatible version.
- Logs mentioning "No matching distribution" usually indicate an incompatible Python version; redeploy after updating runtime.txt.

## Environment Variables

- `PORT`: Port to run the service on (Render provides this)
- `TWILIO_ACCOUNT_SID`: Twilio Account SID (optional, for downloading Twilio media)
- `TWILIO_AUTH_TOKEN`: Twilio Auth Token (optional, for downloading Twilio media)

## Dependencies

- Flask
- Pillow
- Requests
- python-dotenv
- numpy
- gunicorn

## License

MIT
