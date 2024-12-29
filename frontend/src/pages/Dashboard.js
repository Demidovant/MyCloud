import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';
import FileUpload from '../components/FileUpload';

const Dashboard = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [files, setFiles] = useState([]);
    const [summary, setSummary] = useState({ count: 0, totalSize: 0 });
    const [username, setUsername] = useState(null);
    const navigate = useNavigate();
    

    useEffect(() => {
        fetch('http://127.0.0.1:8000/api/users/profile', {
            method: 'GET',
            headers: {
                'Authorization': `Token ${localStorage.getItem('authToken')}`,
            },
        })
        .then(response => response.json())
        .then(data => {
            setUsername(data.username);
            setLoading(false);
        })
        .catch(error => {
            console.log('Ошибка при получении данных о пользователе', error);
            setLoading(false);
        });
    }, []);

    const fetchFiles = async (token) => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/files/', {
                headers: {
                    'Authorization': `Token ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setFiles(data);
                calculateSummary(data);
            } else {
                console.error('Ошибка загрузки файлов');
            }
        } catch (error) {
            console.error('Ошибка при запросе файлов:', error);
        }
    };

    const calculateSummary = (files) => {
        const count = files.length;
        const totalSize = files.reduce((sum, file) => sum + file.size, 0);
        setSummary({ count, totalSize });
    };

    useEffect(() => {
        const token = localStorage.getItem('authToken');

        if (!token) {
            navigate('/login');
            return;
        }

        fetch('http://127.0.0.1:8000/api/token/verify/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`,
            },
            body: JSON.stringify({ token: token })
        })
        .then(response => response.json())
        .then(data => {
            if (data.detail === "Token is valid") {
                setIsAuthenticated(true);
                fetch('http://127.0.0.1:8000/api/users/profile/', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Token ${token}`,
                    },
                })
                .then(res => res.json())
                .then(userData => {
                    if (userData.is_admin) {
                        navigate('/admin');
                    } else {
                        fetchFiles(token);
                    }
                });
            } else {
                navigate('/login');
            }
        })
        .catch(() => {
            navigate('/login');
        })
        .finally(() => {
            setLoading(false);
        });
    }, [navigate]);

    const formatSize = (size) => {
        if (size < 1024) return `${size} B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
        if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} MB`;
        return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    };

    const handleEditComment = (fileId, newComment) => {
        fetch(`http://127.0.0.1:8000/api/files/${fileId}/update_comment/`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Token ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ comment: newComment }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.detail === 'Comment updated successfully') {
                setFiles(prevFiles => 
                    prevFiles.map(f => 
                        f.id === fileId 
                        ? { ...f, comment: newComment }
                        : f
                    )
                );
            } else {
                console.error('Не удалось обновить комментарий:', data);
            }
        })
        .catch(() => alert('Ошибка при редактировании комментария'));
    };


    const handleFileUpload = (newFile) => {
        setFiles((prevFiles) => {
            const updatedFiles = [...prevFiles, newFile];
            calculateSummary(updatedFiles);
            return updatedFiles;
        });
    };


    if (loading) {
        return <div>Загрузка...</div>;
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="container">
            <h1>Добро пожаловать на панель управления пользователя</h1>
            <FileUpload onFileUpload={handleFileUpload} />

            <div className="calculateSummary">
                <p>Количество файлов: {summary.count}, общий объем: {formatSize(summary.totalSize)}</p>
            </div>

            <table className="table">
                <thead>
                    <tr>
                        <th>Имя файла</th>
                        <th>Размер</th>
                        <th>Дата загрузки</th>
                        <th>Последнее изменение</th>
                        <th>Комментарий</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {files.map((file) => (
                        <tr key={file.id}>
                            <td>{file.name}</td>
                            <td>{formatSize(file.size)}</td>
                            <td>{new Date(file.uploaded_at).toLocaleString()}</td>
                            <td>{new Date(file.updated_at).toLocaleString()}</td>
                            <td>
                                <p>{file.comment || "Нет комментария"}</p>
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
                                    Скачать
                                </button>
                                <button
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
                                                    calculateSummary(updatedFiles);
                                                } else {
                                                    alert('Ошибка при удалении файла');
                                                }
                                            });
                                        }
                                    }}
                                >
                                    Удалить
                                </button>
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
                                            .then(updatedFile => {
                                                setFiles(prevFiles => 
                                                    prevFiles.map(f => (f.id === file.id ? { ...f, name: newFileName } : f))
                                                );
                                            })
                                            .catch(() => alert('Ошибка при переименовании файла'));
                                        }
                                    }}
                                >
                                    Переименовать
                                </button>
                                <button
                                    onClick={() => {
                                        const newComment = prompt('Введите новый комментарий:', file.comment || '');
                                        if (newComment !== null) {
                                            handleEditComment(file.id, newComment);
                                        }
                                    }}
                                >
                                    Редактировать комментарий
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="logout">
                {username && <h1>Пользователь: {username}</h1>}
                <button
                    onClick={() => {
                        localStorage.removeItem('authToken');
                        navigate('/login');
                    }}
                >
                    Выйти
                </button>
            </div>
        </div>
    );
};

export default Dashboard;