# FarmLink AI Service

AI Quality Grading Service for the FarmLink AI Platform.

## Overview

This service provides automated quality grading for agricultural products using rule-based image analysis. It's designed to work as part of the larger FarmLink AI ecosystem.

## Features

- **Rule-based Image Analysis**: Analyzes produce images using heuristics for brightness, sharpness, and resolution
- **Quality Grading**: Assigns Grade A/B/C ratings based on image quality
- **RESTful API**: Simple HTTP interface for integration
- **Twilio Integration**: Works with Twilio media URLs for WhatsApp image processing

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

## Installation

```bash
pip install -r requirements.txt
```

## Usage

```bash
python app.py
```

Or with Gunicorn (for production):

```bash
gunicorn -w 1 -b 0.0.0.0:5000 render:app
```

## Environment Variables

- `PORT`: Port to run the service on (default: 5000)
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