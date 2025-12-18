from django.contrib import admin
from django.urls import path
from website import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", views.index, name="index"),
    path("o-nas/", views.about, name="about"),
    path("oferta/", views.offer, name="offer"),
    path("galeria/", views.gallery, name="gallery"),
    path("cennik/", views.pricing, name="pricing"),
    path("kontakt/", views.contact, name="contact"),
    path("polityka-prywatnosci/", views.privacy, name="privacy"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


