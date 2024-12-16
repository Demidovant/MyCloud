from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from .views import FileViewSet
from django.conf import settings
from django.conf.urls.static import static

router = DefaultRouter()
router.register(r"files", FileViewSet)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
    path("api-token-auth/", obtain_auth_token, name="api_token_auth"),
    path("api/files/<int:id>/rename_file/", FileViewSet.as_view({"patch": "rename_file"})),
    path("api/files/<int:id>/delete_file/", FileViewSet.as_view({"delete": "delete_file"})),
    path("api/files/<int:id>/update_comment/", FileViewSet.as_view({"patch": "update_comment"})),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
