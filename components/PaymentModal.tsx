import React, { useState, useMemo } from 'react';
import { usePOS } from '../context/POSContext';
import { PaymentMethod, TransactionPayload } from '../types';
import { X, Check, Smartphone, CreditCard, Banknote, Wallet, ArrowRight, Delete, Trash2 } from 'lucide-react';
import { api } from '../services/api';

interface Props {
  total: number;
  onClose: () => void;
  onSuccess: (txn: any) => void;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'cash', name: 'Espèces', icon: 'cash', color: '#000000' },
  { id: 'orange_money', name: 'Orange Money', icon: 'om', color: '#ff6600' },
  { id: 'wave', name: 'Wave', icon: 'wave', color: '#1e88e5' },
  { id: 'card', name: 'Carte', icon: 'card', color: '#6366f1' },
];

export default function PaymentModal({ total, onClose, onSuccess }: Props) {
  const { cart, cashier, chatbotId, clearCart, shop } = usePOS();
  const [payments, setPayments] = useState<Record<string, number>>({});
  const [activeMethod, setActiveMethod] = useState<string>('cash');
  const [processing, setProcessing] = useState(false);

  // Calculations
  const totalPaid = useMemo(() => Object.values(payments).reduce((a: number, b: number) => a + b, 0), [payments]);
  const remaining = Math.max(0, total - totalPaid);
  const change = Math.max(0, totalPaid - total);
  
  const currentAmount = payments[activeMethod] || 0;

  // Numpad Logic
  const handleNumInput = (num: string) => {
    const currentStr = currentAmount === 0 ? '' : currentAmount.toString();
    const newStr = currentStr + num;
    const newAmount = parseInt(newStr, 10);
    // Limit to reasonable amount to prevent overflow
    if (!isNaN(newAmount) && newStr.length < 10) {
      setPayments(prev => ({ ...prev, [activeMethod]: newAmount }));
    }
  };

  const handleBackspace = () => {
    const currentStr = currentAmount.toString();
    const newStr = currentStr.slice(0, -1);
    const newAmount = newStr === '' ? 0 : parseInt(newStr, 10);
    setPayments(prev => ({ ...prev, [activeMethod]: newAmount }));
  };

  const handleQuickAmount = (amount: number) => {
     setPayments(prev => ({ ...prev, [activeMethod]: (prev[activeMethod] || 0) + amount }));
  };
  
  const clearCurrentAmount = () => {
      setPayments(prev => ({ ...prev, [activeMethod]: 0 }));
  }

  const handleExact = () => {
    const othersPaid = totalPaid - (payments[activeMethod] || 0);
    const needed = Math.max(0, total - othersPaid);
    setPayments(prev => ({ ...prev, [activeMethod]: needed }));
  };

  const processPayment = async () => {
    if (totalPaid < total || !cashier || !chatbotId) return;
    setProcessing(true);

    const payload: TransactionPayload = {
      cashierId: cashier._id,
      items: cart.map(i => ({
        productId: i.productId,
        variantId: i.variantId,
        name: i.name,
        variant: i.variant,
        quantity: i.quantity,
        unitPrice: i.price,
        totalPrice: i.price * i.quantity
      })),
      subtotal: total,
      discount: 0,
      totalAmount: total,
      payments: Object.entries(payments)
        .map(([method, amount]) => ({ method, amount: amount as number }))
        .filter(p => p.amount > 0),
      cashGiven: totalPaid,
      change: change,
      paymentStatus: 'paid',
      source: 'pos'
    };

    try {
      const txn = await api.createTransaction(chatbotId, payload);
      clearCart();
      onSuccess(txn);
    } catch (e: any) {
      console.error(e);
      // Display detailed error with URL for debugging
      const url = e.config?.url || e.response?.config?.url || 'URL non trouvée';
      const status = e.response?.status || 'Erreur inconnue';
      alert(`Échec de la transaction.\nCode: ${status}\nLien: ${url}`);
    } finally {
      setProcessing(false);
    }
  };

  const renderMethodIcon = (id: string, active: boolean) => {
      if (id === 'wave') {
          return (
             <div className="w-8 h-8 rounded-full overflow-hidden bg-white border border-gray-100">
                 <img src="https://api.peelo.chat/public/images/wave.png" alt="Wave" className="w-full h-full object-cover" />
             </div>
          );
      }
      if (id === 'orange_money') {
          return (
             <div className="w-8 h-8 rounded-full overflow-hidden bg-white border border-gray-100">
                 <img src="https://api.peelo.chat/public/images/om.png" alt="OM" className="w-full h-full object-cover" />
             </div>
          );
      }

      const style = `w-6 h-6 ${active ? 'text-white' : 'text-gray-400'}`;
      switch(id) {
          case 'cash': return <Banknote className={style} />;
          case 'card': return <CreditCard className={style} />;
          default: return <Wallet className={style} />;
      }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-100/80 backdrop-blur-sm p-4 md:p-6 font-sans animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-7xl h-full md:h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row ring-1 ring-gray-100">
        
        {/* LEFT COLUMN: Summary Order */}
        <div className="w-full md:w-5/12 bg-gray-50/80 p-6 md:p-8 flex flex-col border-r border-gray-100 h-full hidden md:flex">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Résumé de la commande</h2>
                <p className="text-gray-500 text-sm mt-1">Vérifiez vos articles avant le paiement.</p>
            </div>

            {/* Scrollable Item List */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3 mb-6">
                {cart.map((item) => (
                    <div key={item.key} className="bg-white p-3 rounded-2xl border border-gray-200 flex items-center gap-4 shadow-sm">
                        <div className="h-16 w-16 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                            {item.image ? (
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300"><Wallet size={20}/></div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 text-sm truncate">{item.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md uppercase tracking-wide">
                                    {item.variant || 'STD'}
                                </span>
                                <span className="text-xs text-gray-400">x{item.quantity}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="block font-bold text-gray-900">{(item.price * item.quantity).toLocaleString()} F</span>
                            {item.quantity > 1 && <span className="text-[10px] text-gray-400">{item.price.toLocaleString()} F/u</span>}
                        </div>
                    </div>
                ))}
            </div>

            {/* Totals Footer */}
            <div className="mt-auto pt-6 border-t border-gray-200 space-y-3">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-medium">Sous-Total</span>
                    <span className="text-gray-900 font-bold">{total.toLocaleString()} F</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-medium">Taxes (0%)</span>
                    <span className="text-gray-900 font-bold">0 F</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-bold text-gray-900">Total à payer</span>
                    <span className="text-2xl font-extrabold text-gray-900">{total.toLocaleString()} F</span>
                </div>
            </div>
        </div>

        {/* RIGHT COLUMN: Payment Details */}
        <div className="w-full md:w-7/12 bg-white p-6 md:p-8 flex flex-col h-full relative">
            <button 
                onClick={onClose} 
                className="absolute top-6 right-6 p-2 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors"
            >
                <X size={20} />
            </button>

            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Paiement</h2>
                <div className="flex md:hidden justify-between items-center mt-2 p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-500">Total à payer</span>
                    <span className="text-xl font-extrabold text-gray-900">{total.toLocaleString()} F</span>
                </div>
            </div>

            <div className="flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
                
                {/* Method Selector */}
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Choisir le moyen de paiement</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {PAYMENT_METHODS.map((method) => {
                            const active = activeMethod === method.id;
                            const hasPayment = payments[method.id] > 0;
                            return (
                                <button
                                    key={method.id}
                                    onClick={() => setActiveMethod(method.id)}
                                    className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all duration-200 h-24
                                        ${active 
                                            ? 'border-gray-900 bg-gray-900 text-white shadow-lg scale-[1.02]' 
                                            : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200 hover:bg-gray-50'
                                        }
                                    `}
                                >
                                    {hasPayment && (
                                        <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-white"></div>
                                    )}
                                    <div className="mb-2">
                                        {renderMethodIcon(method.id, active)}
                                    </div>
                                    <span className="text-xs font-bold text-center leading-tight">{method.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Amount & Numpad Layout */}
                <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0">
                    
                    {/* Input Side */}
                    <div className="flex-1 flex flex-col gap-4">
                        
                        {/* Display Active Method Input */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Montant ({PAYMENT_METHODS.find(m => m.id === activeMethod)?.name})
                                </label>
                                {currentAmount > 0 && (
                                    <button onClick={clearCurrentAmount} className="text-[10px] font-bold text-red-500 uppercase hover:underline">
                                        Effacer
                                    </button>
                                )}
                            </div>
                            
                            <div className="relative">
                                <input 
                                    type="text"
                                    readOnly
                                    value={currentAmount === 0 ? '' : currentAmount.toLocaleString()}
                                    placeholder="0"
                                    className={`w-full h-16 pl-4 pr-12 rounded-2xl border-2 text-2xl font-bold outline-none transition-colors
                                        ${currentAmount > 0 ? 'border-gray-900 text-gray-900 bg-gray-50' : 'border-gray-200 text-gray-400 bg-white'}
                                    `}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">FCFA</span>
                            </div>
                        </div>

                        {/* Quick Chips */}
                        <div className="grid grid-cols-4 gap-2">
                            {[1000, 2000, 5000, 10000].map(amt => (
                                <button 
                                    key={amt}
                                    onClick={() => handleQuickAmount(amt)}
                                    className="py-2 px-1 rounded-lg border border-gray-200 bg-white text-xs font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                                >
                                    +{amt / 1000}k
                                </button>
                            ))}
                        </div>

                        <button 
                            onClick={handleExact}
                            className="w-full py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold text-sm transition-colors border border-gray-200"
                        >
                            Montant Exact ({remaining.toLocaleString()} F)
                        </button>

                        {/* Payment Breakdown List - NEW */}
                        {totalPaid > 0 && (
                            <div className="mt-2 bg-white rounded-xl border border-gray-100 overflow-hidden">
                                <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                                    <span className="text-xs font-bold text-gray-500 uppercase">Paiements Reçus</span>
                                    <span className="text-xs font-bold text-gray-900">{totalPaid.toLocaleString()} F</span>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {Object.entries(payments).map(([methodId, amountRaw]) => {
                                        const amount = amountRaw as number;
                                        if (amount <= 0) return null;
                                        const method = PAYMENT_METHODS.find(m => m.id === methodId);
                                        return (
                                            <div key={methodId} className="flex items-center justify-between px-4 py-2.5">
                                                <div className="flex items-center gap-2">
                                                     {/* Icon */}
                                                     {methodId === 'wave' || methodId === 'orange_money' ? (
                                                         <div className="w-5 h-5 rounded-full overflow-hidden border border-gray-100">
                                                            <img src={methodId === 'wave' ? "https://api.peelo.chat/public/images/wave.png" : "https://api.peelo.chat/public/images/om.png"} className="w-full h-full object-cover"/>
                                                         </div>
                                                     ) : (
                                                         <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                                             {methodId === 'cash' ? <Banknote size={12}/> : <CreditCard size={12}/>}
                                                         </div>
                                                     )}
                                                     <span className="text-sm font-semibold text-gray-700">{method?.name}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-bold text-gray-900 text-sm">{amount.toLocaleString()} F</span>
                                                    <button 
                                                        onClick={() => setPayments(prev => ({...prev, [methodId]: 0}))}
                                                        className="text-gray-300 hover:text-red-500 transition-colors"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Status Summary */}
                        <div className="mt-auto bg-gray-50 rounded-2xl p-4 border border-gray-100">
                             <div className="flex justify-between items-center mb-1">
                                 <span className="text-xs font-bold text-gray-400 uppercase">Reste à payer</span>
                                 <span className={`font-bold ${remaining > 0 ? 'text-orange-500' : 'text-green-500'}`}>{remaining.toLocaleString()} F</span>
                             </div>
                             <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-2">
                                 <span className="text-sm font-bold text-gray-900 uppercase">Monnaie</span>
                                 <span className="text-xl font-extrabold text-gray-900">{change.toLocaleString()} F</span>
                             </div>
                        </div>
                    </div>

                    {/* Numpad Side */}
                    <div className="w-full md:w-[260px] shrink-0">
                         <div className="grid grid-cols-3 gap-3 h-full max-h-[400px]">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                <button
                                    key={num}
                                    onClick={() => handleNumInput(num.toString())}
                                    className="flex items-center justify-center rounded-xl bg-white border border-gray-100 shadow-sm text-2xl font-bold text-gray-900 hover:bg-gray-50 active:scale-95 transition-all h-14 md:h-auto"
                                >
                                    {num}
                                </button>
                            ))}
                            <button
                                onClick={() => handleNumInput('00')}
                                className="flex items-center justify-center rounded-xl bg-gray-50 border border-gray-100 text-lg font-bold text-gray-600 hover:bg-gray-100 h-14 md:h-auto"
                            >
                                00
                            </button>
                            <button
                                onClick={() => handleNumInput('0')}
                                className="flex items-center justify-center rounded-xl bg-white border border-gray-100 shadow-sm text-2xl font-bold text-gray-900 hover:bg-gray-50 h-14 md:h-auto"
                            >
                                0
                            </button>
                            <button
                                onClick={handleBackspace}
                                className="flex items-center justify-center rounded-xl bg-red-50 border border-red-100 text-red-500 hover:bg-red-100 active:scale-95 transition-all h-14 md:h-auto"
                            >
                                <Delete size={24} />
                            </button>
                         </div>
                    </div>

                </div>
            </div>

            {/* Main Action Button */}
            <div className="pt-6 mt-4 border-t border-gray-100">
                <button
                    onClick={processPayment}
                    disabled={totalPaid < total || processing}
                    className={`w-full py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg
                        ${totalPaid >= total 
                            ? 'bg-gray-900 text-white hover:bg-black active:scale-[0.98]' 
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                        }
                    `}
                >
                    {processing ? (
                        <span>Traitement...</span>
                    ) : (
                        <>
                            <span>Valider le paiement</span>
                            <ArrowRight size={20} />
                        </>
                    )}
                </button>
            </div>

        </div>
      </div>
    </div>
  );
}