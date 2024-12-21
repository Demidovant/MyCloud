import os
from django.db import models
from django.conf import settings
from django.utils.timezone import now
from django.contrib.auth.models import AbstractUser


def user_directory_path(instance, filename):
    """Функция для генерации пути хранения файлов пользователя с учетом BASE_FILE_STORAGE_PATH."""
    user_path = f"uploads/{instance.user.id}_{instance.user.username}/"
    full_path = os.path.join(settings.BASE_FILE_STORAGE_PATH, user_path)
    os.makedirs(full_path, exist_ok=True)
    return os.path.join(user_path, filename)


class CustomUser(AbstractUser):
    """Модель кастомного пользователя."""
    storage_path = models.CharField(max_length=255, blank=True, editable=False)

    def save(self, *args, **kwargs):
        """Переопределение метода save для генерации storage_path с учетом BASE_FILE_STORAGE_PATH."""
        if not self.storage_path:
            super().save(*args, **kwargs)
            self.storage_path = os.path.join(settings.BASE_FILE_STORAGE_PATH, f"uploads/{self.id}_{self.username}/")
        os.makedirs(self.storage_path, exist_ok=True)
        super().save(*args, **kwargs)

    @property
    def full_name(self):
        """Возвращает полное имя пользователя."""
        return f"{self.first_name} {self.last_name}".strip()


class File(models.Model):
    """Модель для хранения файлов."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to=user_directory_path)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    comment = models.TextField(blank=True, null=True)
    size = models.PositiveIntegerField(null=True, blank=True)

    def save(self, *args, **kwargs):
        """При сохранении файла вычисляем его размер"""
        if self.file:
            self.size = self.file.size
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class TemporaryLink(models.Model):
    """Модель для временных ссылок."""
    file = models.ForeignKey(File, on_delete=models.CASCADE, related_name='temporary_links')
    token = models.CharField(max_length=64, unique=True)
    expires_at = models.DateTimeField()

    def is_expired(self):
        return now() > self.expires_at
