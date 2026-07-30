import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export default function Unauthorized() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if there's a saved chatbotId in localStorage
    const savedChatbotId = localStorage.getItem('peelo_pos_chatbotId');

    if (savedChatbotId) {
      // Redirect to the saved chatbot's login page
      navigate(`/pos-login/${savedChatbotId}`);
    }
  }, [navigate]);

  return (
    <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center font-sans overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="relative z-10 text-center px-8 animate-in fade-in zoom-in-95 duration-700">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500 blur-3xl opacity-20 animate-pulse"></div>
            <div className="relative bg-gray-800 rounded-full p-8 border-4 border-red-500/20">
              <ShieldAlert size={80} className="text-red-500" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        <h1 className="text-6xl md:text-7xl font-bold text-white mb-4 tracking-tight">
          403
        </h1>

        <h2 className="text-2xl md:text-3xl font-bold text-white/90 mb-4">
          Accès Non Autorisé
        </h2>

        <p className="text-lg text-gray-400 max-w-md mx-auto mb-8">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </p>

        <div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 text-sm">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          <span className="font-mono">Accès Refusé</span>
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-xs text-gray-600 font-mono">
          Peelo POS · Système Sécurisé
        </p>
      </div>
    </div>
  );
}
