import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { usePOS } from '../context/POSContext';
import { Cashier } from '../types';
import { User, Lock, Delete, Loader2, Grip, ArrowRight, Store, ChevronDown } from 'lucide-react';

const TEST_BOTS = [
  { id: '69177048073213c297170052', name: 'Chatbot Principal' },
  { id: '68af25506e65f69f195e2cfc', name: 'Chatbot Test' }
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

  useEffect(() => {
    if (chatbotId) {
      setChatbotId(chatbotId);
      loadData(chatbotId);
    }
  }, [chatbotId]);

  const loadData = async (id: string) => {
    setLoading(true);
    try {
      const [shopData, cashierData] = await Promise.all([
        api.getShop(id),
        api.getCashiers(id)
      ]);
      setShop(shopData!); // Non-null assertion for now, simplified error handling
      setCashiers(cashierData);
    } catch (e) {
      console.error(e);
      setError("Failed to load initial data. Check network connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchBot = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    navigate(`/pos-login/${newId}`);
  };

  const handlePinInput = (num: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
      setError('');
    }
  };

  const handleBackspace = () => setPin(prev => prev.slice(0, -1));
  
  const handleLogin = async () => {
    if (!selectedCashier) return;
    setVerifying(true);
    try {
      const isValid = await api.verifyPin(selectedCashier._id, pin);
      if (isValid) {
        setCashier(selectedCashier);
        navigate(`/pos/${chatbotId}`);
      } else {
        setError("Incorrect PIN code");
        setPin('');
      }
    } catch (e) {
      setError("Verification failed");
    }
    setVerifying(false);
  };

  if (loading) return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50 text-gray-500 flex-col gap-4">
      <Loader2 className="animate-spin h-10 w-10 text-orange-500" />
      <p className="text-sm font-medium">Loading Shop Data...</p>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-gray-50 font-sans overflow-hidden">
      {/* Left (or Top on Mobile): Cashier Selection */}
      <div className="w-full md:w-2/3 p-6 md:p-12 flex flex-col overflow-y-auto border-r border-gray-200 bg-gray-50">
        <div className="mb-6 md:mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
             <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                <div className="bg-orange-500 p-2 rounded-lg text-white"><Store size={24} /></div>
                {shop?.name || 'Peelo POS'}
             </h1>
             <p className="text-gray-500 text-sm md:text-lg">Select your profile to continue</p>
          </div>
          
          {/* Debug / Test Selector */}
          <div className="relative">
            <select 
              value={chatbotId} 
              onChange={handleSwitchBot}
              className="appearance-none bg-white border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium cursor-pointer hover:border-orange-300 transition-colors"
            >
              {TEST_BOTS.map(bot => (
                <option key={bot.id} value={bot.id}>{bot.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
        </div>

        {cashiers.length === 0 ? (
           <div className="flex flex-col items-center justify-center flex-1 text-gray-400">
              <p>No active cashiers found.</p>
              <p className="text-xs mt-2">Check API connection for ID: {chatbotId}</p>
           </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {cashiers.map(c => (
              <button
                key={c._id}
                onClick={() => {
                  setSelectedCashier(c);
                  setPin('');
                  setError('');
                }}
                className={`p-4 md:p-6 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 border-2
                  ${selectedCashier?._id === c._id 
                    ? 'border-orange-500 bg-white shadow-lg shadow-orange-100 ring-4 ring-orange-500/10 scale-105' 
                    : 'border-transparent bg-white shadow-sm hover:shadow-md hover:scale-[1.02]'
                  }`}
              >
                <div className="h-16 w-16 md:h-20 md:w-20 rounded-full overflow-hidden mb-3 md:mb-4 bg-gray-200 ring-2 ring-offset-2 ring-gray-100">
                  {c.avatar ? (
                    <img src={c.avatar} alt={c.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-300">
                      <User className="h-8 w-8 md:h-10 md:w-10 text-white" />
                    </div>
                  )}
                </div>
                <span className="font-semibold text-gray-800 text-base md:text-lg text-center truncate w-full">{c.name}</span>
                <span className="text-xs text-gray-400 uppercase mt-1 tracking-wide">{c.role}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right (or Bottom on Mobile): PIN Entry */}
      <div className={`
          w-full md:w-1/3 bg-white p-6 md:p-12 flex flex-col justify-center shadow-xl z-10 transition-transform duration-300
          ${selectedCashier ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}
          fixed bottom-0 md:relative md:h-full rounded-t-3xl md:rounded-none h-[70vh] md:h-auto
      `}>
        {/* Handle for mobile drawer feel */}
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 md:hidden"></div>

        {selectedCashier ? (
          <div className="w-full max-w-sm mx-auto animate-in slide-in-from-bottom md:slide-in-from-right duration-300 flex flex-col h-full md:h-auto">
            
            {/* Header with back button on mobile */}
            <div className="text-center mb-6 md:mb-8 relative">
              <button 
                onClick={() => setSelectedCashier(null)} 
                className="absolute left-0 top-0 md:hidden p-2 text-gray-400"
              >
                 <ArrowRight className="rotate-180" />
              </button>
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">Hello, {selectedCashier.name.split(' ')[0]}</h2>
              <p className="text-gray-400 mt-1 text-sm md:text-base">Enter PIN to access register</p>
            </div>

            {/* PIN Dots */}
            <div className="flex justify-center gap-4 mb-6 md:mb-8 h-8">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className={`w-3 h-3 md:w-4 md:h-4 rounded-full transition-all duration-200 ${i < pin.length ? 'bg-orange-500 scale-125' : 'bg-gray-200'}`} />
              ))}
            </div>

            {error && <div className="text-red-500 text-center mb-4 font-medium bg-red-50 p-2 rounded-lg text-sm shake">{error}</div>}

            {/* Numpad */}
            <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8 flex-1 md:flex-none content-center">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button
                  key={num}
                  onClick={() => handlePinInput(num.toString())}
                  className="h-14 md:h-16 rounded-xl bg-gray-50 text-2xl font-semibold text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors shadow-sm border border-gray-100"
                >
                  {num}
                </button>
              ))}
              <div className="flex items-center justify-center text-gray-300">
                <Lock size={20} />
              </div>
              <button
                onClick={() => handlePinInput('0')}
                className="h-14 md:h-16 rounded-xl bg-gray-50 text-2xl font-semibold text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors shadow-sm border border-gray-100"
              >
                0
              </button>
              <button
                onClick={handleBackspace}
                className="h-14 md:h-16 rounded-xl bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-500 active:bg-red-100 transition-colors flex items-center justify-center shadow-sm border border-gray-100"
              >
                <Delete size={24} />
              </button>
            </div>

            <button
              onClick={handleLogin}
              disabled={pin.length !== 4 || verifying}
              className={`w-full h-14 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-2 transition-all mt-auto md:mt-0
                ${pin.length === 4 
                  ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-200 shadow-lg' 
                  : 'bg-gray-300 cursor-not-allowed'
                }`}
            >
              {verifying ? <Loader2 className="animate-spin" /> : <>Login <ArrowRight size={20} /></>}
            </button>
          </div>
        ) : (
          <div className="text-center text-gray-400 flex flex-col items-center h-full justify-center">
            <div className="bg-gray-100 p-6 rounded-full mb-4">
              <Grip size={48} className="text-gray-300" />
            </div>
            <p className="text-lg">Select a cashier from the list.</p>
          </div>
        )}
      </div>
    </div>
  );
}