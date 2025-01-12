import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/UserInfo.css';

const UserInfo = ({ token }) => {
    const [user, setUser] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        setIsLoading(true);
        fetch('http://127.0.0.1:8000/api/users/profile/', {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`,
            },
        })
            .then(response => response.json())
            .then(data => {
                setUser(data);
                setIsLoading(false);
            })
            .catch(error => {
                setError('Ошибка загрузки данных профиля');
                setIsLoading(false);
            });
    }, [token]);

    const handleSave = () => {
        fetch('http://127.0.0.1:8000/api/users/profile/update/', {
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
                } else {
                    setError('Ошибка обновления данных пользователя');
                }
            })
            .catch(() => setError('Ошибка при сохранении данных'));
    };

    const handleChangePassword = () => {
        if (newPassword !== confirmPassword) {
            alert('Пароли не совпадают');
            return;
        }
    
        if (newPassword.length < 6) {
            alert('Пароль должен содержать хотя бы 6 символов');
            return;
        }
        if (!/[A-Z]/.test(newPassword)) {
            alert('Пароль должен содержать хотя бы одну заглавную букву');
            return;
        }
        if (!/\d/.test(newPassword)) {
            alert('Пароль должен содержать хотя бы одну цифру');
            return;
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
            alert('Пароль должен содержать хотя бы один специальный символ');
            return;
        }
    
        fetch('http://127.0.0.1:8000/api/users/change_password/', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                new_password: newPassword,
                confirm_password: confirmPassword,
            }),
        })
            .then(response => {
                if (response.ok) {
                    alert('Пароль успешно изменён');
                    setNewPassword('');
                    setConfirmPassword('');
                } else {
                    response.json().then(data => alert(data.detail || 'Ошибка изменения пароля'));
                }
            })
            .catch(() => alert('Ошибка при смене пароля'));
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
                <button onClick={handleSave}>
                    <i className="fas fa-save"></i> Сохранить изменения
                </button>
            ) : (
                <button onClick={() => setIsEditing(true)}>
                    <i className="fas fa-edit"></i> Редактировать
                </button>
            )}
            <div>
                <h3>
                    Сменить пароль
                </h3>
                <input
                    type="password"
                    placeholder="Новый пароль"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Подтвердите новый пароль"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button onClick={handleChangePassword}>
                    <i className="fas fa-key"></i> Сменить пароль
                </button>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i> Выйти
            </button>
        </div>
    );
    
};

export default UserInfo;
