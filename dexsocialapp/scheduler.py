from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
from django.utils import timezone
from django.db import connection
import os, json, requests
from django.http import JsonResponse
from .models import PaymentRecord

JSON_FILE_PATH = 'active_payment_data.json'


# Task 1: Update payment records (no request argument needed for APScheduler)
def scheduled_task():
    now = timezone.now()
    table_name = connection.ops.quote_name(PaymentRecord._meta.db_table)
    
    with connection.cursor() as cursor:
        cursor.execute(f"""
            UPDATE {table_name}
            SET active = 0
            WHERE active = 1 AND timestamp <= %s
        """, [now])
        
        updated_count = cursor.rowcount
    
    print(f"Task executed at {datetime.now()}, {updated_count} records updated.")


# Utility to format market cap
def format_market_cap(market_cap):
    if market_cap is None:
        return "N/A"
    if market_cap >= 1000000000:
        return f"${market_cap / 1000000000:.1f}B"
    elif market_cap >= 1000000:
        return f"${market_cap / 1000000:.1f}M"
    elif market_cap >= 1000:
        return f"${market_cap / 1000:.1f}K"
    else:
        return f"${market_cap:.1f}"


# Fetch token data from an external API
def fetch_token_data(contract_address):
    api_url = f"https://frontend-api.pump.fun/coins/{contract_address}"
    try:
        response = requests.get(api_url)
        response.raise_for_status()
        data = response.json()
        
        return {
            "mint": data.get("mint"),
            "name": data.get("name"),
            "symbol": data.get("symbol"),
            "image_uri": data.get("image_uri"),
            "telegram": data.get("telegram"),
            "website": data.get("website"),
            "twitter": data.get("twitter"),
            "market_cap": format_market_cap(data.get("usd_market_cap"))
        }
    
    except requests.RequestException as e:
        print(f"Error fetching data for {contract_address}: {e}")
        return None


# Task 2: Generate active payment data
def generate_active_payment_data():
    active_records = PaymentRecord.objects.filter(active=True)
    data = []

    for record in active_records:
        contract_address = record.contract_address
        token_data = fetch_token_data(contract_address)
        if token_data:
            data.append(token_data)

    # Save the fetched data to a JSON file
    with open(JSON_FILE_PATH, 'w') as file:
        json.dump(data, file, indent=4)

    print(f"Payment data generated at {datetime.now()}.")





# Start the scheduler and schedule both tasks
def start_scheduler():
    scheduler = BackgroundScheduler()

    # Schedule the first task every 5 minutes
    scheduler.add_job(scheduled_task, 'interval', minutes=15)

    # Schedule the second task every 4 minutes
    scheduler.add_job(generate_active_payment_data, 'interval', minutes=1)

    scheduler.start()
    print("Scheduler started. Task 1 runs every 5 minutes and Task 2 runs every 4 minutes.")
