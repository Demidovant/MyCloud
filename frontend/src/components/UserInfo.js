import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from "../config";
import ChangePassword from './ChangePassword';
import PropTypes from 'prop-types';
import './styles/UserInfo.css';

const UserInfo = ({ token }) => {
    const [user, setUser] = useState({});
    const [originalUser, setOriginalUser] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [passwordModal, setPasswordModal] = useState({ visible: false, userId: null });

    const openPasswordModal = (userId) => {
        setPasswordModal({ visible: true, userId: userId });
    };

    const closePasswordModal = () => {
        setPasswordModal({ visible: false, userId: null });
    };

    useEffect(() => {
        setIsLoading(true);
        fetch(`${API_BASE_URL}/api/users/profile/`, {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`,
            },
        })
            .then(response => response.json())
            .then(data => {
                setUser(data);
                setOriginalUser(data);
                setIsLoading(false);
            })
            .catch(() => {
                setError('Ошибка загрузки данных профиля');
                setIsLoading(false);
            });
    }, [token]);

    const handleSave = () => {
        fetch(`${API_BASE_URL}/api/users/profile/update/`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
            }),
        })
            .then(response => {
                if (response.ok) {
                    setIsEditing(false);
                    setOriginalUser(user);
                } else {
                    setError('Ошибка обновления данных пользователя');
                }
            })
            .catch(() => setError('Ошибка при сохранении данных'));
    };

    const handleCancelEdit = () => {
        setUser(originalUser);
        setIsEditing(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/login');
    };

    if (isLoading) {
        return <div>Загрузка...</div>;
    }

    return (
        <div className="user-info">
            <h2>
                <i className="fas fa-user-circle"></i> Информация о пользователе
            </h2>
            {error && <div className="error">{error}</div>}
            <div className="user-info-row">
                <label>
                    Логин:
                </label>
                <span>{user.username}</span>
            </div>
            <div className="user-info-row">
                <label>
                    Email:
                </label>
                {isEditing ? (
                    <input
                        className="highlight-row"
                        type="email"
                        value={user.email || ''}
                        onChange={(e) => setUser({ ...user, email: e.target.value })}
                    />
                ) : (
                    <span>{user.email}</span>
                )}
            </div>
            <div className="user-info-row">
                <label>
                    Имя:
                </label>
                {isEditing ? (
                    <input
                        className="highlight-row"
                        type="text"
                        value={user.first_name || ''}
                        onChange={(e) => setUser({ ...user, first_name: e.target.value })}
                    />
                ) : (
                    <span>{user.first_name}</span>
                )}
            </div>
            <div className="user-info-row">
                <label>
                    Фамилия:
                </label>
                {isEditing ? (
                    <input
                        className="highlight-row"
                        type="text"
                        value={user.last_name || ''}
                        onChange={(e) => setUser({ ...user, last_name: e.target.value })}
                    />
                ) : (
                    <span>{user.last_name}</span>
                )}
            </div>
            <div className="user-info-row">
                <label>
                    Роль:
                </label>
                <span>{user.is_superuser ? 'Администратор' : 'Пользователь'}</span>
            </div>
            {isEditing ? (
                <>
                    <button className="save-button" onClick={handleSave}>
                        <i className="fas fa-save"></i> Сохранить изменения
                    </button>
                    <button className="cancel-button" onClick={handleCancelEdit}>
                        <i className="fas fa-times"></i> Отмена
                    </button>
                </>
            ) : (
                <button onClick={() => setIsEditing(true)}>
                    <i className="fas fa-edit"></i> Редактировать
                </button>
            )}
            <div>
                <button onClick={() => openPasswordModal(user.id)}>
                    <i className="fas fa-key"></i> Сменить пароль
                </button>
            </div>

            {passwordModal.visible && (
                <div className="modal">
                    <div className="modal-content">
                        <ChangePassword
                            token={localStorage.getItem('authToken')}
                            userId={passwordModal.userId}
                            onClose={closePasswordModal}
                        />
                    </div>
                </div>
            )}

            <button className="logout-btn" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i> Выйти
            </button>
        </div>
    );
};

UserInfo.propTypes = {
    token: PropTypes.string.isRequired,
};

export default UserInfo;
