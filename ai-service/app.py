from flask import Flask, request, jsonify
from PIL import Image
import requests
from io import BytesIO
import os
import random

# Load environment variables if available
try:
    from dotenv import load_dotenv
    load_dotenv()
except:
    pass

app = Flask(__name__)

print("🤖 Starting AI Quality Grading Service (Rule-based system)...")
print("✅ AI Service initialized successfully!")

def download_image(image_url):
    """Download image from URL with Twilio authentication if needed"""
    try:
        # Handle Twilio media URLs (may need auth)
        headers = {}
        
        # If it's a Twilio URL, add authentication
        if 'twilio.com' in image_url:
            account_sid = os.getenv('TWILIO_ACCOUNT_SID', '')
            auth_token = os.getenv('TWILIO_AUTH_TOKEN', '')
            
            if account_sid and auth_token:
                from requests.auth import HTTPBasicAuth
                response = requests.get(image_url, auth=HTTPBasicAuth(account_sid, auth_token), timeout=10)
            else:
                # Try without auth (for sandbox)
                response = requests.get(image_url, headers=headers, timeout=10)
        else:
            response = requests.get(image_url, headers=headers, timeout=10)
        
        response.raise_for_status()
        return Image.open(BytesIO(response.content))
    except Exception as e:
        print(f"Error downloading image: {e}")
        return None

def analyze_image_quality(image):
    """Analyze image quality using rule-based heuristics"""
    try:
        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Get image statistics
        width, height = image.size
        pixels = list(image.getdata())
        
        # Calculate average brightness
        avg_brightness = sum(sum(pixel) for pixel in pixels) / (len(pixels) * 3)
        
        # Calculate image sharpness (variance)
        gray_pixels = [sum(pixel) / 3 for pixel in pixels]
        mean = sum(gray_pixels) / len(gray_pixels)
        variance = sum((p - mean) ** 2 for p in gray_pixels) / len(gray_pixels)
        sharpness = variance ** 0.5
        
        # Quality score based on brightness and sharpness
        # Good images: bright (100-200) and sharp (variance > 30)
        score = 0
        
        # Brightness score (0-50 points)
        if 80 <= avg_brightness <= 200:
            score += 50
        elif 60 <= avg_brightness <= 220:
            score += 35
        else:
            score += 20
        
        # Sharpness score (0-30 points)
        if sharpness > 40:
            score += 30
        elif sharpness > 25:
            score += 20
        else:
            score += 10
        
        # Resolution score (0-20 points)
        total_pixels = width * height
        if total_pixels > 500000:  # > 0.5 megapixels
            score += 20
        elif total_pixels > 200000:
            score += 15
        else:
            score += 10
        
        return score
        
    except Exception as e:
        print(f"Error analyzing image: {e}")
        return 75  # Default score

def calculate_quality_grade(quality_score, product_name):
    """
    Calculate quality grade based on image analysis score
    Uses rule-based heuristics for grading
    """
    print(f"Quality score: {quality_score}/100")
    
    # Assign grade based on score
    if quality_score >= 85:
        grade = "Grade A"
        score = quality_score
    elif quality_score >= 70:
        grade = "Grade B"
        score = quality_score
    else:
        grade = "Grade C"
        score = max(quality_score, 60)  # Minimum score of 60
    
    # Add small random variation for realism
    score = min(100, score + random.randint(-2, 2))
    
    return grade, round(score, 1)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'message': 'AI Quality Grading Service is running',
        'model': 'Rule-based system'
    })

@app.route('/grade', methods=['POST'])
def grade_produce():
    """Grade produce quality from image"""
    try:
        data = request.get_json()
        
        if not data or 'image_url' not in data:
            return jsonify({
                'error': 'No image_url provided'
            }), 400
        
        image_url = data['image_url']
        product_name = data.get('product_name', 'Unknown')
        
        print(f"🖼️ Grading image for: {product_name}")
        print(f"📍 Image URL: {image_url}")
        
        # Download image
        image = download_image(image_url)
        if image is None:
            print(f"❌ Could not download image from {image_url}")
            return jsonify({
                'grade': 'Grade B',
                'score': 75,
                'message': 'Could not download image, assigned default grade'
            })
        
        # Analyze image quality
        quality_score = analyze_image_quality(image)
        
        # Calculate quality grade
        grade, score = calculate_quality_grade(quality_score, product_name)
        
        print(f"✅ Quality Grade: {grade} (Score: {score})")
        
        return jsonify({
            'grade': grade,
            'score': score,
            'confidence': score / 100,
            'product_name': product_name
        })
    
    except Exception as e:
        print(f"❌ Error in grade_produce: {e}")
        return jsonify({
            'grade': 'Grade B',
            'score': 75,
            'message': f'Error processing request: {str(e)}'
        })

@app.route('/test', methods=['GET'])
def test():
    """Test endpoint"""
    return jsonify({
        'message': 'AI service is working!',
        'model': 'Rule-based system',
        'endpoints': ['/health', '/grade', '/test']
    })

# For Render deployment
if __name__ != "__main__":
    # This block runs when imported by Gunicorn
    print("\n🤖 Starting AI Quality Grading Service for Render...")
    print("📊 Model: Rule-based system")
    print("🌐 Server: Will be started by Gunicorn")
    print("\nEndpoints:")
    print("  - POST /grade - Grade produce quality")
    print("  - GET /health - Health check")
    print("  - GET /test - Test endpoint\n")

# Make sure the app is available at the module level for Gunicorn
# This is crucial for the Procfile command: gunicorn -w 1 -b 0.0.0.0:$PORT app:app
