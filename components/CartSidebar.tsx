import React from 'react';
import { usePOS } from '../context/POSContext';
import { Trash2, Plus, Minus, ShoppingBag, Tag, ChevronRight } from 'lucide-react';

interface Props {
  onPay: () => void;
}

export default function CartSidebar({ onPay }: Props) {
  const { cart, removeFromCart, updateQuantity, clearCart } = usePOS();
  
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = Math.round(subtotal * 0.18); // Example tax 18%
  const discount = 0;
  const total = subtotal + tax - discount;

  if (cart.length === 0) {
    return (
      <div className="h-full flex flex-col bg-white font-sans">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 tracking-tight">Détails Transaction</h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-gray-300 p-8 text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <ShoppingBag size={40} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-500">Panier vide</h3>
            <p className="text-sm mt-2 text-gray-400 max-w-[200px] font-medium">Ajoutez des produits pour commencer.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white font-sans text-slate-800">
      {/* Header */}
      <div className="px-6 py-6 flex justify-between items-center bg-white shrink-0">
        <h2 className="text-xl font-semibold text-gray-900 tracking-tight">Détails Transaction</h2>
        <button 
            onClick={clearCart} 
            className="flex items-center gap-2 text-red-500 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-full text-xs font-semibold transition-colors border border-red-100"
        >
          <Trash2 size={14} />
          <span>Réinitialiser</span>
        </button>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto px-6 space-y-4 custom-scrollbar pb-6">
        {cart.map((item) => (
          <div key={item.key} className="p-3 bg-white border border-gray-100 rounded-[20px] shadow-sm relative group hover:border-gray-200 transition-colors">
            <div className="flex gap-4">
                {/* Image */}
                <div className="h-20 w-20 rounded-2xl bg-gray-50 overflow-hidden shrink-0 border border-gray-50">
                    {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-100">
                           <ShoppingBag size={20} />
                        </div>
                    )}
                </div>
                
                {/* Info */}
                <div className="flex-1 pt-1">
                    <h4 className="font-bold text-gray-900 text-sm mb-1.5 pr-8 leading-tight line-clamp-1">{item.name}</h4>
                    
                    {/* Variant Pill */}
                    <div className="flex flex-wrap gap-2 mb-3">
                        <span className="text-[11px] text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full font-medium tracking-wide">
                            {item.variant || 'Standard'}
                        </span>
                    </div>

                    {/* Bottom Row: Qty & Price */}
                    <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => updateQuantity(item.key, -1)}
                                className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                <Minus size={12} strokeWidth={2.5} />
                            </button>
                            <span className="font-bold text-gray-900 w-5 text-center text-sm">{item.quantity.toString().padStart(2, '0')}</span>
                            <button 
                                onClick={() => updateQuantity(item.key, 1)}
                                className="w-7 h-7 rounded-full bg-[var(--primary)] text-white flex items-center justify-center hover:opacity-90 transition-colors shadow-md shadow-[var(--primary)]/20"
                            >
                                <Plus size={12} strokeWidth={2.5} />
                            </button>
                        </div>
                        <p className="font-bold text-gray-900 text-sm">{(item.price * item.quantity).toLocaleString()} F</p>
                    </div>
                </div>
            </div>

            {/* Trash Button - Absolute Top Right */}
            <button 
                onClick={() => removeFromCart(item.key)} 
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
            >
                <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Footer Area */}
      <div className="px-6 py-6 bg-white border-t border-gray-50 shrink-0">
         
         {/* Promo Section */}
         <div className="bg-gray-50 rounded-[18px] p-4 flex items-center justify-between mb-6 border border-gray-100">
             <div className="flex items-center gap-3">
                 <div className="p-1.5 bg-gray-800 text-white rounded-lg shadow-sm">
                     <Tag size={12} fill="currentColor" />
                 </div>
                 <span className="text-xs font-semibold text-gray-700">Promo Client (0%)</span>
             </div>
             <button className="text-[10px] font-bold text-[var(--primary)] bg-[var(--primary)]/10 px-3 py-1.5 rounded-full hover:bg-[var(--primary)] hover:text-white transition-colors uppercase tracking-wide">
                 Changer
             </button>
         </div>

         {/* Summary */}
         <div className="space-y-3 mb-6 px-1">
            <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Sous-Total</span>
                <span className="text-gray-900 font-semibold">{subtotal.toLocaleString()} F</span>
            </div>
            <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Taxe (18%)</span>
                <span className="text-gray-900 font-semibold">{tax.toLocaleString()} F</span>
            </div>
            <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Réduction</span>
                <span className="text-gray-900 font-semibold">-{discount.toLocaleString()} F</span>
            </div>
            <div className="pt-3 border-t border-gray-100 flex justify-between items-center mt-2">
                <span className="text-base font-bold text-gray-900">Total à Payer</span>
                <span className="text-xl font-extrabold text-gray-900">{total.toLocaleString()} F</span>
            </div>
         </div>

         {/* Payment Method Row */}
         <div className="flex items-center justify-between mb-6 group cursor-pointer py-2 px-1 rounded-xl hover:bg-gray-50 transition-colors">
             <div className="flex items-center gap-3">
                 <div className="flex -space-x-1.5 shadow-sm">
                     <div className="w-7 h-7 rounded-full bg-[#EB001B] border-2 border-white"></div>
                     <div className="w-7 h-7 rounded-full bg-[#F79E1B] border-2 border-white"></div>
                 </div>
                 <span className="font-semibold text-gray-700 text-sm">Espèces / Carte</span>
             </div>
             <div className="flex items-center gap-1 text-gray-400 text-xs font-bold group-hover:text-gray-600 uppercase tracking-wide">
                 Changer <ChevronRight size={14} />
             </div>
         </div>

         {/* Button */}
         <button 
            onClick={onPay}
            className="w-full py-4 bg-[var(--primary)] text-white rounded-[20px] font-bold text-lg shadow-xl shadow-[var(--primary)]/25 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center tracking-wide"
         >
             Continuer
         </button>
      </div>
    </div>
  );
}