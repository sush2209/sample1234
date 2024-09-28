from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from .models import TokenInfo, PricingTier
from django.core.exceptions import ObjectDoesNotExist
from django.core.cache import caches
from django.db import IntegrityError
import requests

@require_http_methods(["POST"])
def check_paid_status_api(request):
    address = request.POST.get('address')
    if not address:
        return JsonResponse({'error': 'Address is required'}, status=400)

    try:
        token_data = TokenInfo.objects.get(address=address)
        return JsonResponse({
            'paid': True,
            'token_info': token_data_to_dict(token_data)
        })
    except ObjectDoesNotExist:
        pass

    try:
        is_paid = check_payment_status(address)
        if not is_paid:
            return JsonResponse({'paid': False})

        token_info = fetch_and_save_token_info(address)
        return JsonResponse({
            'paid': True,
            'token_info': token_data_to_dict(token_info)
        })
    except requests.RequestException as e:
        return JsonResponse({'error': f'Error checking payment status or fetching token data: {str(e)}'}, status=500)
    except Exception as e:
        return JsonResponse({'error': f'Unexpected error: {str(e)}'}, status=500)

def check_payment_status(address):
    dex_api_url = f"https://api.dexscreener.com/v1/orders/solana/{address}"
    try:
        response = requests.get(dex_api_url, timeout=5)
        response.raise_for_status()
        dex_data = response.json()
        return dex_data[0].get('status') == 'approved' if isinstance(dex_data, list) and dex_data else False
    except requests.RequestException as e:
        raise

def fetch_and_save_token_info(address):
    api_url = f"https://frontend-api.pump.fun/coins/{address}"
    try:
        response = requests.get(api_url)
        response.raise_for_status()
        data = response.json()

        def clean_url(url):
            if url:
                return url.replace("https://", "").replace("http://", "").replace("t.me/", "").replace("x.com/", "")
            return ""

        token_info = TokenInfo(
            symbol=data.get('symbol', 'N/A'),
            name=data.get('name', 'N/A'),
            address=address,
            website=clean_url(data.get('website')),
            telegram=clean_url(data.get('telegram')),
            twitter=clean_url(data.get('twitter')),
            image_url=data.get('image_uri', '')
        )
        
        try:
            token_info.save()
        except IntegrityError:
            token_info = TokenInfo.objects.get(address=address)
        
        return token_info
    except requests.RequestException as e:
        raise
    except Exception as e:
        raise

def token_data_to_dict(token_data):
    return {
        'name': token_data.name,
        'symbol': token_data.symbol,
        'address': token_data.address,
        'website': token_data.website,
        'telegram': token_data.telegram,
        'twitter': token_data.twitter,
        'image_url': token_data.image_url
    }

def pricing_tiers_api(request):
    pricing_tiers = PricingTier.objects.all().values('id', 'current_price', 'old_price', 'duration')
    return JsonResponse({'tiers': list(pricing_tiers)}, safe=False)

def recent_searches_api(request):
    search_cache = caches['search_history']
    recent_searches = list(search_cache.keys('*'))
    recent_searches = recent_searches[:10]
    return JsonResponse({'searches': recent_searches})
