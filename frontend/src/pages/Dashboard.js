import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/login');
        }
    }, [navigate]);

    return (
        <div className="container">
            <h1>Добро пожаловать на панель управления</h1>
            <p>Вы успешно вошли в систему</p>
        </div>
    );
};

export default Dashboard;
