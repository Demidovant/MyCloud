import os
from rest_framework import serializers
from django.conf import settings
from .models import File, CustomUser


class FileSerializer(serializers.ModelSerializer):
    name = serializers.CharField(required=False)

    class Meta:
        model = File
        fields = ['id', 'name', 'file', 'uploaded_at', 'user', 'comment', 'size', 'updated_at', 'last_downloaded_at']
        read_only_fields = ['user', 'last_downloaded_at']

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['user'] = user

        if 'name' not in validated_data:
            file = validated_data.get('file')
            if file:
                validated_data['name'] = file.name

        file_storage_path = os.path.normpath(os.path.join(settings.BASE_FILE_STORAGE_PATH, f"uploads/{user.id}_{user.username}/"))
        validated_data['file'].name = os.path.join(file_storage_path, validated_data['name'])

        return super().create(validated_data)


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    first_name = serializers.CharField(max_length=30, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=30, required=False, allow_blank=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'first_name', 'last_name', 'full_name', 'email', 'password', 'storage_path', 'is_active', 'is_staff', 'is_superuser']
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def get_full_name(self, obj):
        return obj.full_name

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            email=validated_data['email'],
            password=validated_data['password']
        )

        user.storage_path = os.path.normpath(os.path.join(settings.BASE_FILE_STORAGE_PATH, f'uploads/{user.id}_{user.username}/'))
        user.save()

        return user

    def update(self, instance, validated_data):
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.email = validated_data.get('email', instance.email)
        instance.save()
        return instance