import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const RegPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [first_name, setfirst_name] = useState('');
    const [last_name, setlast_name] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleRegister = () => {
        if (password !== confirmPassword) {
            setError('Пароли не совпадают');
            setTimeout(() => setError(''), 3000);
            return;
        }

        const requestData = {
            username,
            email,
            password,
            first_name,
            last_name
        };

        fetch('http://127.0.0.1:8000/api/users/register/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => Promise.reject(data));
            }
            return response.json();
        })
        .then(data => {
            setSuccess('Регистрация прошла успешно! Вы будете перенаправлены на страницу входа.');
            setTimeout(() => {
                navigate('/login');
            }, 5000);
        })
        .catch(error => {
            console.error('Ошибка при регистрации', error);
            setError(error.detail || 'Ошибка при регистрации');
            setTimeout(() => setError(''), 3000);
        });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        handleRegister();
    };

    return (
        <div className="container">
            {success ? ( // Если регистрация успешна, показать только сообщение
                <div className="success-message">
                    <h1>Регистрация прошла успешно!</h1>
                    <p>Вы будете перенаправлены на страницу входа через несколько секунд.</p>
                </div>
            ) : (
                <>
                    <h1>Регистрация</h1>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            placeholder="Имя"
                            value={first_name}
                            onChange={(e) => setfirst_name(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Фамилия"
                            value={last_name}
                            onChange={(e) => setlast_name(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Логин"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Пароль"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Подтвердите пароль"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <button type="submit">Зарегистрироваться</button>
                    </form>
                    <div className="error-container">
                        {error && <p className="error">{error}</p>}
                    </div>
                    <p>
                        Уже есть аккаунт? <Link to="/login">Войти</Link>
                    </p>
                    <p>
                        <Link to="/">Вернуться на главную страницу</Link>
                    </p>
                </>
            )}
        </div>
    );
};


export default RegPage;
