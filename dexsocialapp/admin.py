from django.contrib import admin
from .models import PricingTier,PaymentRecord,TokenInfo


@admin.register(PricingTier)
class PricingTierAdmin(admin.ModelAdmin):
    list_display = ('id','duration', 'current_price', 'old_price')
    list_editable = ('current_price', 'old_price')
    ordering = ('duration',)

@admin.register(PaymentRecord)
class PaymentRecordAdmin(admin.ModelAdmin):
    list_display = ('id','contract_address', 'duration', 'timestamp', 'active')  # Fields to display in admin list
    list_filter = ('active', 'timestamp')  # Add filter options
    search_fields = ('contract_address',)  # Add search capability by contract address

@admin.register(TokenInfo)
class TokenInfoAdmin(admin.ModelAdmin):
    list_display = ('symbol', 'name', 'address', 'website', 'telegram', 'twitter','image_url')
    search_fields = ('symbol', 'name', 'address')
    list_filter = ('symbol',)
