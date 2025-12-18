from io import BytesIO

from django.core.files.base import ContentFile
from django.db import models

from PIL import Image


class GalleryImage(models.Model):
    image = models.ImageField("Zdjęcie", upload_to="gallery/")
    thumbnail = models.ImageField(
        "Miniatura",
        upload_to="gallery/thumbs/",
        blank=True,
        null=True,
        editable=False,
    )
    order = models.PositiveIntegerField("Kolejność", default=0)
    is_published = models.BooleanField("Opublikowane", default=True)
    created_at = models.DateTimeField("Utworzono", auto_now_add=True)

    class Meta:
        ordering = ["order", "-created_at"]
        verbose_name = "Zdjęcie galerii"
        verbose_name_plural = "Zdjęcia galerii"

    def __str__(self) -> str:
        return f"Zdjęcie #{self.pk}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        # Generate thumbnail once we have an image and a PK
        if self.image and (not self.thumbnail):
            self._generate_thumbnail()
            super().save(update_fields=["thumbnail"])

    def _generate_thumbnail(self):
        """
        Tworzy miniaturę (WebP) do siatki galerii.
        """
        self.image.open("rb")
        img = Image.open(self.image)
        img = img.convert("RGB")

        # target thumbnail size
        max_size = (520, 520)
        img.thumbnail(max_size, Image.LANCZOS)

        buffer = BytesIO()
        img.save(buffer, format="WEBP", quality=82, method=6)
        buffer.seek(0)

        base = self.image.name.rsplit("/", 1)[-1].rsplit("\\", 1)[-1]
        stem = base.rsplit(".", 1)[0]
        filename = f"{stem}_thumb.webp"
        self.thumbnail.save(filename, ContentFile(buffer.read()), save=False)


class QuoteRequest(models.Model):
    name = models.CharField("Imię i nazwisko", max_length=120)
    phone = models.CharField("Telefon", max_length=40, blank=True)
    email = models.EmailField("E-mail", blank=True)
    message = models.TextField("Opis prac / zakres", blank=True)
    created_at = models.DateTimeField("Utworzono", auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Zapytanie o wycenę"
        verbose_name_plural = "Zapytania o wycenę"

    def __str__(self) -> str:
        return f"Wycena #{self.pk} - {self.name}"


