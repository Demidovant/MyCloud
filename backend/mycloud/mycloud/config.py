import os

DATABASE = {
    "ENGINE": "django.db.backends.postgresql",
    "NAME": os.getenv("DB_NAME", "mycloud"),
    "USER": os.getenv("DB_USER", "mycloud"),
    "PASSWORD": os.getenv("DB_PASSWORD", "1qaz@WSX"),
    "HOST": os.getenv("DB_HOST", "localhost"),
    "PORT": os.getenv("DB_PORT", "5432"),
}

# BASE_FILE_STORAGE_PATH = os.getenv("FILE_STORAGE_PATH", "/etc/mycloud")
BASE_FILE_STORAGE_PATH = os.getenv("FILE_STORAGE_PATH", "c:\\temp\\mycloud")
os.makedirs(BASE_FILE_STORAGE_PATH, exist_ok=True)

# LOG_FILE_PATH = os.getenv("LOG_FILE", "/var/log/mycloud/mycloud.log")
LOG_FILE_PATH = os.getenv("LOG_FILE", "c:\\temp\\mycloud\\mycloud.log")
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
