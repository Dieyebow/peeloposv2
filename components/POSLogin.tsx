import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { usePOS } from '../context/POSContext';
import { Cashier } from '../types';
import { Loader2, ArrowLeft, ChevronDown, Monitor, Delete, ShoppingBag, Store } from 'lucide-react';

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

  // Focus input when cashier is selected
  useEffect(() => {
    if (selectedCashier) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [selectedCashier]);

  // Global paste handler
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
    setShop(null as any); 
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
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=random&color=fff&size=128&bold=true`;
  };

  if (loading) return (
    <div className="flex h-screen w-full items-center justify-center bg-[#eaeaec] flex-col gap-4">
      <Loader2 className="animate-spin h-10 w-10 text-[var(--primary)]" />
    </div>
  );

  return (
    <div className="fixed inset-0 w-full h-full bg-[#eaeaec] flex items-center justify-center p-4 md:p-8 font-sans">
      
      {/* Main Container */}
      <div className="w-full max-w-[1400px] h-full md:h-[90vh] bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-gray-200">
        
        {/* LEFT PANEL: Shop Branding */}
        <div className="w-full md:w-[45%] bg-slate-50 relative overflow-hidden order-2 md:order-1 flex flex-col p-10 md:p-16 border-r border-gray-100">
          
          <div className="relative z-10 flex flex-col h-full justify-center items-start text-left">
             {/* Shop Logo / Name */}
             <div className="mb-8">
               {shop?.logo ? (
                 <img src={shop.logo} alt={shop.name} className="h-24 md:h-32 object-contain rounded-xl" />
               ) : (
                 <div className="h-24 w-24 md:h-32 md:w-32 bg-[var(--primary)] rounded-2xl flex items-center justify-center text-white shadow-lg mb-4">
                    <Store size={48} />
                 </div>
               )}
               {(!shop?.logo) && <h1 className="text-4xl font-extrabold text-gray-900 mt-4 tracking-tight">{shop?.name || 'Ma Boutique'}</h1>}
             </div>

             {/* Description */}
             <div className="max-w-md">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  {shop?.name ? `Bienvenue chez ${shop.name}` : 'Bienvenue'}
                </h1>
                <p className="text-lg text-gray-500 font-medium leading-relaxed">
                  {shop?.description || "Connectez-vous pour commencer à encaisser vos clients et gérer vos ventes."}
                </p>
             </div>
          </div>

          {/* Bottom Info */}
          <div className="mt-auto pt-12 relative z-10 hidden md:flex items-center justify-between w-full border-t border-gray-200/50">
             <div className="flex items-center gap-2 text-[var(--primary)] font-bold text-xs uppercase tracking-wider">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                Terminal Connecté
             </div>
             <div className="relative inline-block">
                <select 
                  value={chatbotId} 
                  onChange={handleSwitchBot}
                  className="appearance-none bg-transparent text-gray-400 text-xs font-bold cursor-pointer focus:outline-none hover:text-[var(--primary)] transition-colors text-right"
                >
                  {TEST_BOTS.map(bot => (
                    <option key={bot.id} value={bot.id}>{bot.name}</option>
                  ))}
                </select>
             </div>
          </div>
        </div>

        {/* RIGHT PANEL: Interaction */}
        <div className="flex-1 bg-white p-6 md:p-12 flex flex-col items-center justify-center relative order-1 md:order-2">
           
           {/* Header Logo (Peelo) */}
           <div className="absolute top-8 md:top-12 flex items-center gap-3">
              <div className="w-10 h-10 bg-[#114232] rounded-lg flex items-center justify-center shadow-lg transform -rotate-3">
                  <ShoppingBag className="text-white w-5 h-5" strokeWidth={2.5} />
              </div>
              <h2 className="text-3xl font-bold text-[#114232] tracking-tight">Peelo</h2>
           </div>

           {/* Content */}
           {!selectedCashier ? (
             <div className="w-full max-w-2xl text-center animate-in fade-in duration-500 mt-16 md:mt-0">
                 <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Bon après-midi.</h3>
                 <p className="text-gray-400 mb-12 text-sm font-medium">Qui prend la caisse aujourd'hui ?</p>

                 {/* Cashier Grid */}
                 <div className="flex flex-wrap justify-center gap-6">
                    {cashiers.map(c => (
                        <button 
                            key={c._id}
                            onClick={() => setSelectedCashier(c)}
                            className="group flex flex-col items-center gap-3 p-4 rounded-2xl hover:bg-gray-50/80 transition-all duration-200 w-32 md:w-40 border border-transparent hover:border-gray-100"
                        >
                            <div className="relative">
                                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 shadow-sm group-hover:shadow-md transition-all">
                                    <img src={getAvatarUrl(c)} alt={c.name} className="w-full h-full object-cover" />
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-gray-800 text-sm group-hover:text-[#114232] transition-colors">{c.name.split(' ')[0]}</p>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-1">
                                    {c.role === 'cashier' ? 'GÉRANT' : c.role}
                                </p>
                            </div>
                        </button>
                    ))}
                 </div>
             </div>
           ) : (
             <div className="w-full max-w-[320px] text-center animate-in fade-in slide-in-from-right-8 duration-300 mt-16 md:mt-0">
                <button 
                  onClick={() => { setSelectedCashier(null); setPin(''); setError(''); }}
                  className="absolute top-8 left-8 md:top-12 md:left-12 p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
                >
                  <ArrowLeft size={24} />
                </button>

                <div className="w-24 h-24 rounded-2xl overflow-hidden mx-auto mb-6 shadow-lg">
                    <img src={getAvatarUrl(selectedCashier)} className="w-full h-full object-cover" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-800 mb-1">Bonjour, {selectedCashier.name.split(' ')[0]}</h3>
                <p className="text-gray-400 text-sm mb-8 font-medium">Entrez votre code PIN</p>

                {/* Hidden Input */}
                <input
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={pin}
                    onChange={handleInputChange}
                    className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
                    autoFocus
                />

                {/* PIN Display */}
                <div className="flex justify-center gap-4 mb-8" onClick={() => inputRef.current?.focus()}>
                    {[0, 1, 2, 3].map(i => (
                      <div key={i} className={`
                        w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold transition-all duration-200
                        ${i < pin.length
                          ? 'bg-[#114232] text-white shadow-lg shadow-[#114232]/20 scale-105' 
                          : 'bg-white text-transparent border border-gray-200'}
                        ${error ? 'bg-red-50 border-red-200 animate-shake' : ''}
                      `}>
                        {i < pin.length ? '●' : ''}
                      </div>
                    ))}
                </div>

                {error && <p className="text-red-500 text-sm font-bold mb-4 animate-bounce">{error}</p>}

                {/* Custom Numpad */}
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <button
                      key={num}
                      onClick={() => handlePinInput(num.toString())}
                      className="h-16 w-full rounded-xl bg-white border border-gray-100 text-xl font-bold text-gray-800 hover:bg-gray-50 transition-all duration-100 active:scale-95 shadow-sm"
                    >
                      {num}
                    </button>
                  ))}
                  <div className="opacity-0"></div>
                  <button
                    onClick={() => handlePinInput('0')}
                    className="h-16 w-full rounded-xl bg-white border border-gray-100 text-xl font-bold text-gray-800 hover:bg-gray-50 transition-all duration-100 active:scale-95 shadow-sm"
                  >
                    0
                  </button>
                  <button
                    onClick={handleBackspace}
                    className="h-16 w-full rounded-xl bg-white border border-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all duration-100 active:scale-95 shadow-sm flex items-center justify-center"
                  >
                    <Delete size={20} />
                  </button>
                </div>

             </div>
           )}

           <div className="absolute bottom-6 text-[10px] font-bold text-gray-300 uppercase tracking-widest">
              PEELO POS V2.0 • TERMINAL SÉCURISÉ
           </div>
        </div>
      </div>
    </div>
  );
}