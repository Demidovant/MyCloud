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

    list_display = (
        'id', 'username', 'email', 'first_name', 'last_name', 'full_name', 'storage_path', 'is_active', 'is_staff',
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
