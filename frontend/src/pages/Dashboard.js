import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';
import FileUpload from '../components/FileUpload';
import FileManagement from '../components/FileManagement';
import UserInfo from '../components/UserInfo';

const Dashboard = () => {
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
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Token verification failed');
        })
        .then(() => {
            setIsAuthenticated(true);

            return fetch('http://127.0.0.1:8000/api/users/profile/', {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${token}`,
                },
            });
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Failed to fetch user profile');
        })
        .then(userData => {
            if (userData.is_superuser) {
                navigate('/admin');
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

    const token = localStorage.getItem('authToken');

    return (
        <div className="container">
            <div className="dashboard-content">
                <UserInfo token={token} className="user-info" />
                <div>
                <h1>Панель управления пользователя</h1>
                    <FileUpload className="file-upload" />
                    <FileManagement token={token} className="file-management" />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
