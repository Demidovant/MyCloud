import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = () => {
        fetch('http://127.0.0.1:8000/api-token-auth/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.token) {
                localStorage.setItem('authToken', data.token);

                fetch('http://127.0.0.1:8000/api/users/profile', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Token ${data.token}`,
                    },
                })
                .then(res => res.json())
                .then(userData => {
                    if (userData.is_admin) {
                        window.location.href = 'http://127.0.0.1:8000/admin';
                    } else {
                        navigate('/dashboard');
                    }
                })
                .catch(error => {
                    console.error('Ошибка при получении данных о пользователе', error);
                    setError('Ошибка при получении данных о пользователе');
                });

            } else {
                setError('Неверный логин или пароль');
            }
        })
        .catch(error => {
            console.error('Ошибка при авторизации', error);
            setError('Ошибка при авторизации');
        });
    };

    return (
        <div className="container">
            <h1>Вход в систему</h1>
            <input
                type="text"
                placeholder="Логин"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleLogin}>Войти</button>

            {error && <p className="error">{error}</p>}
        </div>
    );
};

export default Dashboard;
