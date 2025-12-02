import React, { useState, useMemo } from 'react';
import { usePOS } from '../context/POSContext';
import { PaymentMethod, TransactionPayload } from '../types';
import { X, CheckCircle, Smartphone, Loader2 } from 'lucide-react';
import { api } from '../services/api';

interface Props {
  total: number;
  onClose: () => void;
  onSuccess: (txn: any) => void;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'cash', name: 'Espèces', icon: 'cash', color: '#10b981' },
  { id: 'orange_money', name: 'Orange Money', icon: 'om', color: '#ff6600' },
  { id: 'wave', name: 'Wave', icon: 'wave', color: '#1e88e5' },
  { id: 'card', name: 'Carte', icon: 'card', color: '#6366f1' },
];

export default function PaymentModal({ total, onClose, onSuccess }: Props) {
  const { cart, cashier, chatbotId, clearCart } = usePOS();
  const [payments, setPayments] = useState<Record<string, number>>({});
  const [activeMethod, setActiveMethod] = useState<string>('cash');
  const [processing, setProcessing] = useState(false);

  // Fix: Explicitly type reduce arguments to avoid unknown type error
  const totalPaid = useMemo(() => Object.values(payments).reduce((a: number, b: number) => a + b, 0), [payments]);
  const remaining = Math.max(0, total - totalPaid);
  const change = Math.max(0, totalPaid - total);
  
  const handleAmountChange = (val: string) => {
    const amount = parseInt(val) || 0;
    setPayments(prev => ({ ...prev, [activeMethod]: amount }));
  };

  const handleQuickAmount = (amount: number) => {
     setPayments(prev => ({ ...prev, [activeMethod]: amount }));
  };

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
    } catch (e) {
      alert("Échec de la transaction. Veuillez réessayer.");
    } finally {
      setProcessing(false);
    }
  };

  const renderIcon = (id: string) => {
      switch(id) {
          case 'cash': 
             return <img src="https://cdn-icons-png.flaticon.com/512/2488/2488749.png" alt="Espèces" className="w-full h-full object-contain" />;
          case 'orange_money': 
             return <img src="https://api.peelo.chat/public/images/om.png" alt="Orange Money" className="w-full h-full object-contain" />;
          case 'wave': 
             return <img src="https://api.peelo.chat/public/images/wave.png" alt="Wave" className="w-full h-full object-contain" />;
          case 'card': 
             return <img src="https://cdn-icons-png.flaticon.com/512/4341/4341764.png" alt="Carte" className="w-full h-full object-contain" />;
          default: 
             return <Smartphone size={24} />;
      }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] w-full max-w-5xl h-[85vh] shadow-2xl overflow-hidden flex flex-col md:flex-row font-sans">
        
        {/* Left: Summary & Keypad */}
        <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col bg-gray-50/50 border-r border-gray-100">
          <div className="flex justify-between items-start mb-8">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Paiement</h2>
             <div className="text-right">
                <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Total à Payer</p>
                <p className="text-4xl font-extrabold text-gray-900 tracking-tight">{total.toLocaleString()} F</p>
             </div>
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
                 <div className="flex justify-between mb-3">
                     <span className="text-gray-500 font-medium">Déjà payé</span>
                     <span className="font-bold text-green-600 text-lg">{totalPaid.toLocaleString()} F</span>
                 </div>
                 <div className="flex justify-between mb-3">
                     <span className="text-gray-500 font-medium">Reste à payer</span>
                     <span className="font-bold text-orange-600 text-lg">{remaining.toLocaleString()} F</span>
                 </div>
                 <div className="border-t border-gray-100 pt-4 mt-2 flex justify-between items-center">
                     <span className="text-gray-900 font-bold">Monnaie</span>
                     <span className="font-extrabold text-2xl text-gray-900">{change.toLocaleString()} F</span>
                 </div>
             </div>

             <div className="mb-3 text-sm font-bold text-gray-500 flex items-center gap-2">
                <span>Montant en</span>
                <span className="text-gray-900">{PAYMENT_METHODS.find(m => m.id === activeMethod)?.name}</span>
             </div>
             
             <div className="relative mb-6">
                 <input 
                    type="number" 
                    value={payments[activeMethod] || ''}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="0"
                    className="w-full text-5xl font-extrabold p-6 rounded-2xl border-2 border-transparent bg-white shadow-sm focus:outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 text-right transition-all"
                    autoFocus
                 />
                 <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 font-bold text-2xl">FCFA</span>
             </div>
             
             <div className="grid grid-cols-4 gap-3 mb-4">
                 {[1000, 2000, 5000, 10000].map(amt => (
                     <button 
                        key={amt} 
                        onClick={() => handleQuickAmount(amt)}
                        className="py-3 px-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:border-[var(--primary)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/5 font-bold transition-all text-sm shadow-sm active:scale-95"
                     >
                         {amt/1000}k
                     </button>
                 ))}
             </div>
             <button 
                onClick={handleExact}
                className="w-full py-4 rounded-xl bg-gray-900 text-white font-bold hover:bg-black transition-colors shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
             >
                 Montant Exact <span className="opacity-60 text-sm font-normal">({remaining.toLocaleString()} F)</span>
             </button>
          </div>
        </div>

        {/* Right: Methods & Action */}
        <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col bg-white">
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-gray-800">Mode de paiement</h3>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                    <X size={28} />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-auto">
                {PAYMENT_METHODS.map(method => (
                    <button
                        key={method.id}
                        onClick={() => setActiveMethod(method.id)}
                        className={`p-6 rounded-[24px] border-2 flex flex-col items-center justify-center gap-4 transition-all duration-300 relative overflow-hidden group
                            ${activeMethod === method.id 
                                ? 'border-[var(--primary)] bg-[var(--primary)]/5 shadow-md scale-[1.02]' 
                                : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        {/* Selected Indicator */}
                        {activeMethod === method.id && (
                            <div className="absolute top-3 right-3 text-[var(--primary)]">
                                <CheckCircle size={20} fill="currentColor" className="text-white" />
                            </div>
                        )}

                        <div className={`w-16 h-16 p-2 rounded-2xl flex items-center justify-center transition-colors ${activeMethod === method.id ? 'bg-white shadow-sm' : 'bg-gray-50 grayscale group-hover:grayscale-0'}`}>
                            {renderIcon(method.id)}
                        </div>
                        
                        <div className="text-center">
                            <span className={`font-bold block text-lg ${activeMethod === method.id ? 'text-gray-900' : 'text-gray-500'}`}>{method.name}</span>
                            {payments[method.id] > 0 && (
                                <span className="inline-block mt-2 text-xs font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full">
                                    {payments[method.id].toLocaleString()} F
                                </span>
                            )}
                        </div>
                    </button>
                ))}
            </div>

            <div className="mt-8">
                <button
                    onClick={processPayment}
                    disabled={totalPaid < total || processing}
                    className={`w-full py-6 rounded-2xl text-xl font-bold text-white flex items-center justify-center gap-3 transition-all shadow-xl
                        ${totalPaid >= total 
                            ? 'bg-[var(--primary)] hover:opacity-90 active:scale-[0.98] shadow-[var(--primary)]/30' 
                            : 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none'
                        }`}
                >
                    {processing ? <Loader2 className="animate-spin w-8 h-8" /> : 'Confirmer et Imprimer'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}