from django.contrib import admin
from django.urls import path
from website import views

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", views.index, name="index"),
    path("o-nas/", views.about, name="about"),
    path("oferta/", views.offer, name="offer"),
    path("galeria/", views.gallery, name="gallery"),
    path("cennik/", views.pricing, name="pricing"),
    path("kontakt/", views.contact, name="contact"),
]


