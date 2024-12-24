import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="container">
            <h1>Добро пожаловать в MyCloud</h1>
            <p>Простое и удобное облачное хранилище для ваших файлов.</p>
            <div className="button-container">
                <Link to="/login">
                    <button id="loginButton">Вход</button>
                </Link>
                <Link to="/register">
                    <button id="registerButton">Регистрация</button>
                </Link>
            </div>
        </div>
    );
};

export default Home;
