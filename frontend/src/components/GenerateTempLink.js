import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './styles/GenerateTempLink.css';

const GenerateTempLink = ({ fileId, className }) => {
    const [tempLink, setTempLink] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

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
                setModalVisible(true);
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
        setModalVisible(false);
    };

    return (
        <div>
        <button className={className} onClick={generateTempLink} disabled={isLoading}>
            {isLoading ?  <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-link"></i>}
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

GenerateTempLink.propTypes = {
    fileId: PropTypes.string.isRequired,
    className: PropTypes.string.isRequired,
};

export default GenerateTempLink;
