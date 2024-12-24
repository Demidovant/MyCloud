from django.core.exceptions import ObjectDoesNotExist
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework import status, viewsets
from django.utils.timezone import now
from django.conf import settings
from django.http import FileResponse, Http404
from django.views import View
from datetime import timedelta
from .models import File, TemporaryLink, CustomUser
from .serializers import FileSerializer, UserSerializer
import secrets
import os


class FileViewSet(viewsets.ModelViewSet):
    queryset = File.objects.all()
    serializer_class = FileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Фильтруем файлы по пользователю."""
        return File.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """Передаем текущего пользователя в сериализатор."""
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Функция для скачивания файла"""
        file = self.get_object()
        if file.user != request.user:
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

        file_path = os.path.join(settings.MEDIA_ROOT, file.file.name)

        # Проверяем, существует ли файл на сервере
        if not os.path.exists(file_path):
            return Response({"detail": "File not found"}, status=status.HTTP_404_NOT_FOUND)

        # Отправляем файл
        response = FileResponse(open(file_path, 'rb'))
        response['Content-Type'] = 'application/octet-stream'
        response['Content-Disposition'] = f'attachment; filename="{file.name}"'
        return response

    @action(detail=True, methods=['delete'])
    def delete_file(self, request, pk=None):
        """Удаление файла"""
        try:
            file = self.get_object()
            if file.user != request.user:
                return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

            file_path = file.file.path

            if os.path.exists(file_path):
                os.remove(file_path)
            else:
                return Response({"detail": "File not found"}, status=status.HTTP_404_NOT_FOUND)

            file.delete()

            return Response({"detail": "File deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

        except ObjectDoesNotExist:
            return Response({"detail": "File not found"}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['patch'])
    def rename_file(self, request, pk=None):
        """Переименование файла"""
        file = self.get_object()
        if file.user != request.user:
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

        new_name = request.data.get("name")
        if not new_name:
            return Response({"detail": "Name field is required"}, status=status.HTTP_400_BAD_REQUEST)
        file.name = new_name
        file.save()
        return Response({"detail": "File renamed successfully", "new_name": file.name}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'])
    def update_comment(self, request, pk=None):
        """Обновление комментария к файлу"""
        file = self.get_object()
        if file.user != request.user:
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

        comment = request.data.get('comment')
        if comment:
            file.comment = comment
            file.save()
            return Response({"detail": "Comment updated successfully"}, status=status.HTTP_200_OK)
        else:
            file.comment = None
            file.save()
            return Response({"detail": "Comment cleared successfully"}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def generate_link(self, request, pk=None):
        """Генерация временной ссылки на файл"""
        file = self.get_object()
        if file.user != request.user:
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

        token = secrets.token_urlsafe(32)
        expires_at = now() + timedelta(hours=1)  # Ссылка будет действительна 1 час

        temporary_link = TemporaryLink.objects.create(file=file, token=token, expires_at=expires_at)

        link = f"{request.build_absolute_uri('/')[:-1]}/api/files/temp/{token}/"
        return Response({
            "link": link,
            "expires_at": expires_at
        }, status=status.HTTP_201_CREATED)


class TemporaryLinkDownloadView(View):
    def get(self, request, token):
        """Скачивание файла по временной ссылке"""
        try:
            temporary_link = TemporaryLink.objects.get(token=token)
        except TemporaryLink.DoesNotExist:
            raise Http404("Temporary link not found")

        if temporary_link.is_expired():
            raise Http404("Temporary link has expired")

        file_path = os.path.join(settings.MEDIA_ROOT, temporary_link.file.file.name)
        if not os.path.exists(file_path):
            raise Http404("File not found")

        response = FileResponse(open(file_path, 'rb'))
        response['Content-Type'] = 'application/octet-stream'
        response['Content-Disposition'] = f'attachment; filename="{temporary_link.file.name}"'
        return response


class RegisterUserView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        """Регистрация пользователя"""
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"detail": "User created successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_users(request):
    """Получение списка пользователей для администратора"""
    if not request.user.is_superuser:
        return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

    users = CustomUser.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user(request, pk):
    """Удаление пользователя для администратора"""
    if not request.user.is_superuser:
        return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

    try:
        user = CustomUser.objects.get(pk=pk)
        user.delete()
        return Response({"detail": "User deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
    except CustomUser.DoesNotExist:
        return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)


from rest_framework.authtoken.models import Token


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """Logout"""
    try:
        request.user.auth_token.delete()
    except (AttributeError, Token.DoesNotExist):
        pass
    return Response({"detail": "Logged out successfully"}, status=status.HTTP_200_OK)


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        data = {
            "username": user.username,
            "is_admin": user.is_staff,
            "email": user.email
        }
        return Response(data)
