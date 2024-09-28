from django.db import models
from django.utils import timezone

class PricingTier(models.Model):
    id = models.AutoField(primary_key=True)
    current_price = models.DecimalField(max_digits=6, decimal_places=2)
    old_price = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    duration = models.IntegerField()

    def __str__(self):
        return f"{self.duration} Hour(s) - Current: {self.current_price} SOL, Old: {self.old_price or 'N/A'} SOL"

    class Meta:
        ordering = ['duration']

class PaymentRecord(models.Model):
    contract_address = models.CharField(max_length=255)
    duration = models.PositiveIntegerField()
    timestamp = models.DateTimeField(default=timezone.now)
    active = models.BooleanField(default=True)

    def __str__(self):
        return self.contract_address

class TokenInfo(models.Model):
    address = models.CharField(max_length=255, unique=True)  # Enforce unique constraint
    name = models.CharField(max_length=255)
    symbol = models.CharField(max_length=255)
    website = models.URLField(blank=True, null=True)
    telegram = models.URLField(blank=True, null=True)
    twitter = models.URLField(blank=True, null=True)
    image_url = models.URLField(blank=True, null=True)
