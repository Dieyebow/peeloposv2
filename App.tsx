import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { POSProvider } from './context/POSContext';
import POSLogin from './components/POSLogin';
import POSLayout from './components/POSLayout';
import Unauthorized from './components/Unauthorized';

export default function App() {
  return (
    <POSProvider>
      <HashRouter>
        <Routes>
          <Route path="/pos-login/:chatbotId" element={<POSLogin />} />
          <Route path="/pos/:chatbotId" element={<POSLayout />} />
          <Route path="/" element={<Unauthorized />} />
          <Route path="*" element={<Unauthorized />} />
        </Routes>
      </HashRouter>
    </POSProvider>
  );
}