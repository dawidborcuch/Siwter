from django.utils.deprecation import MiddlewareMixin

from .models import PageView


class PageViewMiddleware(MiddlewareMixin):
    """
    Proste zliczanie odsłon stron (tylko HTML), wyklucza admin/static/media.
    """

    def process_response(self, request, response):
        try:
            # Only successful GET HTML responses
            if request.method != "GET":
                return response
            if response.status_code != 200:
                return response
            ctype = (response.get("Content-Type") or "").lower()
            if "text/html" not in ctype:
                return response

            path = request.path or "/"
            if path.startswith("/admin/"):
                return response
            if path.startswith("/static/") or path.startswith("/media/"):
                return response

            PageView.objects.create(path=path)
        except Exception:
            # Never break user page load because of analytics
            pass

        return response


