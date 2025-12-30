# Siwter - Strona internetowa firmy remontowo-budowlanej

Aplikacja Django dla strony internetowej firmy Siwter oferującej usługi remontowo-budowlane.

## Funkcjonalności

- Strona główna z sliderem
- Sekcja "O nas"
- Sekcja "Oferta" z szczegółowymi opisami usług
- Galeria zdjęć
- Cennik usług
- Formularz kontaktowy z walidacją
- Panel administracyjny Django
- Statystyki odwiedzin stron

## Technologie

- Django 4.2.7
- Python 3.9+
- SQLite (wbudowane w Python, używane w development i production)
- Nginx (produkcja)
- Gunicorn (produkcja)

## Szybki start (Lokalne środowisko)

1. **Sklonuj repozytorium:**
```bash
git clone <repo-url>
cd Siwter
```

2. **Utwórz środowisko wirtualne:**
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

3. **Zainstaluj zależności:**
```bash
# Dla lokalnego developmentu (Windows/Mac/Linux)
pip install -r requirements.txt

# Lub użyj requirements-dev.txt (to samo)
pip install -r requirements-dev.txt
```

4. **Skonfiguruj zmienne środowiskowe:**
```bash
cp .env.example .env
# Edytuj .env i ustaw:
# - SECRET_KEY (wygeneruj nowy)
# - DEBUG=True
# - DJANGO_SETTINGS_MODULE=siwter.settings.development
```

5. **Wykonaj migracje:**
```bash
python manage.py migrate
```

6. **Utwórz superusera:**
```bash
python manage.py createsuperuser
```

7. **Uruchom serwer deweloperski:**
```bash
python manage.py runserver
```

Aplikacja będzie dostępna pod adresem: `http://localhost:8000`

## Wdrożenie na produkcję

Szczegółowe instrukcje znajdują się w pliku `deployment/README.md`.

### Szybki start (produkcja):

```bash
# Na serwerze VPS
cd /var/www/siwter
python3 -m venv venv
source venv/bin/activate
pip install -r requirements-prod.txt

cp .env.example .env
# Edytuj .env z ustawieniami produkcyjnymi

python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser

# Skonfiguruj Gunicorn i Nginx (patrz deployment/README.md)
```

## Struktura projektu

```
Siwter/
├── siwter/              # Główna konfiguracja Django
│   ├── settings/        # Ustawienia (base, development, production)
│   ├── urls.py
│   └── wsgi.py
├── website/             # Główna aplikacja
│   ├── models.py        # Modele danych
│   ├── views.py         # Widoki
│   ├── templates/       # Szablony HTML
│   └── static/          # Pliki statyczne (CSS, JS, obrazy)
├── deployment/          # Pliki konfiguracyjne dla wdrożenia
├── media/               # Pliki przesłane przez użytkowników
├── staticfiles/         # Zebrane pliki statyczne
└── requirements.txt    # Zależności Python
```

## Separacja środowisk

Aplikacja używa oddzielnych ustawień dla developmentu i produkcji:

- **Development:** `siwter.settings.development` (DEBUG=True, SQLite)
- **Production:** `siwter.settings.production` (DEBUG=False, PostgreSQL, SSL)

Ustawienia są kontrolowane przez zmienną `DJANGO_SETTINGS_MODULE` w pliku `.env`.

## Zarządzanie

### Lokalne środowisko

```bash
# Uruchom serwer
python manage.py runserver

# Wykonaj migracje
python manage.py migrate

# Zbierz pliki statyczne
python manage.py collectstatic

# Utwórz superusera
python manage.py createsuperuser
```

### Produkcja

```bash
# Restart Gunicorn
sudo systemctl restart siwter

# Restart Nginx
sudo systemctl restart nginx

# Zobacz logi
sudo journalctl -u siwter -f
```

## Aktualizacja aplikacji

Po każdym commicie na produkcję:

```bash
cd /var/www/siwter
source venv/bin/activate
git pull origin main
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart siwter
```

## Licencja

Własność firmy Siwter.

