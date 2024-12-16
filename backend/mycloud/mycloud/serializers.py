from rest_framework import serializers
from .models import File

class FileSerializer(serializers.ModelSerializer):
    name = serializers.CharField(required=False)

    class Meta:
        model = File
        fields = ['id', 'name', 'file', 'uploaded_at', 'user']
        read_only_fields = ['user']

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['user'] = user

        if 'name' not in validated_data:
            file = validated_data.get('file')
            if file:
                validated_data['name'] = file.name

        return super().create(validated_data)