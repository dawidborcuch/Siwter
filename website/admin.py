from django.contrib import admin

from .models import GalleryImage


@admin.register(GalleryImage)
class GalleryImageAdmin(admin.ModelAdmin):
    list_display = ("id", "order", "is_published", "created_at")
    list_filter = ("is_published",)
    list_editable = ("order", "is_published")
    ordering = ("order", "-created_at")


