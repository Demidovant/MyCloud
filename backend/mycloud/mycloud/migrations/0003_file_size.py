# Generated by Django 5.1.4 on 2024-12-21 22:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("mycloud", "0002_auto_create_superuser"),
    ]

    operations = [
        migrations.AddField(
            model_name="file",
            name="size",
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
    ]