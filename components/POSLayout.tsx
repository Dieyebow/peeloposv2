import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePOS } from '../context/POSContext';
import { api } from '../services/api';
import { Product, Variant, CartItem } from '../types';
import { Search, LogOut, LayoutGrid, Box, History, Users, Settings, ShoppingCart, Loader2, Bell, Layers } from 'lucide-react';

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

  const getPriceDisplay = (product: Product) => {
    if (product.hasVariants && product.variants.length > 0) {
        const minPrice = Math.min(...product.variants.map(v => v.price));
        return (
            <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">À partir de</span>
                <span className="text-lg font-bold text-gray-900">{minPrice.toLocaleString()} F</span>
            </div>
        );
    }
    return <p className="text-lg font-bold text-gray-900">{product.price.toLocaleString()} F</p>;
  };

  const getProductImage = (product: Product) => {
    if (product.hasVariants && product.variants && product.variants.length > 0) {
        const firstVariantImage = product.variants[0].images?.[0];
        if (firstVariantImage) return firstVariantImage;
    }
    return product.images?.[0];
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-[#f3f4f6]"><Loader2 className="animate-spin text-[var(--primary)]" /></div>;

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  return (
    <div className="flex h-screen w-full bg-[#f3f4f6] overflow-hidden font-sans text-slate-800">
      
      {/* 1. DARK SIDEBAR (Fixed Left) */}
      <aside className="hidden md:flex w-20 bg-[#1a1c1e] flex-col items-center py-8 gap-8 shrink-0 z-50">
          <div className="w-10 h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center text-white font-semibold shadow-lg shadow-[var(--primary)]/30">
              <img src="/logo-placeholder.png" onError={(e) => e.currentTarget.style.display = 'none'} alt="" className="w-6 h-6" />
              <div className="w-6 h-6 border-2 border-white rounded-full"></div>
          </div>

          <nav className="flex flex-col gap-6 w-full items-center">
              <button className="p-3 rounded-xl bg-[var(--primary)] text-white shadow-md">
                  <LayoutGrid size={24} />
              </button>
              <button className="p-3 rounded-xl text-gray-500 hover:bg-white/10 hover:text-white transition-colors">
                  <Box size={24} />
              </button>
              <button className="p-3 rounded-xl text-gray-500 hover:bg-white/10 hover:text-white transition-colors">
                  <History size={24} />
              </button>
          </nav>

          <div className="mt-auto flex flex-col gap-6 w-full items-center">
              <button onClick={handleLogout} className="p-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors">
                  <LogOut size={24} />
              </button>
          </div>
      </aside>

      {/* 2. MAIN CONTENT (Center) */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative">
        
        {/* Header */}
        <header className="px-8 py-6 flex items-center justify-between bg-[#f3f4f6] shrink-0">
             <div>
                 <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Créer une Transaction</h1>
             </div>

             <div className="flex items-center gap-4">
                 <div className="relative">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                     <input 
                        type="text" 
                        placeholder="Rechercher..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 pr-4 py-2.5 bg-white rounded-full text-sm border-none shadow-sm focus:ring-2 focus:ring-[var(--primary)] w-64 font-medium"
                     />
                 </div>
                 <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                     <div className="text-right hidden sm:block">
                         <p className="text-sm font-bold text-gray-900">{cashier?.name}</p>
                         <p className="text-xs text-gray-400 font-medium">Caissier</p>
                     </div>
                     <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm">
                         <img 
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(cashier?.name || '')}&background=random`} 
                            alt="Profile" 
                            className="w-full h-full object-cover" 
                         />
                     </div>
                 </div>
             </div>
        </header>

        {/* Filters & Grid */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-8 pb-8">
            
            {/* Category Pills */}
            <div className="flex gap-3 mb-8 overflow-x-auto no-scrollbar py-1">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-sm flex items-center gap-2
                            ${activeCategory === cat 
                                ? 'bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/20' 
                                : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                    >
                        <span className="capitalize">{cat === 'all' ? 'Tous les produits' : cat}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeCategory === cat ? 'bg-black/20 text-white' : 'bg-gray-100 text-gray-400'}`}>
                            {cat === 'all' ? products.length : products.filter(p => p.category === cat).length}
                        </span>
                    </button>
                ))}
            </div>

            {/* Products Grid - EXACT NIKE STYLE */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => {
                    const imgUrl = getProductImage(product);
                    return (
                        <div 
                            key={product._id} 
                            onClick={() => handleProductClick(product)}
                            className="bg-white rounded-[24px] p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col cursor-pointer border border-transparent hover:border-gray-100"
                        >
                            {/* Image Container */}
                            <div className="relative aspect-square rounded-[20px] bg-[#f8f9fa] mb-4 overflow-hidden">
                                {imgUrl ? (
                                    <img src={imgUrl} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <Box size={32} />
                                    </div>
                                )}
                                
                                {/* Stock Badge (Black Pill) */}
                                <div className="absolute top-3 left-3 bg-black/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold text-white z-10 shadow-sm">
                                    {product.stock} Stock
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 flex flex-col">
                                <h3 className="font-bold text-gray-900 text-base line-clamp-1 mb-1">{product.title}</h3>
                                <p className="text-xs text-gray-400 mb-4 line-clamp-2 font-medium">{product.description || 'Produit sans description'}</p>
                                
                                <div className="mt-auto">
                                    {getPriceDisplay(product)}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

      </main>

      {/* 3. CART SIDEBAR (Fixed Right) */}
      <aside className={`
            fixed inset-y-0 right-0 z-50 w-full sm:w-[400px] bg-white border-l border-gray-200 shadow-2xl transform transition-transform duration-300 lg:relative lg:transform-none lg:w-[420px] lg:shadow-none lg:block
            ${mobileCartOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}>
             <CartSidebar onPay={() => setShowPayment(true)} />
             <button 
                onClick={() => setMobileCartOpen(false)} 
                className="lg:hidden absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500"
            >
                <LogOut className="rotate-180" size={20} />
            </button>
      </aside>

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
      
      {/* Mobile Cart Toggle */}
      <button 
         onClick={() => setMobileCartOpen(true)}
         className="fixed bottom-6 right-6 lg:hidden z-40 bg-[var(--primary)] text-white p-4 rounded-full shadow-xl flex items-center gap-2"
      >
          <ShoppingCart size={24} />
          {cart.length > 0 && <span className="font-bold">{cart.length}</span>}
      </button>

      {/* Mobile Backdrop */}
      {mobileCartOpen && (
          <div className="fixed inset-0 bg-black/20 z-30 lg:hidden backdrop-blur-sm" onClick={() => setMobileCartOpen(false)} />
      )}
    </div>
  );
}