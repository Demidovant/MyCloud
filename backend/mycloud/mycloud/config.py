import os
import platform
from dotenv import load_dotenv
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "django-insecure-4atiqv#ta=dz73rvtxr6)9dsrw&rvx2qs0bejw++ubzqayl5nz")
DEBUG = os.getenv("DEBUG", "False")

DATABASE = {
    "ENGINE": "django.db.backends.postgresql",
    "NAME": os.getenv("DB_NAME", "mycloud"),
    "USER": os.getenv("DB_USER", "mycloud"),
    "PASSWORD": os.getenv("DB_PASSWORD", "1qaz@WSX"),
    "HOST": os.getenv("DB_HOST", "localhost"),
    "PORT": os.getenv("DB_PORT", "5432"),
}


if platform.system() == "Windows":
    default_storage_path = "c:\\temp\\mycloud"
    default_log_dir = "c:\\temp\\mycloud"
else:
    default_storage_path = "/etc/mycloud"
    default_log_dir = "/var/log/mycloud"

BASE_FILE_STORAGE_PATH = os.path.normpath(os.getenv("FILE_STORAGE_PATH", default_storage_path))

LOG_DIR_PATH = os.path.normpath(os.getenv("LOG_FILES_DIR", default_log_dir))
LOG_FILE_PATH = os.path.join(LOG_DIR_PATH, "mycloud.log")

print("Storage path:", BASE_FILE_STORAGE_PATH)
print("Log file path:", LOG_FILE_PATH)


os.makedirs(BASE_FILE_STORAGE_PATH, exist_ok=True)
os.makedirs(os.path.dirname(LOG_FILE_PATH), exist_ok=True)

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '[%(asctime)s] [%(levelname)s] %(message)s',
            'datefmt': '%Y-%m-%d %H:%M:%S',
        },
    },
    'handlers': {
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
        'file': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'formatter': 'verbose',
            # 'filename': 'django_error.log',
            'filename': LOG_FILE_PATH,
        },
    },
    'loggers': {
        'django': {
            # 'handlers': ['console', 'file'],
            # 'handlers': ['console'],
            'handlers': ['file'],
            'level': 'DEBUG',
            'propagate': True,
        },
    },
}
