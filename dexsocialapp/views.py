from django.http import JsonResponse, HttpResponse
from django.views.decorators.http import require_http_methods
from django.shortcuts import render, redirect
from .models import PricingTier, PaymentRecord
from django.utils import timezone
import requests, json, os
from django.conf import settings
from PIL import Image, ImageDraw, ImageFont

JSON_FILE_PATH = 'active_payment_data.json'

def load_active_payment_data():
    if os.path.exists(JSON_FILE_PATH):
        try:
            with open(JSON_FILE_PATH, 'r') as file:
                data = json.load(file)
            return data
        except json.JSONDecodeError:
            return []
    else:
        return []

def home(request):
    active_data = load_active_payment_data()
    return render(request, 'index.html', {
        'trending_data': active_data,
    })

@require_http_methods(["POST"])
def confirmation(request):
    contract_address = request.POST.get('address')
    option_id = request.POST.get('option')
    
    try:
        selected_option = PricingTier.objects.get(id=option_id)
        
        payment_record = PaymentRecord.objects.create(
            contract_address=contract_address,
            duration=selected_option.duration,
            timestamp=timezone.now(),
            active=True
        )
        
        return HttpResponse(status=200)
    except PricingTier.DoesNotExist:
        return HttpResponse("Selected pricing tier does not exist.", status=400)
    except Exception as e:
        return HttpResponse("An error occurred while processing the request.", status=500)

def get_or_generate_og_image(request):
    try:
        token_info = json.loads(request.body)['tokenInfo']
        
        image_filename = f"og_image_{token_info['address']}.png"
        image_path = os.path.join(settings.MEDIA_ROOT, 'og_images', image_filename)
        
        if os.path.exists(image_path):
            return JsonResponse({'image_url': f"{settings.MEDIA_URL}og_images/{image_filename}"})
        else:
            generate_og_image(token_info, image_path)
            return JsonResponse({'image_url': f"{settings.MEDIA_URL}og_images/{image_filename}"})
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON in request body'}, status=400)
    except KeyError:
        return JsonResponse({'error': 'Missing tokenInfo in request body'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def generate_og_image(token_info, image_path):
    try:
        img = Image.new('RGB', (1200, 630), color = (26, 26, 26))
        d = ImageDraw.Draw(img)
        
        try:
            font = ImageFont.truetype("arial.ttf", 36)
        except IOError:
            font = ImageFont.load_default()
        
        d.text((50,50), "Dexsocial", font=font, fill=(255,255,255))
        d.text((50,100), f"Token: {token_info['name']}", font=font, fill=(255,255,255))
        d.text((50,150), f"Symbol: ${token_info['symbol']}", font=font, fill=(255,255,255))
        d.text((50,200), f"Address: {token_info['address']}", font=font, fill=(255,255,255))
        d.text((50,250), "Dexscreener Token Enhancement", font=font, fill=(255,255,255))
        d.text((50,300), "Paid for Symbol on Chain", font=font, fill=(255,255,255))
        
        os.makedirs(os.path.dirname(image_path), exist_ok=True)
        
        img.save(image_path)
    except Exception as e:
        raise
