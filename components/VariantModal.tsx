import React, { useState, useEffect } from 'react';
import { Product, Variant } from '../types';
import { X, Check, AlertCircle, ShoppingBag, Package } from 'lucide-react';
import { usePOS } from '../context/POSContext';

interface Props {
  product: Product;
  onClose: () => void;
  onConfirm: (variant: Variant) => void;
}

export default function VariantModal({ product, onClose, onConfirm }: Props) {
  const { shop } = usePOS();
  // Auto-select the first in-stock variant if available
  const [selected, setSelected] = useState<Variant | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product.variants && product.variants.length > 0) {
      const firstInStock = product.variants.find(v => v.stock > 0);
      if (firstInStock) {
        setSelected(firstInStock);
      }
    }
  }, [product]);

  const handleConfirm = () => {
    if (selected && !isSubmitting) {
      setIsSubmitting(true);
      onConfirm(selected);
      onClose();
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: 'Épuisé', color: 'text-red-500', bg: 'bg-red-50' };
    if (stock < 5) return { label: `Faible (${stock})`, color: 'text-orange-500', bg: 'bg-orange-50' };
    return { label: `${stock} en stock`, color: 'text-green-600', bg: 'bg-green-50' };
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white w-full max-w-3xl rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header with Image Background effect */}
        <div className="relative h-72 bg-gray-100 shrink-0 overflow-hidden">
            {(product.images?.[0] || (product.variants?.[0]?.images?.[0])) ? (
               <div className="absolute inset-0">
                  <img
                    src={product.images?.[0] || product.variants?.[0]?.images?.[0]}
                    className="w-full h-full object-cover blur-sm opacity-50 scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
               </div>
            ) : null}

            <button
                onClick={(e) => {
                    console.log('X button clicked');
                    e.stopPropagation();
                    e.preventDefault();
                    onClose();
                }}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors shadow-sm z-20 cursor-pointer"
            >
                <X size={20} />
            </button>

            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-6">
                <div className="w-48 h-48 rounded-2xl bg-white p-2 shadow-2xl mb-4">
                    {(selected?.images && selected.images.length > 0 && selected.images[0]) || product.images?.[0] || product.variants?.[0]?.images?.[0] ? (
                        <img
                          key={selected?._id || 'default'}
                          src={(selected?.images && selected.images.length > 0 && selected.images[0]) || product.images?.[0] || product.variants?.[0]?.images?.[0]}
                          className="w-full h-full object-cover rounded-xl transition-all duration-300"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-50 rounded-xl flex items-center justify-center text-gray-300">
                            <ShoppingBag size={48} />
                        </div>
                    )}
                </div>
                <div className="text-center">
                    <h3 className="font-bold text-2xl text-gray-900 mb-1">{product.title}</h3>
                    <p className="text-gray-500 text-sm font-medium">Sélectionnez une option</p>
                </div>
            </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
            
            <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Variantes Disponibles</span>
                    {selected && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getStockStatus(selected.stock).bg} ${getStockStatus(selected.stock).color}`}>
                            {getStockStatus(selected.stock).label}
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {product.variants.map((variant, index) => {
                        // Use name + price as unique identifier since _id is undefined
                        const variantKey = `${variant.name}-${variant.price}`;
                        const selectedKey = selected ? `${selected.name}-${selected.price}` : null;
                        const isSelected = selected !== null && variantKey === selectedKey;
                        const isOutOfStock = variant.stock === 0;

                        return (
                            <button
                                key={index}
                                disabled={isOutOfStock}
                                onClick={() => {
                                    setSelected(variant);
                                }}
                                className={`
                                    relative p-4 rounded-xl border-2 text-left transition-all duration-200 group
                                    ${isSelected
                                        ? 'border-gray-900 bg-gray-50'
                                        : 'border-gray-100 bg-white hover:border-gray-200'
                                    }
                                    ${isOutOfStock ? 'opacity-50 cursor-not-allowed grayscale' : ''}
                                `}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`font-bold text-sm ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>
                                        {variant.name}
                                    </span>
                                    {isSelected && (
                                        <div className="bg-gray-900 text-white rounded-full p-1 shadow-md">
                                            <Check size={16} strokeWidth={3} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-between items-end">
                                    <span className="font-bold text-gray-900">{variant.price.toLocaleString()} F</span>
                                    {!isOutOfStock && variant.stock < 5 && (
                                        <span className="text-[10px] text-orange-500 font-bold flex items-center gap-1">
                                            <AlertCircle size={10} /> Fin de stock
                                        </span>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Product Details (Optional extra info) */}
            <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
                <div className="bg-white p-2 rounded-lg text-gray-400 shadow-sm">
                    <Package size={20} />
                </div>
                <div className="flex-1">
                     <p className="text-xs text-gray-500 font-medium">Référence Produit</p>
                     <p className="text-sm font-bold text-gray-900">
                        {selected?._id?.slice(-6).toUpperCase() || product._id?.slice(-6).toUpperCase() || 'REF'}
                     </p>
                </div>
            </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 bg-white mt-auto">
            <div className="flex items-center justify-between mb-4">
                <span className="text-gray-500 font-medium">Prix unitaire</span>
                <span className="text-2xl font-extrabold text-gray-900">
                    {selected ? selected.price.toLocaleString() : product.price.toLocaleString()} F
                </span>
            </div>

            <button
                onClick={handleConfirm}
                disabled={!selected || selected.stock === 0}
                className={`w-full py-4 rounded-[18px] font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-2
                    ${selected && selected.stock > 0
                        ? 'bg-[var(--primary)] text-white hover:opacity-90 active:scale-[0.98] shadow-[var(--primary)]/20'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                    }
                `}
            >
                {selected?.stock === 0 ? 'Rupture de stock' : 'Ajouter au panier'}
            </button>
        </div>

      </div>
    </div>
  );
}