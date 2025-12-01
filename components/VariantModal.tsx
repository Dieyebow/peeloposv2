import React from 'react';
import { Product, Variant } from '../types';
import { X, Check } from 'lucide-react';

interface Props {
  product: Product;
  onClose: () => void;
  onConfirm: (variant: Variant) => void;
}

export default function VariantModal({ product, onClose, onConfirm }: Props) {
  const [selected, setSelected] = React.useState<Variant | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="text-lg font-bold text-gray-800">{product.title}</h3>
            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mt-0.5">Sélectionnez une option</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-5 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-2">
            {product.variants.map((variant) => (
              <button
                key={variant._id}
                onClick={() => setSelected(variant)}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-200 group
                  ${selected?._id === variant._id 
                    ? 'border-[var(--primary)] bg-[var(--primary)]/5' 
                    : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                  }`}
              >
                <div className="text-left">
                  <p className={`font-bold text-sm ${selected?._id === variant._id ? 'text-[var(--primary)]' : 'text-gray-700'}`}>
                    {variant.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 font-medium">Stock: {variant.stock}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-800">{variant.price.toLocaleString()} F</span>
                  <div className={`h-5 w-5 rounded-full border flex items-center justify-center
                      ${selected?._id === variant._id ? 'bg-[var(--primary)] border-[var(--primary)]' : 'border-gray-300 bg-white'}
                  `}>
                    {selected?._id === variant._id && <Check size={12} className="text-white" />}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 bg-white border-t border-gray-100 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-lg font-bold text-gray-600 hover:bg-gray-100 transition-colors text-sm"
          >
            Annuler
          </button>
          <button 
            onClick={() => selected && onConfirm(selected)}
            disabled={!selected}
            className="flex-1 py-3 px-4 rounded-lg font-bold text-white bg-[var(--primary)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg text-sm"
          >
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}