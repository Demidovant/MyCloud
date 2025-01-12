import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AdminPage from './pages/AdminPage';
import RegPage from './pages/RegPage';
import UserManagement from './components/UserManagement';
import UserFilesPage from './pages/UserFilesPage';


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
                    <Route path="/admin/users" element={<UserManagement />} />
                    <Route path="/register" element={<RegPage />} />
                    <Route path="/admin/userfiles/:id" element={<UserFilesPage />} />
                </Routes>
            </main>
        </Router>
    );
};

export default App;