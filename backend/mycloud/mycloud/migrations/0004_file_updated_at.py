# Generated by Django 5.1.4 on 2024-12-29 19:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("mycloud", "0003_file_size"),
    ]

    operations = [
        migrations.AddField(
            model_name="file",
            name="updated_at",
            field=models.DateTimeField(auto_now=True),
        ),
    ]