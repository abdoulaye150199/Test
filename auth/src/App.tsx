import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './views/Login';
import { RegisterPage } from './views/Register';
import { BoutiqueRegisterPage } from './views/BoutiqueRegister';

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/register/boutique" element={<BoutiqueRegisterPage />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;