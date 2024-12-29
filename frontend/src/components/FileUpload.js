import React, { useState, useRef } from 'react';
import './FileUpload.css';

const FileUpload = ({ onFileUpload }) => {
    const [file, setFile] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
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
            .then(response => response.json())
            .then(data => {
                if (data) {
                    setShowSuccessMessage(true);
                    setFile(null);
                    fileInputRef.current.value = '';
                    onFileUpload(data);

                    setTimeout(() => {
                        setShowSuccessMessage(false);
                    }, 2000);

                } else {
                    alert('Не удалось загрузить файл');
                }
            })
            .catch(() => alert('Ошибка при загрузке файла'));
        }
    };

    return (
        <div>
            <div
                className={`file-drop-zone ${dragging ? 'dragging' : ''}`}
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleFileDrop}
            >
                {file ? <p>Файл: {file.name}</p> : <p>Перетащите файл сюда</p>}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                className="file-input"
                onChange={handleFileSelect}
            />

            <button onClick={handleFileUpload} className="file-upload-button">
                Загрузить файл
            </button>

            {showSuccessMessage && (
                <div className="success-popup">
                    <p>Файл загружен!</p>
                </div>
            )}

        </div>
    );
};

export default FileUpload;
