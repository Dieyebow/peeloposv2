import React from 'react';
import { usePOS } from '../context/POSContext';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

interface Props {
  onPay: () => void;
}

export default function CartSidebar({ onPay }: Props) {
  const { cart, removeFromCart, updateQuantity, clearCart } = usePOS();
  
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = 0; // Assuming 0 for demo
  const total = subtotal + tax;

  if (cart.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center bg-white">
        <div className="bg-gray-50 p-5 rounded-full mb-4">
            <ShoppingBag size={40} className="text-gray-300" />
        </div>
        <h3 className="text-base font-bold text-gray-600">Panier vide</h3>
        <p className="text-sm mt-1">Sélectionnez des produits pour commencer une commande.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            Panier
            <span className="bg-[var(--primary)] text-white text-xs px-2 py-0.5 rounded-full">{cart.length}</span>
        </h2>
        <button onClick={clearCart} className="text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-md text-xs font-bold transition-colors uppercase tracking-wide">
          Vider
        </button>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-gray-50/50">
        {cart.map((item) => (
          <div key={item.key} className="flex gap-3 p-3 rounded-lg bg-white shadow-sm border border-gray-100">
            {/* Image */}
            <div className="h-14 w-14 rounded-md bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                {item.image ? (
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                    <div className="h-full w-full bg-gray-200" />
                )}
            </div>
            
            <div className="flex-1 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-bold text-gray-800 text-sm line-clamp-1">{item.name}</h4>
                    {item.variant && <p className="text-xs text-gray-500">{item.variant}</p>}
                </div>
                <span className="font-bold text-gray-900 text-sm">{(item.price * item.quantity).toLocaleString()}</span>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                 <div className="flex items-center gap-1 bg-gray-50 rounded-md border border-gray-200 p-0.5">
                    <button 
                        onClick={() => updateQuantity(item.key, -1)}
                        className="w-6 h-6 flex items-center justify-center rounded bg-white shadow-sm text-gray-600 hover:bg-gray-100"
                    >
                        <Minus size={12} />
                    </button>
                    <span className="text-sm font-bold w-6 text-center tabular-nums">{item.quantity}</span>
                    <button 
                         onClick={() => updateQuantity(item.key, 1)}
                         className="w-6 h-6 flex items-center justify-center rounded bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 shadow-sm"
                    >
                        <Plus size={12} />
                    </button>
                 </div>
                 <button 
                    onClick={() => removeFromCart(item.key)}
                    className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                 >
                    <Trash2 size={16} />
                 </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer / Totals */}
      <div className="p-5 bg-white border-t border-gray-200 shadow-[0_-5px_20px_rgba(0,0,0,0.03)] z-10">
        <div className="space-y-2 mb-4">
            <div className="flex justify-between text-gray-500 text-xs font-medium uppercase tracking-wide">
                <span>Sous-total</span>
                <span>{subtotal.toLocaleString()} F</span>
            </div>
            {/* <div className="flex justify-between text-gray-500 text-xs font-medium uppercase tracking-wide">
                <span>Taxe</span>
                <span>{tax.toLocaleString()} F</span>
            </div> */}
            <div className="flex justify-between text-xl font-extrabold text-gray-900 pt-3 border-t border-gray-100 mt-2">
                <span>Total</span>
                <span>{total.toLocaleString()} F</span>
            </div>
        </div>

        <button 
            onClick={onPay}
            className="w-full py-3.5 bg-[var(--primary)] hover:opacity-90 text-white rounded-lg font-bold text-lg shadow-lg transition-all active:scale-[0.98] flex justify-between px-6 items-center"
        >
            <span>Encaisser</span>
            <span>{total.toLocaleString()} F</span>
        </button>
      </div>
    </div>
  );
}