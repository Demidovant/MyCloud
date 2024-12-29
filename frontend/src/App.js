import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AdminPage from './pages/AdminPage';
import RegPage from './pages/RegPage';

const App = () => {
    return (
        <Router>
            <Header />
            <main className="main">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/admin" element={<AdminPage />} />
                    <Route path="/register" element={<RegPage />} />
                </Routes>
            </main>
        </Router>
    );
};

export default App;