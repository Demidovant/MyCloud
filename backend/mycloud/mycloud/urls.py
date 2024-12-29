from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from .views import FileViewSet, RegisterUserView, list_users, delete_user, logout, UserProfileView, TokenVerifyView, TemporaryLinkDownloadView
from django.conf import settings
from django.conf.urls.static import static

router = DefaultRouter()
router.register(r"files", FileViewSet, basename="files")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
    path("api/token/auth/", obtain_auth_token, name="api_token_auth"),
    path("api/token/verify/", TokenVerifyView.as_view(), name="token_verify"),
    path("api/files/temp/<str:token>/", TemporaryLinkDownloadView.as_view(), name="temporary_file_download"),
    path("api/users/register/", RegisterUserView.as_view(), name="register"),
    path("api/users/", list_users, name="list_users"),
    path("api/users/<int:pk>/", delete_user, name="delete_user"),
    path("api/users/logout/", logout, name="logout"),
    path("api/users/profile/", UserProfileView.as_view(), name="user_profile"),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
