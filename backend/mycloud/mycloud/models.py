from django.db import models
from django.contrib.auth.models import User
from django.utils.timezone import now


class File(models.Model):
    """Модель для хранения файлов"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to='uploads/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    comment = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name


class TemporaryLink(models.Model):
    """Модель для временных ссылок"""
    file = models.ForeignKey(File, on_delete=models.CASCADE, related_name='temporary_links')
    token = models.CharField(max_length=64, unique=True)
    expires_at = models.DateTimeField()

    def is_expired(self):
        return now() > self.expires_at