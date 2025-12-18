from django.contrib import messages
from django.shortcuts import redirect, render

from .models import GalleryImage, QuoteRequest


def index(request):
    return render(request, "index.html")


def about(request):
    return render(request, "about.html")


def offer(request):
    return render(request, "offer.html")


def gallery(request):
    images = GalleryImage.objects.filter(is_published=True).order_by("order", "-created_at")
    return render(request, "gallery.html", {"images": images})


def pricing(request):
    return render(request, "pricing.html")


def contact(request):
    if request.method == "POST":
        name = (request.POST.get("name") or "").strip()
        phone = (request.POST.get("phone") or "").strip()
        email = (request.POST.get("email") or "").strip()
        message = (request.POST.get("message") or "").strip()

        if not name:
            messages.error(request, "Proszę podać imię i nazwisko.")
        else:
            QuoteRequest.objects.create(name=name, phone=phone, email=email, message=message)
            messages.success(request, "Dziękujemy! Twoje zapytanie o wycenę zostało zapisane. Skontaktujemy się wkrótce.")
            return redirect("contact")

    return render(request, "contact.html")


def privacy(request):
    return render(request, "privacy.html")


