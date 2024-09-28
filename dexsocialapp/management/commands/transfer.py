# your_app/management/commands/export_tokendata_to_json.py

import json
from django.core.management.base import BaseCommand
from django.core import serializers
from ...models import TokenData  # Replace 'your_app' with the actual app name

class Command(BaseCommand):
    help = 'Export TokenData model data to a JSON file'

    def handle(self, *args, **options):
        data = serializers.serialize("json", TokenData.objects.all())
        filename = "tokendata.json"
        with open(filename, 'w') as f:
            json.dump(json.loads(data), f, indent=2)
        self.stdout.write(self.style.SUCCESS(f'Successfully exported TokenData to {filename}'))