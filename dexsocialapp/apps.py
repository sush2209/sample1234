from django.apps import AppConfig
import os

class DexsocialappConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'dexsocialapp'

    # def ready(self):
    #     if os.environ.get('RUN_MAIN') == 'true':  # Prevent running the scheduler multiple times
    #         from .scheduler import start_scheduler  # Import the correct function
    #         start_scheduler()  # Call the correct function to start the scheduler
