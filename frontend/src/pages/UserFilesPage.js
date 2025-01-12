import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FileManagement from '../components/FileManagement';
import '../styles/UserFilesPage.css';

const UserFilesPage = () => {
    const { id } = useParams();  // Получаем userId из URL
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('authToken');
            let userId = id;

            // Если id не получено из URL, запрашиваем данные о текущем пользователе
            if (!userId) {
                const response = await fetch('http://127.0.0.1:8000/api/users/profile/', {
                    headers: {
                        'Authorization': `Token ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    userId = data.user_id;  // Получаем id текущего пользователя
                } else {
                    console.error('Ошибка при получении данных о пользователе');
                    return;
                }
            }

            // Получаем данные пользователя по id
            const response = await fetch(`http://127.0.0.1:8000/api/users/${userId}/`, {
                headers: {
                    'Authorization': `Token ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data);
            } else {
                console.error('Ошибка при получении данных пользователя');
            }
        };

        fetchUser();
    }, [id]);

    if (!user) {
        return <div>Загрузка...</div>;
    }

    return (
        <div className="files-management-container">
            <button onClick={() => navigate(-1)}>Назад</button>
            <h1>Файлы пользователя {user.username}</h1>
            <FileManagement userId={user.id} />
        </div>
    );
};

export default UserFilesPage;
