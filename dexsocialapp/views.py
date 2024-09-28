from django.http import JsonResponse,HttpResponse
from django.views.decorators.http import require_http_methods
from django.shortcuts import render,redirect
from .models import PricingTier,PaymentRecord
from django.utils import timezone
import requests,json,os
from django.conf import settings

JSON_FILE_PATH = 'active_payment_data.json'

def load_active_payment_data():
    if os.path.exists(JSON_FILE_PATH):
        with open(JSON_FILE_PATH, 'r') as file:
            return json.load(file)
    return []

def home(request):
    # Load the pre-generated JSON data
    active_data = load_active_payment_data()

    return render(request, 'index.html', {
        'trending_data': active_data,
    })

@require_http_methods(["POST"])
def confirmation(request):
    contract_address = request.POST.get('address')
    option_id = request.POST.get('option')
    print(contract_address,option_id)
    try:
        # Get the selected pricing tier option
        selected_option = PricingTier.objects.get(id=option_id)

        # Create a new PaymentRecord entry in the database
        payment_record = PaymentRecord.objects.create(
            contract_address=contract_address,
            duration=selected_option.duration,
            timestamp=timezone.now(),
            active=True
        )

        # Redirect to a success page or home page after submission
        return HttpResponse(status=200)

    except PricingTier.DoesNotExist:
        return HttpResponse("Selected pricing tier does not exist.", status=400)

    except Exception as e:
        print(f"Error while saving payment record: {e}")
        return HttpResponse("An error occurred while processing the request.", status=500)

