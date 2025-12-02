import React from 'react';
import { usePOS } from '../context/POSContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, X } from 'lucide-react';

interface Props {
  onPay: () => void;
}

export default function CartSidebar({ onPay }: Props) {
  const { cart, removeFromCart, updateQuantity, clearCart } = usePOS();
  
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = 0; 
  const total = subtotal + tax;

  if (cart.length === 0) {
    return (
      <div className="h-full flex flex-col bg-white">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Ma Commande</h2>
            <div className="bg-[var(--primary)] text-white text-xs font-bold px-2 py-0.5 rounded-full">0</div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-gray-300 p-8 text-center bg-gray-50/50">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <ShoppingBag size={40} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-600">Votre panier est vide</h3>
            <p className="text-sm mt-2 text-gray-400 max-w-[200px]">Sélectionnez des produits pour commencer une nouvelle vente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white font-sans">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
        <div>
            <h2 className="text-2xl font-bold text-gray-900">Ma Commande</h2>
            <p className="text-sm text-gray-400 mt-0.5">{cart.length} Articles</p>
        </div>
        <button 
            onClick={clearCart} 
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
            title="Vider le panier"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {cart.map((item) => (
          <div key={item.key} className="flex gap-4 group">
            
            {/* Image */}
            <div className="h-16 w-16 rounded-xl bg-gray-50 overflow-hidden shrink-0 border border-gray-100">
                {item.image ? (
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                    <div className="h-full w-full bg-gray-200" />
                )}
            </div>
            
            <div className="flex-1 py-0.5">
              <div className="flex justify-between items-start mb-1">
                 <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{item.name}</h4>
                 <button onClick={() => removeFromCart(item.key)} className="text-gray-300 hover:text-red-500 transition-colors">
                     <X size={16} />
                 </button>
              </div>
              
              <p className="text-xs text-gray-400 mb-3 font-medium">
                  {item.variant || 'Standard'} 
              </p>
              
              <div className="flex items-center justify-between">
                 <span className="font-extrabold text-[var(--primary)] text-sm">{(item.price * item.quantity).toLocaleString()} F</span>
                 
                 {/* Compact Stepper */}
                 <div className="flex items-center bg-gray-50 rounded-lg p-0.5 border border-gray-100">
                    <button 
                        onClick={() => updateQuantity(item.key, -1)}
                        className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm text-gray-500 transition-all"
                    >
                        <Minus size={12} />
                    </button>
                    <span className="text-xs font-bold w-6 text-center tabular-nums">{item.quantity}</span>
                    <button 
                         onClick={() => updateQuantity(item.key, 1)}
                         className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm text-gray-800 transition-all"
                    >
                        <Plus size={12} />
                    </button>
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer / Summary */}
      <div className="p-6 bg-white border-t border-gray-100 shrink-0">
         
         <div className="space-y-3 mb-8">
            <div className="flex justify-between text-gray-500 text-sm font-medium">
                <span>Sous-total</span>
                <span className="text-gray-900 font-bold">{subtotal.toLocaleString()} F</span>
            </div>
            <div className="flex justify-between text-gray-500 text-sm font-medium">
                <span>Taxe</span>
                <span className="text-gray-900 font-bold">0 F</span>
            </div>
            
            <div className="my-2 border-t border-dashed border-gray-200"></div>

            <div className="flex justify-between items-end">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-2xl font-extrabold text-gray-900">{total.toLocaleString()} F</span>
            </div>
         </div>

        <button 
            onClick={onPay}
            className="w-full py-4 bg-[var(--accent)] text-white rounded-xl font-bold text-lg shadow-xl shadow-orange-500/20 hover:bg-orange-600 transition-all active:scale-[0.98] flex justify-center items-center gap-2"
        >
            Encaisser la commande
        </button>
      </div>
    </div>
  );
}