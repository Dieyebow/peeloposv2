import React from 'react';
import { Product, Variant } from '../types';
import { X, Check, Box, ShoppingBag } from 'lucide-react';

interface Props {
  product: Product;
  onClose: () => void;
  onConfirm: (variant: Variant) => void;
}

export default function VariantModal({ product, onClose, onConfirm }: Props) {
  const [selected, setSelected] = React.useState<Variant | null>(null);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200 font-sans">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-8 pb-4 flex justify-between items-start shrink-0">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{product.title}</h3>
            <p className="text-base text-gray-500 font-medium mt-1 uppercase tracking-wide">Sélectionnez une option</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
          <div className="space-y-4">
            {product.variants.map((variant) => {
              const isSelected = selected?._id === variant._id;
              return (
                <button
                  key={variant._id}
                  onClick={() => setSelected(variant)}
                  className={`w-full flex items-center gap-6 p-4 rounded-2xl transition-all duration-200 text-left group
                    ${isSelected
                      ? 'bg-[var(--primary)]/5 ring-2 ring-[var(--primary)]' 
                      : 'bg-white hover:bg-gray-50 border border-gray-100'
                    }`}
                >
                  {/* Variant Image - LARGE */}
                  <div className="h-28 w-28 rounded-xl overflow-hidden shrink-0 bg-gray-100 border border-gray-100 shadow-sm">
                     <img 
                        src={variant.images[0] || product.images[0]} 
                        alt={variant.name}
                        onError={(e) => e.currentTarget.style.display = 'none'}
                        className="w-full h-full object-cover" 
                     />
                     {(!variant.images[0] && !product.images[0]) && (
                       <div className="w-full h-full flex items-center justify-center text-gray-300">
                         <Box size={32} />
                       </div>
                     )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                        <p className={`text-lg font-bold truncate pr-4 ${isSelected ? 'text-[var(--primary)]' : 'text-gray-900'}`}>
                          {variant.name}
                        </p>
                        <span className="text-xl font-bold text-gray-900 whitespace-nowrap">{variant.price.toLocaleString()} F</span>
                    </div>
                    
                    <div>
                       <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide
                          ${isSelected 
                              ? 'bg-[var(--primary)] text-white' 
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                          Stock: {variant.stock}
                       </span>
                    </div>
                  </div>

                  {/* Checkbox Visual */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shrink-0
                      ${isSelected 
                          ? 'bg-[var(--primary)] text-white scale-110 shadow-md' 
                          : 'bg-gray-100 text-gray-300'
                      }
                  `}>
                    <Check size={18} strokeWidth={4} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-gray-50 bg-white shrink-0 flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 h-14 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors text-lg"
          >
            Annuler
          </button>
          <button 
            onClick={() => selected && onConfirm(selected)}
            disabled={!selected}
            className={`flex-[2] h-14 rounded-xl font-bold text-white transition-all shadow-xl flex items-center justify-center gap-3 text-lg
              ${selected 
                ? 'bg-[var(--primary)] hover:opacity-90 active:scale-[0.98] shadow-[var(--primary)]/25 cursor-pointer' 
                : 'bg-gray-200 text-white shadow-none cursor-not-allowed'
              }`}
          >
            <ShoppingBag size={20} />
            Ajouter au panier
          </button>
        </div>
      </div>
    </div>
  );
}