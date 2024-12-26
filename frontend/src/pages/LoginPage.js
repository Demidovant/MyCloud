import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/LoginPage.css';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            fetch('http://127.0.0.1:8000/api/users/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${token}`,
                },
            })
            .then(res => {
                if (!res.ok) {
                    localStorage.removeItem('authToken');
                    return Promise.reject("Invalid token");
                }
                return res.json();
            })
            .then(userData => {
                if (userData.is_admin) {
                    navigate('/admin');
                } else {
                    navigate('/dashboard');
                }
            })
            .catch(error => {
                console.error('Ошибка при проверке токена или получении профиля', error);
            });
        }
    }, [navigate]);

    const handleLogin = () => {
        fetch('http://127.0.0.1:8000/api/token/auth/', {
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
                        navigate('/admin');
                    } else {
                        navigate('/dashboard');
                    }
                })
                .catch(error => {
                    console.error('Ошибка при получении данных о пользователе', error);
                    setError('Ошибка при получении данных о пользователе');
                    setTimeout(() => {
                        setError('');
                    }, 2000)
                });

            } else {
                setError('Неверный логин или пароль');
                setTimeout(() => {
                    setError('');
                }, 2000)
            }
        })
        .catch(error => {
            console.error('Ошибка при авторизации', error);
            setError('Ошибка при авторизации');
            setTimeout(() => {
                setError('');
            }, 2000);
        });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        handleLogin();
    };

    return (
        <div className="container">
            <h1>Вход в систему</h1>
            <form onSubmit={handleSubmit}>
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
                <button type="submit">Войти</button>
            </form>
            <div className="error-container" data-placeholder="">
                {error && <p className="error">{error}</p>}
            </div>
            <p>
                <Link to="/">Вернуться на главную страницу</Link>
            </p>
        </div>
    );
};

export default LoginPage;
