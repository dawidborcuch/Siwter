"""
WSGI config for Siwter project.
"""
import os
from decouple import config

from django.core.wsgi import get_wsgi_application

# Użyj ustawień z .env lub domyślnie development
os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    config('DJANGO_SETTINGS_MODULE', default='siwter.settings.development')
)

application = get_wsgi_application()


