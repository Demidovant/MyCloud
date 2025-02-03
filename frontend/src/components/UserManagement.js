import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from "../config";
import './styles/UserManagement.css';
import ChangePassword from './ChangePassword';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [filesData, setFilesData] = useState({});
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [updatingUserId, setUpdatingUserId] = useState(null);
    const [passwordModal, setPasswordModal] = useState({ visible: false, userId: null });

    const openPasswordModal = (userId) => {
        setPasswordModal({ visible: true, userId });
    };
    
    const closePasswordModal = () => {
        setPasswordModal({ visible: false, userId: null });
    };
    

    const fetchUsers = async (token) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/users/`, {
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
            const response = await fetch(`${API_BASE_URL}/api/files/?user_id=${userId}`, {
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
    
        const isConfirmed = window.confirm('Вы действительно хотите удалить пользователя?');
        
        if (!isConfirmed) {
            return;
        }
    
        try {
            const response = await fetch(`${API_BASE_URL}/api/users/${userId}/`, {
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
    

    const handleEditUser = (userId) => {
        setUpdatingUserId(userId);
    };

    const handleCancelEdit = () => {
        setUpdatingUserId(null);
        const token = localStorage.getItem('authToken');
        fetchUsers(token);
    };

    const handleSaveUser = async (userId, updatedData) => {
        const token = localStorage.getItem('authToken');
        try {
            const response = await fetch(`${API_BASE_URL}/api/users/${userId}/update/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
            });

            if (response.ok) {
                const updatedUser = await response.json();
                setUsers(prevUsers =>
                    prevUsers.map(user =>
                        user.id === updatedUser.id ? updatedUser : user
                    )
                );
                setUpdatingUserId(null);
            } else {
                alert('Ошибка при сохранении данных пользователя');
            }
        } catch (error) {
            console.error('Ошибка при сохранении данных пользователя:', error);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            alert('Необходима авторизация');
            setLoading(false);
            return;
        }

        fetch(`${API_BASE_URL}/api/token/verify/`, {
            method: 'POST',
            headers: {
                'Authorization': `Token ${token}`,
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data.detail === "Token is valid") {
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

    const handleToggleAttribute = async (userId, attribute) => {
        const token = localStorage.getItem('authToken');
        
        if (attribute === 'is_active' || attribute === 'is_staff' || attribute === 'is_superuser') {
            setUpdatingUserId(null);
        } else {
            setUpdatingUserId(userId);
        }
    
        try {
            const response = await fetch(`${API_BASE_URL}/api/users/${userId}/update_attributes/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    [attribute]: !users.find(user => user.id === userId)[attribute],
                }),
            });
    
            if (response.ok) {
                const updatedUser = await response.json();
                setUsers(prevUsers =>
                    prevUsers.map(user =>
                        user.id === updatedUser.id ? updatedUser : user
                    )
                );
            } else {
                alert('Ошибка при обновлении атрибута пользователя');
            }
        } catch (error) {
            console.error('Ошибка при обновлении атрибута пользователя:', error);
        } finally {
            setUpdatingUserId(null);
        }
    };
    

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
                        <th>Редактировать</th>
                        <th>Удалить пользователя</th>
                        <th>Смена пароля</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedUsers.map(user => {
                        const userFiles = filesData[user.id] || { fileCount: 0, totalFileSize: 0 };
                        const isEditing = user.id === updatingUserId;

                        return (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.username}</td>
                                <td>
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            defaultValue={user.email}
                                            onChange={(e) => user.email = e.target.value}
                                        />
                                    ) : (
                                        user.email
                                    )}
                                </td>
                                <td>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            defaultValue={user.first_name || ''}
                                            onChange={(e) => user.first_name = e.target.value}
                                        />
                                    ) : (
                                        user.first_name || '-'
                                    )}
                                </td>
                                <td>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            defaultValue={user.last_name || ''}
                                            onChange={(e) => user.last_name = e.target.value}
                                        />
                                    ) : (
                                        user.last_name || '-'
                                    )}
                                </td>
                                <td>{user.full_name || '-'}</td>
                                <td>{user.storage_path || '-'}</td>
                                <td>{userFiles.fileCount}</td>
                                <td>{formatSize(userFiles.totalFileSize)}</td>
                                <td><button onClick={() => navigate(`/admin/userfiles/${user.id}`)}> <i className="fas fa-folder-open"></i> Управление файлами пользователя</button></td>
                                <td className="toggle"
                                    onClick={() => handleToggleAttribute(user.id, 'is_active')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <i className={user.is_active ? 'fas fa-check text-success' : 'fas fa-times text-danger'}></i>
                                </td>
                                <td className="toggle"
                                    onClick={() => handleToggleAttribute(user.id, 'is_staff')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <i className={user.is_staff ? 'fas fa-check text-success' : 'fas fa-times text-danger'}></i>
                                </td>
                                <td className="toggle"
                                    onClick={() => handleToggleAttribute(user.id, 'is_superuser')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <i className={user.is_superuser ? 'fas fa-check text-success' : 'fas fa-times text-danger'}></i>
                                </td>
                                <td>
                                    {isEditing ? (
                                        <>
                                            <button onClick={() => handleSaveUser(user.id, {
                                                first_name: user.first_name,
                                                last_name: user.last_name,
                                                email: user.email,
                                            })}>
                                                Сохранить
                                            </button>
                                            <button onClick={handleCancelEdit}>
                                                Отмена
                                            </button>
                                        </>
                                    ) : (
                                        <button onClick={() => handleEditUser(user.id, user)}>
                                            <i className="fas fa-edit"></i>Редактировать
                                        </button>
                                    )}
                                </td>
                                <td>
                                    <button
                                        className="delete-button"
                                        onClick={() => handleDeleteUser(user.id)}
                                    >
                                        <i className="fas fa-trash-alt"></i> Удалить пользователя
                                    </button>
                                </td>
                                <td>
                                    <button onClick={() => openPasswordModal(user.id)}>
                                        <i className="fas fa-key"></i> Сменить пароль
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {passwordModal.visible && (
                <div className="modal">
                    <div className="modal-content">
                        <ChangePassword
                            token={localStorage.getItem('authToken')}
                            userId={passwordModal.userId}
                            closeModal={closePasswordModal}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
