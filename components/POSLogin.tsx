import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { usePOS } from '../context/POSContext';
import { Cashier } from '../types';
import { Loader2, ArrowLeft, ArrowRight, Delete, ShoppingBag, Store, Lock } from 'lucide-react';

const TEST_BOTS = [
  { id: '69177048073213c297170052', name: 'Boutique 1' },
  { id: '68af25506e65f69f195e2cfc', name: 'Boutique 2' }
];

export default function POSLogin() {
  const { chatbotId } = useParams<{ chatbotId: string }>();
  const { setShop, setCashier, setChatbotId, shop } = usePOS();
  const navigate = useNavigate();

  const [cashiers, setCashiers] = useState<Cashier[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCashier, setSelectedCashier] = useState<Cashier | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (chatbotId) {
      setChatbotId(chatbotId);
      loadData(chatbotId);
    }
  }, [chatbotId]);

  useEffect(() => {
    if (selectedCashier) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [selectedCashier]);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
        if (!selectedCashier) return;
        e.preventDefault();
        const pastedData = e.clipboardData?.getData('text') || '';
        const numericData = pastedData.replace(/\D/g, '').slice(0, 4);
        
        if (numericData) {
            setPin(numericData);
            if (numericData.length === 4) {
                setTimeout(() => submitLogin(numericData), 300);
            }
        }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [selectedCashier]);

  const loadData = async (id: string) => {
    setLoading(true);
    setCashiers([]);
    
    try {
      const [shopData, cashierData] = await Promise.all([
        api.getShop(id),
        api.getCashiers(id)
      ]);
      if (shopData) setShop(shopData);
      setCashiers(cashierData);
    } catch (e) {
      console.error(e);
      setError("Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchBot = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    navigate(`/pos-login/${newId}`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPin(val);
    setError('');
    
    if (val.length === 4 && selectedCashier) {
      setTimeout(() => submitLogin(val), 300);
    }
  };

  const handlePinInput = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError('');
      if (newPin.length === 4 && selectedCashier) {
        setTimeout(() => submitLogin(newPin), 300);
      }
    }
    inputRef.current?.focus();
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    inputRef.current?.focus();
  };
  
  const submitLogin = async (pinCode: string) => {
    if (!selectedCashier) return;
    setVerifying(true);
    try {
      const isValid = await api.verifyPin(selectedCashier._id, pinCode);
      if (isValid) {
        setCashier(selectedCashier);
        navigate(`/pos/${chatbotId}`);
      } else {
        setError("Code PIN incorrect");
        setPin('');
        inputRef.current?.focus();
      }
    } catch (e) {
      setError("Échec de vérification");
      setPin('');
      inputRef.current?.focus();
    }
    setVerifying(false);
  };

  const getAvatarUrl = (c: Cashier) => {
    if (c.avatar) return c.avatar;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=random&color=fff&size=128&bold=true&rounded=true`;
  };

  if (loading) return (
    <div className="flex h-screen w-full items-center justify-center bg-[#eaeaec] flex-col gap-4 font-sans">
      <Loader2 className="animate-spin h-10 w-10 text-[var(--primary)]" />
    </div>
  );

  return (
    <div className="fixed inset-0 w-full h-full bg-[#f8fafc] flex items-center justify-center font-sans overflow-hidden">
      
      {/* Background with Split */}
      <div className="absolute inset-0 flex">
          {/* Left Side - Brand Color */}
          <div 
             className="w-full md:w-1/2 h-full flex flex-col items-center justify-center p-12 text-white relative transition-all duration-700 ease-in-out"
             style={{ backgroundColor: shop?.style?.primaryColor || '#00c58e' }}
          >
              <div className="absolute inset-0 bg-black/5 pattern-grid-lg opacity-10"></div>
              
              <div className="relative z-10 flex flex-col items-center animate-in slide-in-from-left-10 duration-700 fade-in">
                  <div className="w-48 h-48 bg-white rounded-full p-2 shadow-2xl mb-8 flex items-center justify-center ring-8 ring-white/10">
                      {shop?.logo ? (
                          <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover rounded-full" />
                      ) : (
                          <div className="w-full h-full rounded-full bg-gray-50 flex items-center justify-center text-[var(--primary)]">
                              <Store size={64} />
                          </div>
                      )}
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center tracking-tight">{shop?.name || 'Peelo POS'}</h1>
                  <p className="text-xl opacity-90 text-center font-medium max-w-md">{shop?.description || 'Bienvenue sur votre terminal de vente.'}</p>
              </div>

              {/* Footer Info */}
              <div className="absolute bottom-8 left-8 text-xs font-semibold opacity-60 flex gap-4">
                  <span>TERMINAL: {chatbotId?.slice(0,8)}</span>
                  <span>•</span>
                  <span>V2.4.0</span>
              </div>
          </div>

          {/* Right Side - Interaction */}
          <div className="hidden md:flex w-1/2 h-full bg-white flex-col items-center justify-center p-12 relative">
             <div className="absolute top-8 right-8">
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-100">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-xs font-bold text-gray-500">Système Connecté</span>
                </div>
             </div>
             
             <div className="w-full max-w-md">
                 {!selectedCashier ? (
                     <div className="animate-in slide-in-from-right-8 duration-500 fade-in">
                         <div className="mb-10">
                             <h2 className="text-3xl font-bold text-gray-900 mb-2">Connexion Caissier</h2>
                             <p className="text-gray-500">Veuillez sélectionner votre profil pour commencer.</p>
                         </div>
                         
                         <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                             {cashiers.map(c => (
                                 <button
                                     key={c._id}
                                     onClick={() => setSelectedCashier(c)}
                                     className="w-full flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-white hover:border-[var(--secondary)] hover:bg-[var(--secondary)]/5 hover:shadow-lg transition-all duration-200 group text-left"
                                 >
                                     <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200 group-hover:border-[var(--secondary)] transition-colors">
                                         <img src={getAvatarUrl(c)} className="w-full h-full object-cover" />
                                     </div>
                                     <div className="flex-1">
                                         <h3 className="font-bold text-gray-900 text-lg group-hover:text-[var(--secondary)] transition-colors">{c.name}</h3>
                                         <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{c.role}</span>
                                     </div>
                                     <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[var(--secondary)] group-hover:text-white transition-colors">
                                         <ArrowRight size={16} />
                                     </div>
                                 </button>
                             ))}
                         </div>
                     </div>
                 ) : (
                     <div className="animate-in zoom-in-95 duration-300">
                         <button 
                             onClick={() => setSelectedCashier(null)}
                             className="mb-8 flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors font-medium"
                         >
                             <ArrowLeft size={18} /> Retour
                         </button>

                         <div className="text-center mb-8">
                             <div className="w-24 h-24 rounded-2xl mx-auto mb-4 overflow-hidden shadow-xl ring-4 ring-gray-50">
                                 <img src={getAvatarUrl(selectedCashier)} className="w-full h-full object-cover" />
                             </div>
                             <h3 className="text-2xl font-bold text-gray-900">Bonjour, {selectedCashier.name.split(' ')[0]}</h3>
                             <div className="flex items-center justify-center gap-2 mt-2 text-gray-400 text-sm font-medium">
                                 <Lock size={14} /> Accès sécurisé
                             </div>
                         </div>

                         {/* PIN Display */}
                         <div className="flex justify-center gap-4 mb-8 relative z-20" onClick={() => inputRef.current?.focus()}>
                             {[0, 1, 2, 3].map(i => (
                                 <div key={i} className={`
                                     w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all duration-200
                                     ${i < pin.length 
                                         ? 'border-[var(--secondary)] bg-[var(--secondary)] text-white scale-110 shadow-lg' 
                                         : 'border-gray-200 bg-gray-50'}
                                     ${error ? 'border-red-500 animate-shake' : ''}
                                 `}>
                                     {i < pin.length && <div className="w-3 h-3 rounded-full bg-white"></div>}
                                 </div>
                             ))}
                         </div>

                         {error && <p className="text-center text-red-500 font-bold mb-6 text-sm">{error}</p>}

                         <input
                             ref={inputRef}
                             type="text"
                             inputMode="numeric"
                             maxLength={4}
                             value={pin}
                             onChange={handleInputChange}
                             className="absolute inset-0 opacity-0 z-10"
                             autoFocus
                         />

                         {/* Numpad */}
                         <div className="grid grid-cols-3 gap-3 relative z-20">
                             {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(num => (
                                 <button
                                     key={num}
                                     onClick={() => handlePinInput(num.toString())}
                                     className={`
                                         h-16 rounded-xl font-bold text-2xl transition-all shadow-sm active:scale-95 border border-gray-100
                                         ${num === 0 ? 'col-start-2' : ''}
                                         bg-white text-gray-900 hover:bg-[var(--secondary)] hover:text-white hover:border-[var(--secondary)]
                                     `}
                                 >
                                     {num}
                                 </button>
                             ))}
                             <button 
                                 onClick={handleBackspace}
                                 className="h-16 rounded-xl font-bold text-xl flex items-center justify-center bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors col-start-3 row-start-4 active:scale-95 border border-transparent"
                             >
                                 <Delete size={24} />
                             </button>
                         </div>
                     </div>
                 )}
             </div>
             
             {/* Mobile Dev Switcher */}
             <div className="absolute bottom-4 right-4">
                 <select 
                   value={chatbotId} 
                   onChange={handleSwitchBot}
                   className="text-xs bg-gray-50 border border-gray-200 rounded p-1 text-gray-400"
                 >
                   {TEST_BOTS.map(bot => (
                     <option key={bot.id} value={bot.id}>{bot.name}</option>
                   ))}
                 </select>
             </div>
          </div>
      </div>
      
      {/* Mobile Only View (Simplified) */}
      <div className="md:hidden absolute inset-0 bg-[var(--primary)] flex flex-col items-center justify-center text-white p-8 text-center">
          <Store size={48} className="mb-4" />
          <h2 className="text-2xl font-bold">Mode Bureau Requis</h2>
          <p className="opacity-80 mt-2">Veuillez utiliser une tablette ou un ordinateur pour accéder au POS.</p>
      </div>
    </div>
  );
}