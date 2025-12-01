import React, { useState, useMemo } from 'react';
import { usePOS } from '../context/POSContext';
import { PaymentMethod, TransactionPayload } from '../types';
import { X, CheckCircle, Wallet, CreditCard, Banknote, Smartphone, Loader2, Printer } from 'lucide-react';
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
          case 'cash': return <Banknote size={20} />;
          case 'card': return <CreditCard size={20} />;
          default: return <Smartphone size={20} />;
      }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl h-[85vh] shadow-2xl overflow-hidden flex flex-col md:flex-row font-sans">
        
        {/* Left: Summary & Keypad */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col bg-gray-50 border-r border-gray-200">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-bold text-gray-800">Paiement</h2>
             <div className="text-right">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-bold">Total Dû</p>
                <p className="text-3xl font-extrabold text-gray-900">{total.toLocaleString()} F</p>
             </div>
          </div>

          <div className="flex-1 flex flex-col justify-center">
             <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 mb-6">
                 <div className="flex justify-between mb-2">
                     <span className="text-gray-500 font-medium">Déjà payé</span>
                     <span className="font-bold text-green-600">{totalPaid.toLocaleString()} F</span>
                 </div>
                 <div className="flex justify-between mb-2">
                     <span className="text-gray-500 font-medium">Reste</span>
                     <span className="font-bold text-orange-600">{remaining.toLocaleString()} F</span>
                 </div>
                 <div className="border-t border-gray-100 pt-3 mt-1 flex justify-between">
                     <span className="text-gray-800 font-bold">Monnaie</span>
                     <span className="font-extrabold text-gray-900">{change.toLocaleString()} F</span>
                 </div>
             </div>

             <div className="mb-2 text-sm font-bold text-gray-500">Montant pour {PAYMENT_METHODS.find(m => m.id === activeMethod)?.name}</div>
             <input 
                type="number" 
                value={payments[activeMethod] || ''}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0"
                className="w-full text-4xl font-bold p-4 rounded-lg border border-[var(--primary)] focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/20 bg-white text-right mb-4"
                autoFocus
             />
             
             <div className="grid grid-cols-4 gap-2 mb-4">
                 {[1000, 2000, 5000, 10000].map(amt => (
                     <button 
                        key={amt} 
                        onClick={() => handleQuickAmount(amt)}
                        className="py-3 rounded-lg bg-white border border-gray-200 text-gray-600 hover:border-[var(--primary)] hover:text-[var(--primary)] font-bold transition-colors text-sm"
                     >
                         {amt/1000}k
                     </button>
                 ))}
             </div>
             <button 
                onClick={handleExact}
                className="w-full py-4 rounded-lg bg-slate-800 text-white font-bold hover:bg-slate-900 transition-colors shadow-lg"
             >
                 Montant Exact ({remaining.toLocaleString()} F)
             </button>
          </div>
        </div>

        {/* Right: Methods & Action */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col bg-white">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-700">Mode de paiement</h3>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                    <X size={24} />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-auto">
                {PAYMENT_METHODS.map(method => (
                    <button
                        key={method.id}
                        onClick={() => setActiveMethod(method.id)}
                        className={`p-6 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all duration-200
                            ${activeMethod === method.id 
                                ? 'border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--primary)] shadow-md' 
                                : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        <div className={`p-3 rounded-full ${activeMethod === method.id ? 'bg-[var(--primary)] text-white' : 'bg-gray-100'}`}>
                            {renderIcon(method.id)}
                        </div>
                        <span className="font-bold">{method.name}</span>
                        {payments[method.id] > 0 && (
                            <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                {payments[method.id].toLocaleString()} F
                            </span>
                        )}
                    </button>
                ))}
            </div>

            <button
                onClick={processPayment}
                disabled={totalPaid < total || processing}
                className={`w-full py-5 rounded-xl text-lg font-bold text-white flex items-center justify-center gap-3 transition-all shadow-lg
                    ${totalPaid >= total 
                        ? 'bg-[var(--primary)] hover:opacity-90 active:scale-[0.98]' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
            >
                {processing ? <Loader2 className="animate-spin" /> : <>Valider le paiement <CheckCircle /></>}
            </button>
        </div>
      </div>
    </div>
  );
}