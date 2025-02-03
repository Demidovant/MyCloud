#!/bin/sh

echo "Waiting for database..."
until pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER; do
  sleep 1
done

echo "Database is ready, applying migrations..."
python mycloud/manage.py migrate

echo "Starting Django server..."
exec python mycloud/manage.py runserver 0.0.0.0:8000
