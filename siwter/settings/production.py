"""
Production settings for Siwter project.
"""
from .base import *

DEBUG = False

# Security settings
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'SAMEORIGIN'  # SAMEORIGIN zamiast DENY, aby umożliwić Google Maps w iframe

# SSL settings (włączone po skonfigurowaniu SSL przez Certbot)
# Uwaga: SECURE_SSL_REDIRECT nie jest potrzebne, bo Nginx już przekierowuje HTTP -> HTTPS
# SECURE_SSL_REDIRECT = True  # Nginx już robi przekierowanie, więc nie potrzebne

# Informuj Django, że jest za proxy (Nginx) i że połączenie jest HTTPS
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000  # 1 rok
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Database - SQLite for production (wystarczające dla małych/średnich aplikacji)
# SQLite jest wbudowane w Python i nie wymaga dodatkowych pakietów
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# Jeśli w przyszłości będziesz potrzebować PostgreSQL, odkomentuj poniższe:
# DATABASES = {
#     "default": {
#         "ENGINE": "django.db.backends.postgresql",
#         "NAME": config('DB_NAME'),
#         "USER": config('DB_USER'),
#         "PASSWORD": config('DB_PASSWORD'),
#         "HOST": config('DB_HOST', default='localhost'),
#         "PORT": config('DB_PORT', default='5432'),
#     }
# }

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'ERROR',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs' / 'django.log',
            'formatter': 'verbose',
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': 'WARNING',
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': config('DJANGO_LOG_LEVEL', default='INFO'),
            'propagate': False,
        },
    },
}

# Create logs directory if it doesn't exist
import os
logs_dir = BASE_DIR / 'logs'
if not logs_dir.exists():
    os.makedirs(logs_dir)

