import calendar
import json
from datetime import date, datetime

from django.contrib import admin
from django.db.models import Count
from django.db.models.functions import TruncDay, TruncHour, TruncMonth
from django.template.response import TemplateResponse
from django.urls import path
from django.utils import timezone

from .models import GalleryImage, PageView, QuoteRequest


@admin.register(GalleryImage)
class GalleryImageAdmin(admin.ModelAdmin):
    list_display = ("id", "order", "is_published", "created_at")
    list_filter = ("is_published",)
    list_editable = ("order", "is_published")
    ordering = ("order", "-created_at")


@admin.register(QuoteRequest)
class QuoteRequestAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "phone", "email", "created_at")
    search_fields = ("name", "phone", "email")
    ordering = ("-created_at",)


@admin.register(PageView)
class PageViewAdmin(admin.ModelAdmin):
    list_display = ("id", "path", "created_at")
    list_filter = ("path",)
    date_hierarchy = "created_at"
    ordering = ("-created_at",)
    change_list_template = "admin/pageview_change_list.html"

    def get_urls(self):
        urls = super().get_urls()
        custom = [
            path(
                "stats/",
                self.admin_site.admin_view(self.stats_view),
                name="website_pageview_stats",
            ),
        ]
        return custom + urls

    def stats_view(self, request):
        """
        /admin/website/pageview/stats/
        Filtry:
          - mode: day|month|year
          - day: YYYY-MM-DD
          - month: YYYY-MM
          - year: YYYY
        """
        now = timezone.localtime()
        mode = request.GET.get("mode") or "month"

        # Parse inputs with fallbacks
        day_str = request.GET.get("day") or now.date().isoformat()
        month_str = request.GET.get("month") or f"{now.year:04d}-{now.month:02d}"
        year_str = request.GET.get("year") or f"{now.year:04d}"

        qs = PageView.objects.all()
        labels = []
        values = []
        title = "Odwiedziny"

        if mode == "day":
            try:
                d = datetime.strptime(day_str, "%Y-%m-%d").date()
            except ValueError:
                d = now.date()
                day_str = d.isoformat()
            start = timezone.make_aware(datetime(d.year, d.month, d.day, 0, 0, 0))
            end = start + timezone.timedelta(days=1)

            buckets = (
                qs.filter(created_at__gte=start, created_at__lt=end)
                .annotate(b=TruncHour("created_at"))
                .values("b")
                .annotate(c=Count("id"))
                .order_by("b")
            )
            by_hour = {timezone.localtime(x["b"]).hour: x["c"] for x in buckets}
            labels = [f"{h:02d}:00" for h in range(24)]
            values = [by_hour.get(h, 0) for h in range(24)]
            title = f"Odwiedziny – dzień {day_str}"

        elif mode == "year":
            try:
                y = int(year_str)
            except ValueError:
                y = now.year
                year_str = str(y)

            start = timezone.make_aware(datetime(y, 1, 1, 0, 0, 0))
            end = timezone.make_aware(datetime(y + 1, 1, 1, 0, 0, 0))
            buckets = (
                qs.filter(created_at__gte=start, created_at__lt=end)
                .annotate(b=TruncMonth("created_at"))
                .values("b")
                .annotate(c=Count("id"))
                .order_by("b")
            )
            by_month = {timezone.localtime(x["b"]).month: x["c"] for x in buckets}
            labels = [calendar.month_name[m] for m in range(1, 13)]
            values = [by_month.get(m, 0) for m in range(1, 13)]
            title = f"Odwiedziny – rok {year_str}"

        else:  # month (default)
            try:
                y, m = month_str.split("-")
                y = int(y)
                m = int(m)
            except Exception:
                y, m = now.year, now.month
                month_str = f"{y:04d}-{m:02d}"

            last_day = calendar.monthrange(y, m)[1]
            start = timezone.make_aware(datetime(y, m, 1, 0, 0, 0))
            end = timezone.make_aware(datetime(y, m, last_day, 0, 0, 0)) + timezone.timedelta(days=1)
            buckets = (
                qs.filter(created_at__gte=start, created_at__lt=end)
                .annotate(b=TruncDay("created_at"))
                .values("b")
                .annotate(c=Count("id"))
                .order_by("b")
            )
            by_day = {timezone.localtime(x["b"]).day: x["c"] for x in buckets}
            labels = [f"{d:02d}" for d in range(1, last_day + 1)]
            values = [by_day.get(d, 0) for d in range(1, last_day + 1)]
            title = f"Odwiedziny – miesiąc {month_str}"
            mode = "month"

        ctx = dict(
            self.admin_site.each_context(request),
            title=title,
            mode=mode,
            day=day_str,
            month=month_str,
            year=year_str,
            chart_labels_json=json.dumps(labels, ensure_ascii=False),
            chart_values_json=json.dumps(values),
            total=sum(values),
        )
        return TemplateResponse(request, "admin/pageviews_stats.html", ctx)


