import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from "../config";
import '../styles/AdminPage.css';
import FileUpload from '../components/FileUpload';
import FileManagement from '../components/FileManagement';
import UserInfo from '../components/UserInfo';

const AdminPage = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('authToken');

        if (!token) {
            navigate('/login');
            return;
        }

        const verifyToken = async () => {
            try {
                const verifyResponse = await fetch(`${API_BASE_URL}/api/token/verify/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${token}`,
                    },
                    body: JSON.stringify({ token }),
                });

                if (!verifyResponse.ok) {
                    throw new Error('Invalid token');
                }

                const profileResponse = await fetch(`${API_BASE_URL}/api/users/profile/`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Token ${token}`,
                    },
                });

                if (!profileResponse.ok) {
                    throw new Error('Failed to fetch user profile');
                }

                const userData = await profileResponse.json();

                setIsAuthenticated(true);

                if (userData.is_superuser) {
                    setIsAdmin(true);
                } else {
                    navigate('/');
                }
            } catch {
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        verifyToken();
    }, [navigate]);

    if (loading) {
        return <div>Загрузка...</div>;
    }

    if (!isAuthenticated || !isAdmin) {
        return null;
    }

    const token = localStorage.getItem('authToken');

    return (
        <div className="container">
            <div className="admin-page-content">
                <UserInfo token={token} className="user-info" />
                <div>
                <h1>Панель администратора</h1>
            <button
                className="go-to-users-button"
                onClick={() => navigate('/admin/users')}
            >
                Перейти к администрированию пользователями
            </button>
                <FileUpload className="file-upload" />
                <FileManagement token={token} className="file-management" />
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
