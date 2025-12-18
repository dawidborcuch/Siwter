from django.shortcuts import render


def index(request):
    return render(request, "index.html")


def about(request):
    return render(request, "about.html")


def offer(request):
    return render(request, "offer.html")


def gallery(request):
    return render(request, "gallery.html")


def pricing(request):
    return render(request, "pricing.html")


def contact(request):
    return render(request, "contact.html")


def privacy(request):
    return render(request, "privacy.html")


