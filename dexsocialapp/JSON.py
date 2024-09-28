from django.conf import settings
import os,json,requests
from .models import PaymentRecord
from django.http import JsonResponse

JSON_FILE_PATH = 'active_payment_data.json'

def format_market_cap(market_cap):
    if market_cap is None:
        return "N/A"
    if market_cap >= 1000000000:  # Billion
        return f"${market_cap / 1000000000:.1f}B"
    elif market_cap >= 1000000:  # Million
        return f"${market_cap / 1000000:.1f}M"
    elif market_cap >= 1000:  # Thousand
        return f"${market_cap / 1000:.1f}K"
    else:
        return f"${market_cap:.1f}"

def fetch_token_data(contract_address):
    api_url = f"https://frontend-api.pump.fun/coins/{contract_address}"
    try:
        response = requests.get(api_url)
        response.raise_for_status()
        data = response.json()
        
        processed_data = {
            "mint": data.get("mint"),
            "name": data.get("name"),
            "symbol": data.get("symbol"),
            "image_uri": data.get("image_uri"),
            "telegram": data.get("telegram"),
            "website": data.get("website"),
            "twitter": data.get("twitter"),
            "market_cap": format_market_cap(data.get("usd_market_cap"))
        }
        
        return processed_data
    
    except requests.RequestException as e:
        print(f"Error fetching data for {contract_address}: {e}")
        return None

def generate_active_payment_data(request):
    active_records = PaymentRecord.objects.filter(active=True)
    data = []

    # Fetch token data for each active contract address
    for record in active_records:
        contract_address = record.contract_address
        token_data = fetch_token_data(contract_address)
        
        if token_data:
            data.append(token_data)

    # Save the fetched data to a JSON file
    with open(JSON_FILE_PATH, 'w') as file:
        json.dump(data, file, indent=4)

    return JsonResponse({"success": "done"})