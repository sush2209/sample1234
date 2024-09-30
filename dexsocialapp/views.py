import logging
from django.http import JsonResponse, HttpResponse
from django.views.decorators.http import require_http_methods
from django.shortcuts import render, redirect
from .models import PricingTier, PaymentRecord
from django.utils import timezone
import requests, json, os
from django.conf import settings
from PIL import Image, ImageDraw, ImageFont

# Set up logging
logger = logging.getLogger(__name__)

JSON_FILE_PATH = 'active_payment_data.json'

def load_active_payment_data():
    print("Attempting to load active payment data")
    if os.path.exists(JSON_FILE_PATH):
        try:
            with open(JSON_FILE_PATH, 'r') as file:
                data = json.load(file)
            print("Successfully loaded active payment data")
            return data
        except json.JSONDecodeError:
            print("Error decoding JSON file")
            return []
    else:
        print("JSON file not found")
        return []

def home(request):
    print("Home view accessed")
    active_data = load_active_payment_data()
    return render(request, 'index.html', {
        'trending_data': active_data,
    })

@require_http_methods(["POST"])
def confirmation(request):
    print("Confirmation view accessed")
    contract_address = request.POST.get('address')
    option_id = request.POST.get('option')
    print(f"Received data - Address: {contract_address}, Option ID: {option_id}")
    
    try:
        selected_option = PricingTier.objects.get(id=option_id)
        print(f"Selected option: {selected_option}")
        
        payment_record = PaymentRecord.objects.create(
            contract_address=contract_address,
            duration=selected_option.duration,
            timestamp=timezone.now(),
            active=True
        )
        print(f"Payment record created: {payment_record}")
        
        return HttpResponse(status=200)
    except PricingTier.DoesNotExist:
        print("PricingTier does not exist")
        return HttpResponse("Selected pricing tier does not exist.", status=400)
    except Exception as e:
        print(f"Error in confirmation view: {str(e)}")
        logger.error(f"Error in confirmation view: {str(e)}", exc_info=True)
        return HttpResponse("An error occurred while processing the request.", status=500)

def get_or_generate_og_image(request):
    print("get_or_generate_og_image view accessed")
    try:
        token_info = json.loads(request.body)['tokenInfo']
        print(f"Received token info: {token_info}")
        
        image_filename = f"og_image_{token_info['address']}.png"
        image_path = os.path.join(settings.MEDIA_ROOT, 'og_images', image_filename)
        print(f"Image path: {image_path}")
        
        if os.path.exists(image_path):
            print("Image already exists, returning URL")
            return JsonResponse({'image_url': f"{settings.MEDIA_URL}og_images/{image_filename}"})
        else:
            print("Generating new image")
            generate_og_image(token_info, image_path)
            return JsonResponse({'image_url': f"{settings.MEDIA_URL}og_images/{image_filename}"})
    except json.JSONDecodeError:
        print("Error decoding JSON from request body")
        return JsonResponse({'error': 'Invalid JSON in request body'}, status=400)
    except KeyError:
        print("Missing 'tokenInfo' in request body")
        return JsonResponse({'error': 'Missing tokenInfo in request body'}, status=400)
    except Exception as e:
        print(f"Error in get_or_generate_og_image: {str(e)}")
        logger.error(f"Error in get_or_generate_og_image: {str(e)}", exc_info=True)
        return JsonResponse({'error': str(e)}, status=500)

def generate_og_image(token_info, image_path):
    print(f"Generating OG image for {token_info['address']}")
    try:
        img = Image.new('RGB', (1200, 630), color = (26, 26, 26))
        d = ImageDraw.Draw(img)
        
        # Try to use a system font instead of a specific file
        try:
            font = ImageFont.truetype("arial.ttf", 36)
        except IOError:
            print("Arial font not found, using default font")
            font = ImageFont.load_default()
        
        d.text((50,50), "Dexsocial", font=font, fill=(255,255,255))
        d.text((50,100), f"Token: {token_info['name']}", font=font, fill=(255,255,255))
        d.text((50,150), f"Symbol: ${token_info['symbol']}", font=font, fill=(255,255,255))
        d.text((50,200), f"Address: {token_info['address']}", font=font, fill=(255,255,255))
        d.text((50,250), "Dexscreener Token Enhancement", font=font, fill=(255,255,255))
        d.text((50,300), "Paid for Symbol on Chain", font=font, fill=(255,255,255))
        
        print(f"Ensuring directory exists: {os.path.dirname(image_path)}")
        os.makedirs(os.path.dirname(image_path), exist_ok=True)
        
        print(f"Saving image to {image_path}")
        img.save(image_path)
        print("Image saved successfully")
    except Exception as e:
        print(f"Error generating OG image: {str(e)}")
        logger.error(f"Error generating OG image: {str(e)}", exc_info=True)
        raise
