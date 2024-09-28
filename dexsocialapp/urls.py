# urls.py
from django.urls import path
from .views import home,confirmation
from .JSON import generate_active_payment_data
from .api import check_paid_status_api,pricing_tiers_api,recent_searches_api
from .scheduler import scheduled_task
urlpatterns = [
    path('', home, name='home'),
    path('check-paid-status', check_paid_status_api, name='check_paid_status_api'),
    path('check-pricing-tier', pricing_tiers_api, name='pricing_tiers_api'),
    path('confirmation', confirmation, name='confirmation'),
    path('recent-searches/', recent_searches_api, name='recent_searches_api'),
    path('payment/', generate_active_payment_data, name='generate_active_payment_data'),
    path('delete/', scheduled_task, name='scheduled_task'),
]
