from django.shortcuts import render

from .models import GalleryImage


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
    return render(request, "contact.html")


def privacy(request):
    return render(request, "privacy.html")


