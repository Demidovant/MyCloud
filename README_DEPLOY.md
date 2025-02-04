# Установка и развертывание MyCloud на Ubuntu 22.04

## Установка необходимых пакетов

Обновите пакеты, установите docker и дополнительные пакеты:

```bash
sudo apt update
sudo apt install wget unzip docker.io docker-compose -y
sudo systemctl enable docker
```

Добавьте пользователя в группу docker

```bash
sudo usermod -aG docker $USER && newgrp docker
```

## Загрузка и подготовка проекта

Скачайте и распакуйте репозиторий с GitHub:

```bash
cd ~
wget https://github.com/Demidovant/MyCloud/archive/refs/heads/main.zip
unzip main.zip
mv MyCloud-main mycloud
cd mycloud
```

## Добавьте символьную ссылку (необходимо для запуска docker)
```bash
ln -s ./backend/.env .env
```

## **Укажите IP-адрес сервера**
- В файле `frontend/.env` укажите **IP-адрес сервера**, на котором разворачивается приложение.
- В файле `backend/.env` при необходимости измените значения переменных (*по умолчанию менять не требуется, всё настроено*).  
  - Файлы `.env` добавлены в репозиторий для упрощения развертывания.

## Сборка и запуск контейнеров

Выполните сборку образов и запустите контейнеры:

```bash
sudo docker-compose build --no-cache && sudo docker-compose up -d
```

## Доступ к приложению

После успешного развертывания будут запущены контейнеры с БД, frontend и backend.<br>
Будут применены все необходимые миграции БД, а также создан пользователь `admin` с паролем `1qaz@WSX`:

- **Фронтенд** будет доступен по адресу:  
  👉 `http://<серверный_IP>:3000`

- **Бэкенд** будет доступен по адресу:  
  👉 `http://<серверный_IP>:8000`


## ⚠️ Для полного удаления приложения, включая БД и загруженные файлы необходимо выполнить:
```bash
cd ~/mycloud && source backend/.env && sudo bash -c 'docker stop $(docker ps -a -q); docker rm $(docker ps -a -q); docker volume rm $(docker volume ls -q); docker rmi $(docker images); docker network rm $(docker network ls -q); rm -rfv '"${FILE_STORAGE_PATH}"'; rm -rfv '"${LOG_FILES_DIR}"'; systemctl restart docker.service'

```

