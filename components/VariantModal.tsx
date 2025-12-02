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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[28px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-8 pb-4 border-b border-gray-50 flex justify-between items-start shrink-0">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{product.title}</h3>
            <p className="text-sm text-gray-400 font-bold uppercase tracking-wider mt-1">Sélectionnez une option</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="p-8 pt-6 overflow-y-auto custom-scrollbar flex-1">
          <div className="space-y-4">
            {product.variants.map((variant) => {
              const isSelected = selected?._id === variant._id;
              return (
                <button
                  key={variant._id}
                  onClick={() => setSelected(variant)}
                  className={`w-full flex items-center gap-6 p-4 rounded-2xl transition-all duration-200 group relative border-2
                    ${isSelected
                      ? 'border-[var(--primary)] bg-[var(--primary)]/5 shadow-sm' 
                      : 'border-transparent hover:bg-gray-50'
                    }`}
                >
                  {/* Variant Image */}
                  <div className="h-20 w-20 rounded-xl bg-white overflow-hidden shrink-0 shadow-sm border border-gray-100">
                     <img 
                        src={variant.images[0] || product.images[0]} 
                        alt={variant.name}
                        onError={(e) => e.currentTarget.style.display = 'none'}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                     />
                     {/* Fallback icon if image error or missing */}
                     {(!variant.images[0] && !product.images[0]) && (
                       <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                         <Box size={24} />
                       </div>
                     )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 text-left">
                    <p className={`text-lg font-bold mb-1 ${isSelected ? 'text-[var(--primary)]' : 'text-gray-900'}`}>
                      {variant.name}
                    </p>
                    <div className="flex items-center gap-3">
                       <span className={`text-xs font-bold px-2.5 py-1 rounded-md
                          ${isSelected 
                              ? 'bg-white text-[var(--primary)] shadow-sm' 
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                          Stock: {variant.stock}
                       </span>
                    </div>
                  </div>

                  {/* Price & Check */}
                  <div className="text-right flex flex-col items-end gap-1">
                    <span className="text-xl font-bold text-gray-900">{variant.price.toLocaleString()} F</span>
                    
                    <div className={`mt-2 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300
                        ${isSelected 
                            ? 'bg-[var(--primary)] border-[var(--primary)] scale-110' 
                            : 'border-gray-200 bg-transparent group-hover:border-gray-300'
                        }
                    `}>
                      {isSelected && <Check size={18} className="text-white" strokeWidth={3} />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 md:p-8 border-t border-gray-50 bg-white shrink-0 flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 h-14 rounded-xl font-bold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors text-base"
          >
            Annuler
          </button>
          <button 
            onClick={() => selected && onConfirm(selected)}
            disabled={!selected}
            className="flex-[2] h-14 rounded-xl font-bold text-white bg-[var(--primary)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-[var(--primary)]/20 text-base flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <ShoppingBag size={20} />
            Ajouter au panier
          </button>
        </div>
      </div>
    </div>
  );
}