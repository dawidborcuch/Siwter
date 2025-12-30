# Instrukcja wdrożenia aplikacji Siwter na VPS

## Wymagania

- Python 3.9+
- SQLite (wbudowane w Python)
- Nginx
- Gunicorn

## Krok 1: Przygotowanie serwera

### Aktualizacja systemu (Ubuntu/Debian)
```bash
sudo apt update
sudo apt upgrade -y
```

### Instalacja wymaganych pakietów
```bash
sudo apt install -y python3 python3-pip python3-venv nginx git
```

## Krok 2: Klonowanie repozytorium

```bash
cd /var/www
sudo git clone https://github.com/twoj-repo/siwter.git
sudo chown -R $USER:$USER /var/www/siwter
cd /var/www/siwter
```

## Krok 3: Konfiguracja środowiska wirtualnego

```bash
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements-prod.txt
```

## Krok 4: Konfiguracja zmiennych środowiskowych

```bash
cp .env.example .env
nano .env
```

Zaktualizuj plik `.env`:
```env
SECRET_KEY=wygeneruj-nowy-secret-key-używając-django-secret-key-generator
DEBUG=False
ALLOWED_HOSTS=twoja-domena.pl,IP-serwera

# SQLite (wbudowane w Python, nie wymaga dodatkowej konfiguracji)
# DB_ENGINE i DB_NAME są ustawione domyślnie w settings/production.py

DJANGO_SETTINGS_MODULE=siwter.settings.production
DJANGO_LOG_LEVEL=INFO
```

Wygeneruj nowy SECRET_KEY:
```bash
python manage.py shell
>>> from django.core.management.utils import get_random_secret_key
>>> print(get_random_secret_key())
```

## Krok 5: Migracje i zbieranie plików statycznych

```bash
source venv/bin/activate
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser
```

## Krok 6: Konfiguracja Gunicorn

Utwórz plik `/etc/systemd/system/siwter.service`:

```ini
[Unit]
Description=Siwter Gunicorn daemon
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/siwter
Environment="PATH=/var/www/siwter/venv/bin"
Environment="DJANGO_SETTINGS_MODULE=siwter.settings.production"
ExecStart=/var/www/siwter/venv/bin/gunicorn \
    --workers 3 \
    --bind unix:/var/www/siwter/siwter.sock \
    --timeout 60 \
    --access-logfile - \
    --error-logfile - \
    siwter.wsgi:application

Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

Aktywuj i uruchom serwis:
```bash
sudo systemctl daemon-reload
sudo systemctl enable siwter
sudo systemctl start siwter
sudo systemctl status siwter
```

## Krok 7: Konfiguracja Nginx

Utwórz plik `/etc/nginx/sites-available/siwter`:

```nginx
server {
    listen 80;
    server_name twoja-domena.pl www.twoja-domena.pl;

    # Maksymalny rozmiar uploadu
    client_max_body_size 10M;

    # Pliki statyczne
    location /static/ {
        alias /var/www/siwter/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Pliki media
    location /media/ {
        alias /var/www/siwter/media/;
        expires 7d;
        add_header Cache-Control "public";
    }

    # Proxy do Gunicorn
    location / {
        include proxy_params;
        proxy_pass http://unix:/var/www/siwter/siwter.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

Aktywuj konfigurację:
```bash
sudo ln -s /etc/nginx/sites-available/siwter /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Krok 8: Uprawnienia

```bash
sudo chown -R www-data:www-data /var/www/siwter
sudo chmod -R 755 /var/www/siwter
sudo chmod -R 775 /var/www/siwter/media
sudo chmod -R 775 /var/www/siwter/staticfiles
```

## Krok 9: Firewall (opcjonalnie)

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
sudo ufw enable
```

## Aktualizacja aplikacji

Po każdym commicie na produkcję:

```bash
cd /var/www/siwter
source venv/bin/activate
git pull origin main
pip install -r requirements-prod.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart siwter
```

## Logi

```bash
# Logi Gunicorn
sudo journalctl -u siwter -f

# Logi Nginx
sudo tail -f /var/log/nginx/error.log

# Logi Django
tail -f /var/www/siwter/logs/django.log
```

## Włączenie SSL (po propagacji DNS)

1. Zainstaluj Certbot:
```bash
sudo apt install certbot python3-certbot-nginx
```

2. Uzyskaj certyfikat:
```bash
sudo certbot --nginx -d twoja-domena.pl -d www.twoja-domena.pl
```

3. Zaktualizuj `siwter/settings/production.py`:
```python
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
```

4. Restart serwisów:
```bash
sudo systemctl restart siwter
sudo systemctl restart nginx
```

