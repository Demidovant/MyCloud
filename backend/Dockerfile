FROM python:3.10
WORKDIR /app
COPY . /app/
RUN pip install --no-cache-dir -r requirements.txt
RUN python mycloud/manage.py collectstatic --noinput
RUN apt update
RUN apt install postgresql-client -y
RUN chmod +x /app/entrypoint.sh
EXPOSE 8000
ENTRYPOINT ["/bin/sh", "-c", "/app/entrypoint.sh"]
