from django.db import models


class GalleryImage(models.Model):
    image = models.ImageField("Zdjęcie", upload_to="gallery/")
    order = models.PositiveIntegerField("Kolejność", default=0)
    is_published = models.BooleanField("Opublikowane", default=True)
    created_at = models.DateTimeField("Utworzono", auto_now_add=True)

    class Meta:
        ordering = ["order", "-created_at"]
        verbose_name = "Zdjęcie galerii"
        verbose_name_plural = "Zdjęcia galerii"

    def __str__(self) -> str:
        return f"Zdjęcie #{self.pk}"


