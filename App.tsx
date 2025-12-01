import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { POSProvider } from './context/POSContext';
import POSLogin from './components/POSLogin';
import POSLayout from './components/POSLayout';

export default function App() {
  return (
    <POSProvider>
      <HashRouter>
        <Routes>
          <Route path="/pos-login/:chatbotId" element={<POSLogin />} />
          <Route path="/pos/:chatbotId" element={<POSLayout />} />
          <Route path="/" element={<Navigate to="/pos-login/69177048073213c297170052" replace />} />
        </Routes>
      </HashRouter>
    </POSProvider>
  );
}