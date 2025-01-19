import React, { useState, useEffect } from 'react';
import './styles/ChangePassword.css';

const ChangePassword = ({ token, userId, onClose }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [modalMessage, setModalMessage] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchUserDetails = async (url) => {
        try {
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Token ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUsername(data.full_name || data.username);
            } else {
                setUsername('Неизвестный пользователь');
            }
        } catch (error) {
            console.error('Ошибка загрузки данных пользователя:', error);
            setUsername('Ошибка загрузки');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const checkUserPermissions = async () => {
            try {
                const profileResponse = await fetch('http://127.0.0.1:8000/api/users/profile', {
                    headers: {
                        'Authorization': `Token ${token}`,
                    },
                });

                if (profileResponse.ok) {
                    const profileData = await profileResponse.json();
                    if (profileData.is_superuser || profileData.is_staff) {
                        fetchUserDetails(`http://127.0.0.1:8000/api/users/${userId}/`);
                    } else {
                        fetchUserDetails('http://127.0.0.1:8000/api/users/profile');
                    }
                } else {
                    setUsername('Ошибка проверки прав');
                    setLoading(false);
                }
            } catch (error) {
                console.error('Ошибка проверки прав пользователя:', error);
                setUsername('Ошибка проверки прав');
                setLoading(false);
            }
        };

        checkUserPermissions();
    }, [token, userId]);

    const handleChangePassword = () => {
        if (newPassword !== confirmPassword) {
            setModalMessage('Пароли не совпадают');
            return;
        }

        fetch(`http://127.0.0.1:8000/api/users/${userId}/change_password/`, {
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
                    setModalMessage('Пароль успешно изменён');
                    setTimeout(() => {
                        onClose();
                    }, 1000);
                } else {
                    response.json().then(data => setModalMessage(data.detail || 'Ошибка изменения пароля'));
                }
                setNewPassword('');
                setConfirmPassword('');
            })
            .catch(() => {
                setModalMessage('Ошибка при смене пароля');
            });
    };

    const handleCancel = () => {
        setNewPassword('');
        setConfirmPassword('');
        onClose();
    };

    const handleCloseErrorModal = () => {
        setModalMessage('');
    };

    return (
        <div className="change-password">
            <h3>
                {loading ? 'Загрузка...' : `Сменить пароль для ${username}`}
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
            <button className="change-button" onClick={handleChangePassword}>
                <i className="fas fa-key"></i> Сменить пароль
            </button>
            <button className="cancel-button" onClick={handleCancel}>
                Отмена
            </button>

            {modalMessage && (
                <div className="modal">
                    <div className="modal-content">
                        <p>{modalMessage}</p>
                        <button onClick={handleCloseErrorModal}>Закрыть</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChangePassword;
