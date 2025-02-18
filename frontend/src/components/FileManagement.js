import GenerateTempLink from './GenerateTempLink';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { API_BASE_URL } from "../config";
import './styles/FileManagement.css';

const FileManagement = ({ refresh }) => {
    const { id: urlUserId } = useParams();
    const [files, setFiles] = useState([]);
    const [fileStats, setFileStats] = useState({ fileCount: 0, totalFileSize: 0 });
    const [userId, setUserId] = useState(null);
    const [isGridView, setIsGridView] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

    // Функция для получения данных пользователя
    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/api/users/profile/`, {
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
            const response = await fetch(`${API_BASE_URL}/api/files/?user_id=${userId}`, {
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
        const savedView = localStorage.getItem('viewMode');
        if (savedView) {
            setIsGridView(savedView === 'grid');
        }

        if (urlUserId) {
            setUserId(urlUserId);
            fetchFiles(urlUserId);  // Загружаем файлы для пользователя, если id передано в URL
        } else {
            fetchUserProfile();  // Иначе получаем текущего пользователя
        }
    }, [urlUserId]);

    // Функция для обрезания имени файла до 30 символов
    const truncateFileName = (name) => {
        return name.length > 30 ? name.slice(0, 30) + '...' : name;
    };

    const toggleView = () => {
        const newViewMode = !isGridView;
        setIsGridView(newViewMode);
        localStorage.setItem('viewMode', newViewMode ? 'grid' : 'table');
    };

    useEffect(() => {
        if (userId) fetchFiles(userId);
    }, [refresh, userId]);

    // Сортировка файлов
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Функция для отображения стрелок сортировки
    const getSortArrow = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === 'asc' 
            ? <> <i className="fas fa-arrow-up"></i></> 
            : <> <i className="fas fa-arrow-down"></i></>;
        }
        return null;
    };

    // Сортированный список файлов
    const sortedFiles = React.useMemo(() => {
        return [...files].sort((a, b) => {
            if (!sortConfig.key) return 0;
            const aValue = a[sortConfig.key] || '';
            const bValue = b[sortConfig.key] || '';

            if (sortConfig.key.includes('_at')) {
                const aDate = new Date(aValue).getTime();
                const bDate = new Date(bValue).getTime();
                return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate;
            }

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
            }

            const aString = String(aValue).toLowerCase();
            const bString = String(bValue).toLowerCase();

            if (/^\d+$/.test(aString) && /^\d+$/.test(bString)) {
                const aNum = parseInt(aString, 10);
                const bNum = parseInt(bString, 10);
                return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
            }

            return sortConfig.direction === 'asc' 
                ? aString.localeCompare(bString) 
                : bString.localeCompare(aString);
            });
    }, [files, sortConfig]);

    return (
        <div className="file-management-container">
            <div className="file-stats">
                <p>Общее количество файлов: {fileStats.fileCount}</p>
                <p>Общий объем файлов: {formatSize(fileStats.totalFileSize)}</p>
            </div>

            <button className="toggle-view-button" onClick={toggleView}>
                {isGridView ? <i className="fas fa-th"></i> : <i className="fas fa-table"></i>}
            </button>

            {/* Отображение файлов в табличном виде */}
            {!isGridView ? (
            <table>
                <thead>
                    <tr>
                        <th onClick={() => handleSort('name')}>
                            Имя файла{getSortArrow('name')}
                        </th>
                        <th onClick={() => handleSort('size')}>
                            Размер{getSortArrow('size')}
                        </th>
                        <th onClick={() => handleSort('uploaded_at')}>
                            Дата загрузки{getSortArrow('uploaded_at')}
                        </th>
                        <th onClick={() => handleSort('updated_at')}>
                            Дата обновления{getSortArrow('updated_at')}
                        </th>
                        <th onClick={() => handleSort('last_downloaded_at')}>
                            Дата последнего скачивания{getSortArrow('last_downloaded_at')}
                        </th>
                        <th onClick={() => handleSort('comment')}>
                            Комментарий{getSortArrow('comment')}
                        </th>
                        <th>Действия</th>
                        <th>Временная ссылка</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedFiles.map((file) => (
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
                                            fetch(`${API_BASE_URL}/api/files/${file.id}/rename_file/`, {
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
                            <td>{file.last_downloaded_at ? new Date(file.last_downloaded_at).toLocaleString() : 'Никогда'}</td>
                            <td>{file.comment || "Нет комментария"}
                                <br />
                                <button
                                    onClick={() => {
                                        const newComment = prompt('Введите новый комментарий:', file.comment || '');
                                        if (newComment !== null) {
                                            fetch(`${API_BASE_URL}/api/files/${file.id}/update_comment/`, {
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
                                    fetch(`${API_BASE_URL}/api/files/${file.id}/download/`, {
                                        method: 'GET',
                                        headers: {
                                            'Authorization': `Token ${localStorage.getItem('authToken')}`,
                                        },
                                    })
                                    .then(response => {
                                        if (response.ok) {
                                            fetchFiles(userId);
                                            const contentType = response.headers.get('Content-Type');
                                            if (contentType && contentType.includes('text')) {
                                                return response.text().then(text => ({ text, contentType }));
                                            } else if (contentType && (contentType.includes('pdf') || contentType.includes('image'))) {
                                                return response.blob().then(blob => ({ blob, contentType }));
                                            } else {
                                                throw new Error('Невозможно отобразить этот файл в браузере');
                                            }
                                        } else {
                                            throw new Error('Ошибка при получении файла');
                                        }
                                    })
                                    .then(({ text, blob, contentType }) => {
                                        if (text) {
                                            const encodedText = new Blob([text], { type: contentType });
                                            const url = window.URL.createObjectURL(encodedText);
                                            const newWindow = window.open(url, '_blank');
                                            if (!newWindow) {
                                                alert('Не удалось открыть файл в новой вкладке');
                                            }
                                        } else if (blob) {
                                            const url = window.URL.createObjectURL(blob);
                                            const newWindow = window.open(url, '_blank');
                                            if (!newWindow) {
                                                alert('Не удалось открыть файл в новой вкладке');
                                            }
                                        }
                                    })
                                    .catch(err => alert(err.message));
                                }}
                            >
                                <i className="fas fa-eye"></i> Просмотр
                            </button>
                                <button
                                    onClick={() => {
                                        fetch(`${API_BASE_URL}/api/files/${file.id}/download/`, {
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
                                            fetchFiles(userId);
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
                                    fetch(`${API_BASE_URL}/api/files/${file.id}/delete_file/`, {
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
                            <GenerateTempLink fileId={file.id} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            ) : (
                /* Отображение файлов в плиточном виде */
                <div className="grid-view">
                    {files.map((file) => (
                        <div className="file-card" key={file.id}>
                            <div className="file-name">{truncateFileName(file.name)}</div>
                            <div className="file-actions">
                            <button className="view-button"
                                onClick={() => {
                                    fetch(`${API_BASE_URL}/api/files/${file.id}/download/`, {
                                    method: 'GET',
                                    headers: {
                                        'Authorization': `Token ${localStorage.getItem('authToken')}`,
                                    },
                                    })
                                    .then(response => {
                                        if (response.ok) {
                                        const contentType = response.headers.get('Content-Type');
                                        if (contentType && contentType.includes('text')) {
                                            return response.text().then(text => ({ text, contentType }));
                                        } else if (contentType && (contentType.includes('pdf') || contentType.includes('image'))) {
                                            return response.blob().then(blob => ({ blob, contentType }));
                                        } else {
                                            throw new Error('Невозможно отобразить этот файл в браузере');
                                        }
                                        } else {
                                        throw new Error('Ошибка при получении файла');
                                        }
                                    })
                                    .then(({ text, blob, contentType }) => {
                                        if (text) {
                                        const encodedText = new Blob([text], { type: contentType });
                                        const url = window.URL.createObjectURL(encodedText);
                                        const newWindow = window.open(url, '_blank');
                                        if (!newWindow) {
                                            alert('Не удалось открыть файл в новой вкладке');
                                        }
                                        } else if (blob) {
                                        const url = window.URL.createObjectURL(blob);
                                        const newWindow = window.open(url, '_blank');
                                        if (!newWindow) {
                                            alert('Не удалось открыть файл в новой вкладке');
                                        }
                                        }
                                    })
                                    .catch(err => alert(err.message));
                                }}
                                >
                                <i className="fas fa-eye"></i>
                                </button>
                                <button className="download-button"
                                    onClick={() => {
                                        fetch(`${API_BASE_URL}/api/files/${file.id}/download/`, {
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
                                    <i className="fas fa-download"></i>
                                </button>
                                <GenerateTempLink fileId={file.id} className="generate-link-button" />
                            </div>
                            {formatSize(file.size)}
                        </div>
                    ))}
                </div>
            )}

            {files.length === 0 && <p className="no-files-message">Нет загруженных файлов</p>}

        </div>
    );
};

FileManagement.propTypes = {
    refresh: PropTypes.bool.isRequired,
};

export default FileManagement;