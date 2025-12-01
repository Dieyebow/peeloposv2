import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePOS } from '../context/POSContext';
import { api } from '../services/api';
import { Product, Variant, CartItem } from '../types';
import { Search, LogOut, Grid, List, ShoppingCart, Loader2, Store } from 'lucide-react';

import VariantModal from './VariantModal';
import CartSidebar from './CartSidebar';
import PaymentModal from './PaymentModal';
import ReceiptModal from './ReceiptModal';

export default function POSLayout() {
  const { chatbotId } = useParams<{ chatbotId: string }>();
  const navigate = useNavigate();
  const { cashier, shop, setShop, setCashier, addToCart, cart } = usePOS();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  
  // Modals & UI State
  const [variantProduct, setVariantProduct] = useState<Product | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);

  useEffect(() => {
    if (!cashier) {
        navigate(`/pos-login/${chatbotId}`);
        return;
    }
    if (chatbotId) {
        loadProducts(chatbotId);
        // Ensure shop is loaded if refreshed
        if (!shop) api.getShop(chatbotId).then(setShop);
    }
  }, [chatbotId, cashier]);

  const loadProducts = async (id: string) => {
    const data = await api.getProducts(id);
    setProducts(data);
    setLoading(false);
  };

  const handleLogout = () => {
    setCashier(null);
    navigate(`/pos-login/${chatbotId}`);
  };

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleProductClick = (product: Product) => {
    if (product.hasVariants && product.variants.length > 0) {
      setVariantProduct(product);
    } else {
      const item: CartItem = {
        key: `${product._id}-base`,
        productId: product._id,
        name: product.title,
        price: product.price,
        quantity: 1,
        image: product.images[0],
        variant: null,
        variantId: null,
        stock: product.stock
      };
      addToCart(item);
    }
  };

  const handleVariantConfirm = (variant: Variant) => {
    if (!variantProduct) return;
    const item: CartItem = {
        key: `${variantProduct._id}-${variant._id}`,
        productId: variantProduct._id,
        name: variantProduct.title,
        price: variant.price,
        quantity: 1,
        image: variant.images[0] || variantProduct.images[0],
        variant: variant.name,
        variantId: variant._id,
        stock: variant.stock
    };
    addToCart(item);
    setVariantProduct(null);
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (loading) return <div className="h-screen w-full flex items-center justify-center"><Loader2 className="animate-spin text-[var(--primary)]" /></div>;

  return (
    <div className="flex h-screen w-full bg-gray-100 overflow-hidden font-sans">
      
      {/* 1. Sidebar / Navigation - Softer dark background */}
      <div className="hidden md:flex w-20 lg:w-20 bg-slate-800 flex-col items-center py-6 gap-6 shrink-0 z-20 shadow-xl">
        <div className="h-10 w-10 bg-[var(--primary)] rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg">
            <Store size={20} />
        </div>
        
        <nav className="flex-1 flex flex-col gap-4 w-full items-center">
            <button className="p-3 bg-white/10 rounded-lg text-white/90 shadow-inner"><Grid size={22} /></button>
            <button className="p-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"><List size={22} /></button>
        </nav>

        <button onClick={handleLogout} className="p-3 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors mb-4" title="Déconnexion">
            <LogOut size={22} />
        </button>
      </div>

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header */}
        <header className="bg-white h-16 md:h-18 px-4 md:px-6 border-b border-gray-200 flex items-center justify-between shrink-0 shadow-sm z-10">
            <div className="flex items-center gap-3">
                {/* Mobile Logout (replaces sidebar) */}
                <button onClick={handleLogout} className="md:hidden p-2 text-gray-500 hover:text-red-500">
                    <LogOut size={20} />
                </button>
                <div>
                    <h1 className="text-lg md:text-xl font-bold text-gray-700 leading-tight">{shop?.name || 'Peelo POS'}</h1>
                    <p className="text-xs text-gray-500 hidden sm:block">Caissier: <span className="text-[var(--primary)] font-medium">{cashier?.name}</span></p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="relative w-40 md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Rechercher un produit..." 
                        className="w-full bg-gray-100 pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:bg-white transition-all border border-transparent"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                
                {/* Mobile Cart Toggle */}
                <button 
                    className="lg:hidden relative p-2.5 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg active:bg-[var(--primary)]/20 transition-colors"
                    onClick={() => setMobileCartOpen(!mobileCartOpen)}
                >
                    <ShoppingCart size={22} />
                    {cart.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white font-bold animate-pulse">
                            {cart.length}
                        </span>
                    )}
                </button>
            </div>
        </header>

        {/* Content Grid */}
        <div className="flex-1 flex overflow-hidden relative">
            {/* Products Area */}
            <div className="flex-1 flex flex-col bg-slate-50">
                
                {/* Categories */}
                <div className="px-4 md:px-6 py-4 overflow-x-auto no-scrollbar flex gap-2 shrink-0">
                    <button 
                        onClick={() => setActiveCategory('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all shadow-sm active:scale-95
                            ${activeCategory === 'all' 
                                ? 'bg-[var(--primary)] text-white' 
                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                    >
                        Tout
                    </button>
                    {/* Extract unique categories */}
                    {Array.from(new Set(products.map(p => p.category))).map(cat => (
                         <button 
                         key={cat}
                         onClick={() => setActiveCategory(cat)}
                         className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all shadow-sm active:scale-95
                             ${activeCategory === cat
                                 ? 'bg-[var(--primary)] text-white' 
                                 : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                     >
                         {cat}
                     </button>
                    ))}
                </div>

                {/* Product Grid */}
                <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-24 md:pb-6 custom-scrollbar">
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                        {filteredProducts.map(product => (
                            <div 
                                key={product._id} 
                                onClick={() => handleProductClick(product)}
                                className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer border border-gray-100 hover:border-[var(--primary)] group flex flex-col h-full relative"
                            >
                                <div className="aspect-square rounded-md bg-gray-100 overflow-hidden mb-3 relative">
                                    {product.images[0] ? (
                                        <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold text-2xl bg-gray-100">
                                            {product.title.charAt(0)}
                                        </div>
                                    )}
                                    {product.stock <= 0 && (
                                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                                            <span className="bg-red-500 text-white text-[10px] px-2 py-1 rounded font-bold shadow-sm uppercase tracking-wide">Rupture</span>
                                        </div>
                                    )}
                                </div>
                                <h3 className="font-bold text-gray-700 text-sm leading-tight mb-1 line-clamp-2">{product.title}</h3>
                                <div className="mt-auto flex items-center justify-between">
                                    <span className="font-extrabold text-[var(--primary)] text-sm">
                                        {product.price.toLocaleString()} F
                                    </span>
                                    {product.hasVariants && <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded tracking-wide">Options</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Cart Section - Desktop: Column, Mobile: Drawer */}
            <div className={`
                fixed inset-y-0 right-0 z-30 w-full sm:w-[380px] bg-white shadow-2xl transform transition-transform duration-300 lg:relative lg:transform-none lg:w-[360px] lg:shadow-none lg:border-l lg:border-gray-200 lg:block
                ${mobileCartOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
            `}>
                {/* Mobile Close Button */}
                <div className="lg:hidden absolute top-3 left-3 z-10">
                    <button onClick={() => setMobileCartOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                        <LogOut className="rotate-180 text-gray-600" size={20} />
                    </button>
                </div>
                
                <CartSidebar onPay={() => setShowPayment(true)} />
            </div>
        </div>
      </div>

      {/* Modals */}
      {variantProduct && (
        <VariantModal 
            product={variantProduct} 
            onClose={() => setVariantProduct(null)} 
            onConfirm={handleVariantConfirm} 
        />
      )}

      {showPayment && (
          <PaymentModal 
            total={cartTotal} 
            onClose={() => setShowPayment(false)} 
            onSuccess={(txn) => {
                setShowPayment(false);
                setLastTransaction(txn);
            }} 
          />
      )}

      {lastTransaction && (
          <ReceiptModal 
            transaction={lastTransaction} 
            onClose={() => setLastTransaction(null)} 
          />
      )}
      
      {/* Mobile Backdrop for Cart */}
      {mobileCartOpen && (
          <div className="fixed inset-0 bg-black/20 z-20 lg:hidden backdrop-blur-sm" onClick={() => setMobileCartOpen(false)} />
      )}
    </div>
  );
}