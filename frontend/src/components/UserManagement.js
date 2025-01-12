import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/UserManagement.css';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [filesData, setFilesData] = useState({});
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchUsers = async (token) => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/users/', {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUsers(data);
                data.forEach(user => fetchUserFiles(token, user.id));
            } else {
                console.error('Ошибка загрузки пользователей');
            }
        } catch (error) {
            console.error('Ошибка при запросе пользователей:', error);
        }
    };

    const fetchUserFiles = async (token, userId) => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/files/?user_id=${userId}`, {
                headers: {
                    'Authorization': `Token ${token}`,
                },
            });

            if (response.ok) {
                const files = await response.json();
                const totalFileSize = files.reduce((sum, file) => sum + file.size, 0);
                setFilesData(prevData => ({
                    ...prevData,
                    [userId]: {
                        fileCount: files.length,
                        totalFileSize: totalFileSize,
                    },
                }));
            } else {
                console.error(`Ошибка загрузки файлов для пользователя ${userId}`);
            }
        } catch (error) {
            console.error(`Ошибка при запросе файлов для пользователя ${userId}:`, error);
        }
    };

    const handleDeleteUser = async (userId) => {
        const token = localStorage.getItem('authToken');
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/users/${userId}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Token ${token}`,
                },
            });

            if (response.ok) {
                setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
                alert('Пользователь удален');
            } else {
                alert('Ошибка при удалении пользователя');
            }
        } catch (error) {
            console.error('Ошибка при удалении пользователя:', error);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            alert('Необходима авторизация');
            setLoading(false);
            return;
        }

        fetch('http://127.0.0.1:8000/api/token/verify/', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${token}`,
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data.detail === "Token is valid") {
                setIsAdmin(data.is_admin);
                fetchUsers(token);
                setLoading(false);
            } else {
                alert('Токен не действителен');
                setLoading(false);
            }
        })
        .catch(error => {
            console.error('Ошибка при проверке пользователя:', error);
            setLoading(false);
        });
    }, []);

    const formatSize = (sizeInBytes) => {
        if (sizeInBytes === 0) return '0 B';
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(sizeInBytes) / Math.log(1024));
        return (sizeInBytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
    };

    const sortedUsers = users.sort((a, b) => a.id - b.id);

    if (loading) {
        return <div>Загрузка...</div>;
    }

    return (
        <div className="user-management-container">
            <button className="back-button" onClick={() => navigate(-1)}>
                Назад
            </button>
            <h1>Управление пользователями</h1>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Логин</th>
                        <th>Email</th>
                        <th>Имя</th>
                        <th>Фамилия</th>
                        <th>Полное имя</th>
                        <th>Путь хранения</th>
                        <th>Количество файлов</th>
                        <th>Общий объем файлов</th>
                        <th>Управление файлами пользователя</th>
                        <th>Active status</th>
                        <th>Staff status</th>
                        <th>Superuser status</th>
                        <th>Удалить пользователя</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedUsers.map(user => {
                        const userFiles = filesData[user.id] || { fileCount: 0, totalFileSize: 0 };
                        return (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td>{user.first_name || '-'}</td>
                                <td>{user.last_name || '-'}</td>
                                <td>{user.full_name || '-'}</td>
                                <td>{user.storage_path || '-'}</td>
                                <td>{userFiles.fileCount}</td>
                                <td>{formatSize(userFiles.totalFileSize)}</td>
                                <td><button onClick={() => navigate(`/admin/userfiles/${user.id}`)}>Управление файлами пользователя</button></td>
                                <td>{user.is_active ? 'True' : 'False'}</td>
                                <td>{user.is_staff ? 'True' : 'False'}</td>
                                <td>{user.is_superuser ? 'True' : 'False'}</td>
                                <td>
                                    <button
                                        className="delete-button"
                                        onClick={() => {
                                        if (window.confirm(`Вы уверены, что хотите удалить пользователя?`)) {
                                            fetch(`http://127.0.0.1:8000/api/users/${user.id}/`, {
                                            method: 'DELETE',
                                            headers: {
                                                'Authorization': `Token ${localStorage.getItem('authToken')}`,
                                            },
                                            })
                                            .then(response => {
                                            if (response.ok) {
                                                alert('Пользователь успешно удалён');
                                                setUsers(users.filter(u => u.id !== user.id)); 
                                            } else {
                                                alert('Ошибка при удалении пользователя');
                                            }
                                            })
                                            .catch(err => alert('Ошибка при запросе удаления пользователя'));
                                        }
                                        }}
                                    >
                                        Удалить пользователя
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default UserManagement;
