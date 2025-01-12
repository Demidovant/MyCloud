import React from 'react';
import { Link } from 'react-router-dom';
import './styles/Home.css';


const Home = () => {
    return (
        <div className="container">
            <h1>
                Добро пожаловать в MyCloud
            </h1>
            <p>Простое и удобное облачное хранилище для ваших файлов.</p>
            <div className="image-container">
            <img 
                src="MyCloud.png" 
                alt="Облачное хранилище" 
                className="main-image" 
            />
            </div>
            <div className="button-container">
                <Link to="/login">
                    <button id="loginButton">
                        <i className="fas fa-sign-in-alt"></i> Вход
                    </button>
                </Link>
                <Link to="/register">
                    <button id="registerButton">
                        <i className="fas fa-user-plus"></i> Регистрация
                    </button>
                </Link>
            </div>
        </div>
    );
};

export default Home;
