# Generated by Django 5.1.4 on 2024-12-16 21:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("mycloud", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="file",
            name="comment",
            field=models.TextField(blank=True, null=True),
        ),
    ]
