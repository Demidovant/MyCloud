from django.db import models
from django.conf import settings
from django.utils.timezone import now
from django.contrib.auth.models import AbstractUser


def user_directory_path(instance, filename):
    """Функция для генерации пути хранения файлов пользователя."""
    return f"uploads/{instance.user.id}_{instance.user.username}/{filename}"


class CustomUser(AbstractUser):
    """Модель кастомного пользователя."""
    storage_path = models.CharField(max_length=255, blank=True, editable=False)

    def save(self, *args, **kwargs):
        """Переопределение метода save для генерации storage_path."""
        if not self.storage_path:
            # Сначала вызываем super().save(), чтобы получить ID
            super().save(*args, **kwargs)
            self.storage_path = f"uploads/{self.id}_{self.username}/"
        super().save(*args, **kwargs)  # Сохраняем с обновленным storage_path

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

    def __str__(self):
        return self.name


class TemporaryLink(models.Model):
    """Модель для временных ссылок."""
    file = models.ForeignKey(File, on_delete=models.CASCADE, related_name='temporary_links')
    token = models.CharField(max_length=64, unique=True)
    expires_at = models.DateTimeField()

    def is_expired(self):
        return now() > self.expires_at
