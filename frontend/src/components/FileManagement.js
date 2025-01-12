import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './styles/FileManagement.css';

const FileManagement = () => {
    const { id: urlUserId } = useParams();
    const [files, setFiles] = useState([]);
    const [fileStats, setFileStats] = useState({ fileCount: 0, totalFileSize: 0 });
    const [userId, setUserId] = useState(null);
    const [tempLink, setTempLink] = useState({});

    // Функция для получения данных пользователя
    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('http://127.0.0.1:8000/api/users/profile/', {
                headers: {
                    'Authorization': `Token ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUserId(data.id);
                if (!urlUserId) {
                    fetchFiles(data.id);
                }
            } else {
                console.error('Ошибка при загрузке профиля');
            }
        } catch (error) {
            console.error('Ошибка при запросе профиля:', error);
        }
    };

    // Функция для загрузки файлов пользователя по его userId
    const fetchFiles = async (userId) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`http://127.0.0.1:8000/api/files/?user_id=${userId}`, {
                headers: {
                    'Authorization': `Token ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setFiles(data);
                calculateFileStats(data);
            } else {
                console.error('Ошибка при загрузке файлов');
            }
        } catch (error) {
            console.error('Ошибка при запросе файлов:', error);
        }
    };

    // Функция для подсчета статистики
    const calculateFileStats = (files) => {
        const totalFileSize = files.reduce((sum, file) => sum + file.size, 0);
        setFileStats({ fileCount: files.length, totalFileSize });
    };

    // Функция для форматирования размера файла
    const formatSize = (sizeInBytes) => {
        if (sizeInBytes === 0) return '0 B';
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(sizeInBytes) / Math.log(1024));
        return (sizeInBytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
    };

    // Получаем данные о пользователе при монтировании компонента
    useEffect(() => {
        if (urlUserId) {
            setUserId(urlUserId);
            fetchFiles(urlUserId);  // Загружаем файлы для пользователя, если id передано в URL
        } else {
            fetchUserProfile();  // Иначе получаем текущего пользователя
        }
    }, [urlUserId]);


    // Функция для генерации временной ссылки
    const generateTempLink = async (fileId) => {
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
                setTempLink((prevState) => ({
                    ...prevState,
                    [fileId]: data.link,
                }));
            } else {
                alert('Ошибка при генерации ссылки');
            }
        } catch (error) {
            console.error('Ошибка при генерации ссылки:', error);
        }
    };

    return (
        <div className="file-management-container">
            <div className="file-stats">
                <p>Общее количество файлов: {fileStats.fileCount}</p>
                <p>Общий объем файлов: {formatSize(fileStats.totalFileSize)}</p>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Имя файла</th>
                        <th>Размер</th>
                        <th>Дата загрузки</th>
                        <th>Дата обновления</th>
                        <th>Комментарий</th>
                        <th>Действия</th>
                        <th>Временная ссылка</th>
                    </tr>
                </thead>
                <tbody>
                    {files
                        .slice()
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((file) => (
                            <tr key={file.id}>
                                <td>{file.name}
                                    <br />
                                    <button
                                        onClick={() => {
                                            const fileNameWithoutExtension = file.name.slice(0, file.name.lastIndexOf('.'));
                                            const fileExtension = file.name.slice(file.name.lastIndexOf('.'));
                                            const newName = prompt('Введите новое имя файла:', fileNameWithoutExtension);

                                            if (newName) {
                                                const newFileName = newName + fileExtension;
                                                fetch(`http://127.0.0.1:8000/api/files/${file.id}/rename_file/`, {
                                                    method: 'PATCH',
                                                    headers: {
                                                        'Authorization': `Token ${localStorage.getItem('authToken')}`,
                                                        'Content-Type': 'application/json',
                                                    },
                                                    body: JSON.stringify({ name: newFileName }),
                                                })
                                                    .then(response => response.json())
                                                    .then(() => {
                                                        const updatedFiles = files.map(f => (f.id === file.id ? { ...f, name: newFileName } : f));
                                                        setFiles(updatedFiles);
                                                        fetchFiles(userId);
                                                    })
                                                    .catch(() => alert('Ошибка при переименовании файла'));
                                            }
                                        }}
                                    >
                                        <i className="fas fa-edit"></i> Переименовать
                                    </button>
                                </td>
                                <td>{formatSize(file.size)}</td>
                                <td>{new Date(file.uploaded_at).toLocaleString()}</td>
                                <td>{new Date(file.updated_at).toLocaleString()}</td>
                                <td>{file.comment || "Нет комментария"}
                                    <br />
                                    <button
                                        onClick={() => {
                                            const newComment = prompt('Введите новый комментарий:', file.comment || '');
                                            if (newComment !== null) {
                                                fetch(`http://127.0.0.1:8000/api/files/${file.id}/update_comment/`, {
                                                    method: 'PATCH',
                                                    headers: {
                                                        'Authorization': `Token ${localStorage.getItem('authToken')}`,
                                                        'Content-Type': 'application/json',
                                                    },
                                                    body: JSON.stringify({ comment: newComment }),
                                                })
                                                    .then(response => {
                                                        if (response.ok) {
                                                            const updatedFiles = files.map(f => (f.id === file.id ? { ...f, comment: newComment } : f));
                                                            setFiles(updatedFiles);
                                                            fetchFiles(userId);
                                                        } else {
                                                            alert('Ошибка при обновлении комментария');
                                                        }
                                                    });
                                            }
                                        }}
                                    >
                                        <i className="fas fa-comment-dots"></i> Редактировать комментарий
                                    </button>
                                </td>
                                <td>
                                    <button
                                        onClick={() => {
                                            fetch(`http://127.0.0.1:8000/api/files/${file.id}/download/`, {
                                                method: 'GET',
                                                headers: {
                                                    'Authorization': `Token ${localStorage.getItem('authToken')}`,
                                                },
                                            })
                                                .then(response => {
                                                    if (response.ok) {
                                                        return response.blob();
                                                    } else {
                                                        throw new Error('Ошибка при скачивании файла');
                                                    }
                                                })
                                                .then(blob => {
                                                    const link = document.createElement('a');
                                                    const url = window.URL.createObjectURL(blob);
                                                    link.href = url;
                                                    link.download = file.name;
                                                    link.click();
                                                    window.URL.revokeObjectURL(url);
                                                })
                                                .catch(err => alert(err.message));
                                        }}
                                    >
                                        <i className="fas fa-download"></i> Скачать
                                    </button>
                                    <button
                                    className="delete-button"
                                    onClick={() => {
                                        if (window.confirm(`Вы уверены, что хотите удалить файл ${file.name}?`)) {
                                        fetch(`http://127.0.0.1:8000/api/files/${file.id}/delete_file/`, {
                                            method: 'DELETE',
                                            headers: {
                                            'Authorization': `Token ${localStorage.getItem('authToken')}`,
                                            },
                                        })
                                        .then(response => {
                                            if (response.ok) {
                                            const updatedFiles = files.filter((f) => f.id !== file.id);
                                            setFiles(updatedFiles);
                                            calculateFileStats(updatedFiles);
                                            } else {
                                            alert('Ошибка при удалении файла');
                                            }
                                        });
                                        }
                                    }}
                                    >
                                    <i className="fas fa-trash-alt"></i> Удалить
                                    </button>

                                </td>
                                <td>
                                    <button
                                        onClick={() => generateTempLink(file.id)}
                                    >
                                        <i className="fas fa-link"></i> Получить временную ссылку
                                    </button>

                                    {tempLink[file.id] && (
                                        <div>
                                            <p><i className="fas fa-external-link-alt"></i> Временная ссылка: <a href={tempLink[file.id]} target="_blank" rel="noopener noreferrer">{tempLink[file.id]}</a></p>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>

            {files.length === 0 && <p className="no-files-message">Нет загруженных файлов</p>}
        </div>
    );
};

export default FileManagement;
