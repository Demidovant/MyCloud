import os

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.db.models.signals import pre_delete
from django.dispatch import receiver

from .models import CustomUser, File, TemporaryLink
from django.utils.html import format_html
from django.db.models import Sum


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

    list_display = (
        'id', 'username', 'email', 'first_name', 'last_name', 'full_name', 'storage_path', 'file_count',
        'total_file_size', 'file_management_link', 'is_active', 'is_staff',
        'is_superuser')
    search_fields = ('username', 'email', 'first_name', 'last_name')

    def storage_path(self, obj):
        return obj.storage_path

    storage_path.admin_order_field = 'Storage_path'
    storage_path.short_description = 'Storage Path'

    actions = ['make_superuser', 'remove_superuser', 'activate_users', 'deactivate_users', 'make_staff', 'remove_staff']

    def make_superuser(self, request, queryset):
        """Действие для массового присвоения признака администратора"""
        count = queryset.update(is_superuser=True)
        self.message_user(request, f"{count} users has been enabled administrators rights.")

    make_superuser.short_description = 'Enable users administrators rights'

    def remove_superuser(self, request, queryset):
        """Действие для массового удаления признака администратора"""
        count = queryset.update(is_superuser=False)
        self.message_user(request, f"{count} users has been disabled users administrators rights.")

    remove_superuser.short_description = 'Disable users administrators rights'

    def activate_users(self, request, queryset):
        """Действие для массовой активации пользователей"""
        count = queryset.update(is_active=True)
        self.message_user(request, f"{count} users have been activated.")

    activate_users.short_description = 'Activate users'

    def deactivate_users(self, request, queryset):
        """Действие для массовой деактивации пользователей"""
        count = queryset.update(is_active=False)
        self.message_user(request, f"{count} users have been deactivated.")

    deactivate_users.short_description = 'Deactivate users'

    def make_staff(self, request, queryset):
        """Действие для массового присвоения роли staff"""
        count = queryset.update(is_staff=True)
        self.message_user(request, f"{count} users have been assigned staff role.")

    make_staff.short_description = 'Assign staff role to users'

    def remove_staff(self, request, queryset):
        """Действие для массового удаления роли staff"""
        count = queryset.update(is_staff=False)
        self.message_user(request, f"{count} users have been removed from staff role.")

    remove_staff.short_description = 'Remove staff role from users'

    def file_count(self, obj):
        """Возвращает количество файлов у пользователя"""
        return File.objects.filter(user=obj).count()

    file_count.short_description = 'File Count'

    def total_file_size(self, obj):
        """Возвращает общий размер файлов у пользователя с конвертацией в KB/MB/GB"""
        total_size = File.objects.filter(user=obj).aggregate(Sum('size'))['size__sum']
        if total_size is None:
            return "0 B"

        size_units = ['B', 'KB', 'MB', 'GB', 'TB']
        unit_index = 0
        size_in_unit = total_size

        while size_in_unit >= 1024 and unit_index < len(size_units) - 1:
            size_in_unit /= 1024.0
            unit_index += 1

        return f"{round(size_in_unit, 2)} {size_units[unit_index]}"

    total_file_size.short_description = 'Total File Size'

    def file_management_link(self, obj):
        """Возвращает ссылку для управления файлами пользователя"""
        url = f"/admin/mycloud/file/?user__id={obj.id}"
        return format_html('<a href="{}">Manage Files</a>', url)

    file_management_link.short_description = 'Manage Files'


@receiver(pre_delete, sender=File)
def delete_file_on_instance_delete(sender, instance, **kwargs):
    """Удаление файла с диска при удалении объекта File"""
    if instance.file:
        file_path = instance.file.path
        if os.path.exists(file_path):
            os.remove(file_path)


@admin.register(File)
class FileAdmin(admin.ModelAdmin):
    """Админка для модели File"""
    list_display = ('id', 'name', 'user', 'comment', 'uploaded_at')
    search_fields = ('name',)
    list_filter = ('uploaded_at',)
    actions = ['delete_selected_files']


@admin.register(TemporaryLink)
class TemporaryLinkAdmin(admin.ModelAdmin):
    """Админка для модели TemporaryLink"""
    list_display = ('id', 'file', 'token', 'expires_at')
    search_fields = ('token',)
    list_filter = ('expires_at',)
