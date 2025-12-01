import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { usePOS } from '../context/POSContext';
import { Cashier } from '../types';
import { User, Delete, Loader2, Grip, ArrowLeft, ChevronDown, ShieldCheck } from 'lucide-react';

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
      // Small delay to let the UI update
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
    // Keep focus on input to allow continuous typing/pasting
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
    // Removed rounded=true to ensure square avatars as requested
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=random&color=fff&size=128&bold=true`;
  };

  if (loading) return (
    <div className="flex h-screen w-full items-center justify-center bg-[var(--primary)] flex-col gap-4 text-white">
      <Loader2 className="animate-spin h-10 w-10 text-white/80" />
      <p className="text-sm font-medium text-white/80">Chargement...</p>
    </div>
  );

  return (
    <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center p-0 md:p-6 lg:p-8 font-sans">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[60vh] h-[60vh] rounded-full bg-white/10 blur-3xl mix-blend-overlay" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[50vh] h-[50vh] rounded-full bg-black/20 blur-3xl mix-blend-overlay" />
      </div>

      {/* Main Card Container */}
      <div className="relative z-10 w-full max-w-6xl h-full md:h-[85vh] bg-white md:rounded-xl shadow-2xl flex overflow-hidden border border-white/20">
        
        {/* LEFT PANEL: Cashier List */}
        <div className={`
          flex-col w-full md:w-7/12 lg:w-3/5 bg-slate-50 p-6 md:p-10 transition-all duration-300 absolute md:relative inset-0 md:inset-auto z-10
          ${selectedCashier ? '-translate-x-full opacity-0 md:translate-x-0 md:opacity-100 hidden md:flex' : 'translate-x-0 opacity-100 flex'}
        `}>
          
          {/* Header */}
          <div className="flex justify-between items-start shrink-0">
             <div className="flex items-center gap-4">
                {shop?.logo ? (
                  <img src={shop.logo} alt={shop.name} className="h-10 md:h-14 w-auto object-contain" />
                ) : (
                  <div className="flex flex-col">
                      <span className="text-3xl md:text-4xl font-extrabold tracking-tighter text-[var(--primary)]">Peelo</span>
                      {shop?.name && <span className="text-[10px] text-[var(--secondary)] font-bold uppercase tracking-widest ml-0.5 opacity-80">{shop.name}</span>}
                  </div>
                )}
             </div>

             {/* Debug Selector */}
             <div className="relative z-10 opacity-30 hover:opacity-100 transition-opacity bg-white px-2 py-1 rounded border border-gray-200">
                <select 
                  value={chatbotId} 
                  onChange={handleSwitchBot}
                  className="appearance-none bg-transparent text-[#020202] text-xs font-mono cursor-pointer focus:outline-none pr-4"
                >
                  {TEST_BOTS.map(bot => (
                    <option key={bot.id} value={bot.id}>{bot.name}</option>
                  ))}
                  <option value={chatbotId}>Actuel</option>
                </select>
                <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={10} />
              </div>
          </div>

          <div className="flex-1 flex flex-col pt-12 md:pt-16 min-h-0">
            <div className="mb-6 pl-1 shrink-0">
                {/* Softened the black color here as requested */}
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Qui se connecte ?</h2>
                <p className="text-gray-500 mt-2 text-sm md:text-base">Sélectionnez votre profil pour accéder à la caisse.</p>
            </div>

            {/* Cashier Grid - Scrollable area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2 pb-4 pl-1 pt-3">
                {cashiers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-400 border border-dashed border-gray-200 rounded-lg bg-white">
                    <User size={32} className="mb-3 opacity-40" />
                    <p>Aucun caissier actif.</p>
                </div>
                ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4">
                    {cashiers.map(c => (
                    <button
                        key={c._id}
                        onClick={() => {
                        setSelectedCashier(c);
                        setPin('');
                        setError('');
                        }}
                        className={`p-4 rounded-xl flex items-center text-left gap-4 transition-all duration-200 relative group w-full border
                        ${selectedCashier?._id === c._id 
                            ? 'bg-white shadow-lg ring-1 ring-black/5 z-10 border-transparent' 
                            : 'bg-white shadow-sm hover:shadow-md hover:border-[var(--secondary)]/30 border-transparent'
                        }`}
                    >
                        <div className="relative shrink-0">
                            <div className="h-14 w-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                            <img 
                                src={getAvatarUrl(c)} 
                                alt={c.name} 
                                className="h-full w-full object-cover" 
                            />
                            </div>
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className={`font-bold text-sm truncate w-full transition-colors ${selectedCashier?._id === c._id ? 'text-[var(--primary)]' : 'text-gray-700 group-hover:text-[var(--primary)]'}`}>
                                {c.name}
                            </span>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${selectedCashier?._id === c._id ? 'text-[var(--secondary)]' : 'text-gray-400'}`}>
                            {c.role === 'cashier' ? 'Caissier' : c.role}
                            </span>
                        </div>
                    </button>
                    ))}
                </div>
                )}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: PIN Input */}
        <div className={`
            flex-col w-full md:w-5/12 lg:w-2/5 bg-white p-6 md:p-10 relative z-20 shadow-[-10px_0_30px_-5px_rgba(0,0,0,0.05)]
            transition-all duration-300 absolute md:relative inset-0 md:inset-auto flex
            ${selectedCashier ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 md:translate-x-0 md:opacity-100 pointer-events-none md:pointer-events-auto'}
        `}>
          
          {selectedCashier ? (
             <div className="h-full flex flex-col justify-center items-center w-full max-w-[320px] mx-auto animate-in fade-in slide-in-from-right-8 duration-300">
                
                {/* Mobile Back Button */}
                <button 
                  onClick={() => setSelectedCashier(null)}
                  className="md:hidden absolute top-6 left-6 p-2 bg-gray-50 rounded-full text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>

                <div className="text-center mb-8 w-full">
                  {/* Selected User Avatar Small - Removed borders as requested */}
                  <div className="h-16 w-16 rounded-xl mx-auto mb-3 bg-white shadow-sm relative">
                       <img src={getAvatarUrl(selectedCashier)} className="h-full w-full rounded-lg object-cover" alt={selectedCashier.name} />
                       <div className="absolute -bottom-1 -right-1 bg-[var(--primary)] border-2 border-white rounded-full p-1 text-white">
                           <ShieldCheck size={10} />
                       </div>
                  </div>

                  {/* Softened the black here too */}
                  <h3 className="text-xl font-bold text-gray-800">Bon retour</h3>
                  <p className="text-[var(--secondary)] text-sm font-medium">{selectedCashier.name}</p>
                </div>

                {/* PIN Boxes & Hidden Input for Paste */}
                <div className="relative w-full mb-6 group">
                  <input
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="one-time-code"
                    maxLength={4}
                    value={pin}
                    onChange={handleInputChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 caret-transparent"
                    autoFocus
                  />
                  <div className="flex gap-3 justify-center w-full pointer-events-none">
                    {[0, 1, 2, 3].map(i => (
                      <div key={i} className={`
                        w-12 h-14 rounded-lg border flex items-center justify-center text-2xl font-bold transition-all duration-200
                        ${i < pin.length
                          ? 'border-[var(--primary)] bg-[var(--primary)] text-white shadow-lg scale-105' 
                          : 'border-gray-200 bg-gray-50 text-transparent'}
                        ${error ? 'border-red-500 text-red-500 animate-pulse bg-red-50' : ''}
                      `}>
                        •
                      </div>
                    ))}
                  </div>
                </div>
                
                {error && (
                    <div className="mb-4 bg-red-50 text-red-600 px-3 py-1.5 rounded-md text-sm font-medium animate-bounce text-center w-full border border-red-100">
                        {error}
                    </div>
                )}

                {/* Numpad */}
                <div className="grid grid-cols-3 gap-3 w-full">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <button
                      key={num}
                      onClick={() => handlePinInput(num.toString())}
                      className="h-12 w-full rounded-lg bg-gray-50 hover:bg-white text-lg font-bold text-gray-800 hover:text-[var(--primary)] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:bg-gray-100 transition-all border border-transparent hover:border-[var(--primary)]/20"
                    >
                      {num}
                    </button>
                  ))}
                  <div className="opacity-0 pointer-events-none">.</div>
                  <button
                    onClick={() => handlePinInput('0')}
                    className="h-12 w-full rounded-lg bg-gray-50 hover:bg-white text-lg font-bold text-gray-800 hover:text-[var(--primary)] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:bg-gray-100 transition-all border border-transparent hover:border-[var(--primary)]/20"
                  >
                    0
                  </button>
                  <button
                    onClick={handleBackspace}
                    className="h-12 w-full rounded-lg bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 active:bg-red-100 transition-all flex items-center justify-center border border-transparent"
                  >
                    <Delete size={20} />
                  </button>
                </div>
             </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-300">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                    <Grip size={32} className="opacity-20 text-[var(--primary)]" />
                </div>
                <p className="font-medium text-gray-400 max-w-[200px] text-sm">Sélectionnez un profil à gauche pour vous connecter.</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer / Copyright */}
      <div className="absolute bottom-4 text-white/80 text-[10px] font-medium hidden md:block uppercase tracking-wider mix-blend-overlay">
         &copy; {new Date().getFullYear()} Peelo POS &bull; Terminal Sécurisé
      </div>
    </div>
  );
}