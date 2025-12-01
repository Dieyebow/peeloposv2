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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-gray-800">{product.title}</h3>
            <p className="text-sm text-gray-500">Select an option</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-3">
            {product.variants.map((variant) => (
              <button
                key={variant._id}
                onClick={() => setSelected(variant)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 group
                  ${selected?._id === variant._id 
                    ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
              >
                <div className="text-left">
                  <p className={`font-medium ${selected?._id === variant._id ? 'text-orange-900' : 'text-gray-700'}`}>
                    {variant.name}
                  </p>
                  <p className="text-sm text-gray-500">Stock: {variant.stock}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-800">{variant.price.toLocaleString()} F</span>
                  {selected?._id === variant._id && (
                    <div className="h-6 w-6 rounded-full bg-orange-500 flex items-center justify-center">
                      <Check size={14} className="text-white" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => selected && onConfirm(selected)}
            disabled={!selected}
            className="flex-1 py-3 px-4 rounded-xl font-semibold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-orange-200"
          >
            Add to Order
          </button>
        </div>
      </div>
    </div>
  );
}
