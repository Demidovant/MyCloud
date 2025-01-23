import React, { useState } from 'react';
import './styles/FileUpload.css';

const FileUpload = () => {
    const [file, setFile] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [comment, setComment] = useState('');
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

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
                    updateFileComment(data.id);
                    setShowSuccessMessage(true);
                    setFile(null);

                    setTimeout(() => {
                        setShowSuccessMessage(false);
                        window.location.reload();
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

    const updateFileComment = (fileId) => {
        if (comment.trim() === '') return;

        fetch(`http://127.0.0.1:8000/api/files/${fileId}/update_comment/`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Token ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ comment }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Не удалось обновить комментарий');
            }
        })
        .catch(error => {
            setErrorMessage(error.message || 'Ошибка при обновлении комментария');
        });
    };

    return (
        <div className="file-drop-container">
            <div
                className={`file-drop-zone ${dragging ? 'dragging' : ''}`}
                onClick={() => document.getElementById('fileInput').click()}
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleFileDrop}
            >
                {file ? <p><i className="fas fa-file-alt"></i> Файл: {file.name}</p> : <p><i className="fas fa-cloud-upload-alt"></i> Для загрузки файла нажмите на это поле или перетащите сюда файл</p>}
            </div>

            <input
                id="fileInput"
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
            />

            <div className="file-actions">
                <textarea className="file-comment"
                    placeholder="Введите комментарий к файлу"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
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
