import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminPage = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('authToken');

        if (!token) {
            navigate('/login');
            return;
        }

        fetch('http://127.0.0.1:8000/api/token/verify/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`,
            },
            body: JSON.stringify({ token: token })
        })
        .then(response => response.json())
        .then(data => {
            if (data.detail === "Token is valid") {
                setIsAuthenticated(true);
                fetch('http://127.0.0.1:8000/api/users/profile/', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Token ${token}`,
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
            } else {
                navigate('/login');
            }
        })
        .catch(() => {
            navigate('/login');
        })
        .finally(() => {
            setLoading(false);
        });
    }, [navigate]);

    if (loading) {
        return <div>Загрузка...</div>;
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="container">
            <h1>Добро пожаловать на панель управления администратора</h1>
            <p>Вы успешно вошли в систему. Здесь будет отображаться ваш контент.</p>
            <button onClick={() => {
                localStorage.removeItem('authToken');
                navigate('/login');
            }}>
                Выйти
            </button>
        </div>
    );
};

export default AdminPage;
