import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import Footer from './components/Footer';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';

const App = () => {
  return (
    <Router>
      <div className="main">
        <Header />
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
        
        <Footer />
      </div>
    </Router>
  );
};

export default App;
