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
        <div className="bg-gray-50 p-6 rounded-full mb-4">
            <ShoppingBag size={48} className="text-gray-300" />
        </div>
        <h3 className="text-lg font-semibold text-gray-600">Cart is empty</h3>
        <p className="text-sm">Select products from the grid to add them to the order.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            Current Order 
            <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full">{cart.length}</span>
        </h2>
        <button onClick={clearCart} className="text-red-500 hover:bg-red-50 p-2 rounded-lg text-sm font-medium transition-colors">
          Clear All
        </button>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {cart.map((item) => (
          <div key={item.key} className="flex gap-3 p-3 rounded-xl bg-gray-50 border border-transparent hover:border-gray-200 transition-colors group">
            {/* Image (Hidden on very small screens if needed, but useful here) */}
            <div className="h-16 w-16 rounded-lg bg-white overflow-hidden shrink-0 border border-gray-100">
                {item.image ? (
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                    <div className="h-full w-full bg-gray-200" />
                )}
            </div>
            
            <div className="flex-1 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-semibold text-gray-800 text-sm line-clamp-1">{item.name}</h4>
                    {item.variant && <p className="text-xs text-gray-500">{item.variant}</p>}
                </div>
                <span className="font-bold text-gray-900">{(item.price * item.quantity).toLocaleString()}</span>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                 <div className="flex items-center gap-3 bg-white rounded-lg shadow-sm border border-gray-200 px-1 py-1">
                    <button 
                        onClick={() => updateQuantity(item.key, -1)}
                        className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-600"
                    >
                        <Minus size={14} />
                    </button>
                    <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                    <button 
                         onClick={() => updateQuantity(item.key, 1)}
                         className="w-6 h-6 flex items-center justify-center rounded-md bg-orange-100 text-orange-600 hover:bg-orange-200"
                    >
                        <Plus size={14} />
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
      <div className="p-6 bg-gray-50 border-t border-gray-200">
        <div className="space-y-2 mb-4">
            <div className="flex justify-between text-gray-500 text-sm">
                <span>Subtotal</span>
                <span>{subtotal.toLocaleString()} F</span>
            </div>
            <div className="flex justify-between text-gray-500 text-sm">
                <span>Tax</span>
                <span>{tax.toLocaleString()} F</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-800 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>{total.toLocaleString()} F</span>
            </div>
        </div>

        <button 
            onClick={onPay}
            className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-orange-200 transition-all active:scale-95 flex justify-between px-6"
        >
            <span>Charge</span>
            <span>{total.toLocaleString()} F</span>
        </button>
      </div>
    </div>
  );
}
