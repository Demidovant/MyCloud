import React, { useState } from 'react';
import './styles/GenerateTempLink.css';

const GenerateTempLink = ({ fileId }) => {
    const [tempLink, setTempLink] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false); // Для управления видимостью модалки

    const generateTempLink = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('authToken');
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/files/${fileId}/generate_link/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setTempLink(data.link);
                setModalVisible(true); // Открыть модалку
            } else {
                alert('Ошибка при генерации ссылки');
            }
        } catch (error) {
            console.error('Ошибка при генерации ссылки:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseModal = () => {
        setModalVisible(false); // Закрыть модалку
    };

    return (
        <div>
            <button onClick={generateTempLink} disabled={isLoading}>
                {isLoading ? 'Генерация...' : 'Получить временную ссылку'}
            </button>

            {modalVisible && (
                <div className="modal">
                    <div className="modal-content">
                        <p>Временная ссылка:</p>
                        <a href={tempLink} target="_blank" rel="noopener noreferrer">
                            {tempLink}
                        </a>
                        <button onClick={handleCloseModal}>Закрыть</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GenerateTempLink;
