from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, File, TemporaryLink


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    """Кастомное отображение модели CustomUser в админке"""

    exclude = ('storage_path',)
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ()}),
    )

    def full_name(self, obj):
        return f'{obj.first_name} {obj.last_name}'

    full_name.short_description = 'Full Name'
    full_name.admin_order_field = 'first_name'

    list_display = ('id', 'username', 'email', 'first_name', 'last_name', 'full_name', 'storage_path', 'is_staff')
    search_fields = ('username', 'email', 'first_name', 'last_name')

    def storage_path(self, obj):
        return obj.storage_path

    storage_path.admin_order_field = 'storage_path'
    storage_path.short_description = 'Storage Path'


@admin.register(File)
class FileAdmin(admin.ModelAdmin):
    """Админка для модели File"""
    list_display = ('id', 'name', 'user', 'comment', 'uploaded_at')
    search_fields = ('name',)
    list_filter = ('uploaded_at',)


@admin.register(TemporaryLink)
class TemporaryLinkAdmin(admin.ModelAdmin):
    """Админка для модели TemporaryLink"""
    list_display = ('id', 'file', 'token', 'expires_at')
    search_fields = ('token',)
    list_filter = ('expires_at',)
