import React, { useState, useRef } from 'react';
import './styles/FileUpload.css';

const FileUpload = () => {
    const [file, setFile] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        setFile(droppedFile);
    };

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
    };

    const handleFileUpload = () => {
        if (file) {
            const formData = new FormData();
            formData.append('file', file);

            fetch('http://127.0.0.1:8000/api/files/', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${localStorage.getItem('authToken')}`,
                },
                body: formData,
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Не удалось загрузить файл');
                }
                return response.json();
            })
            .then(data => {
                if (data) {
                    setShowSuccessMessage(true);
                    setFile(null);
                    fileInputRef.current.value = '';

                    setTimeout(() => {
                        setShowSuccessMessage(false);
                    }, 2000);
                    setTimeout(() => {
                        window.location.reload();;
                    }, 2000);
                } else {
                    setErrorMessage('Не удалось загрузить файл');
                }
            })
            .catch((error) => {
                setErrorMessage(error.message || 'Ошибка при загрузке файла');
            });
        }
    };

    return (
        <div className="file-drop-container">
            <div
                className={`file-drop-zone ${dragging ? 'dragging' : ''}`}
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleFileDrop}
            >
                {file ? <p><i className="fas fa-file-alt"></i> Файл: {file.name}</p> : <p><i className="fas fa-cloud-upload-alt"></i> Перетащите файл сюда</p>}
            </div>

            <div className="file-input-wrapper">
                <input
                    ref={fileInputRef}
                    type="file"
                    className="file-input"
                    onChange={handleFileSelect}
                />
                <button onClick={handleFileUpload} className="file-upload-button">
                    <i className="fas fa-upload"></i> Загрузить файл
                </button>
            </div>

            {showSuccessMessage && (
                <div className="success-popup">
                    <p>Файл загружен!</p>
                </div>
            )}

            {errorMessage && (
                <div className="error-popup">
                    <p>{errorMessage}</p>
                </div>
            )}
        </div>
    );
};

export default FileUpload;
