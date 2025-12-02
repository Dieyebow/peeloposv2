import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePOS } from '../context/POSContext';
import { api } from '../services/api';
import { Product, Variant, CartItem } from '../types';
import { Search, LogOut, Grid, List, ShoppingCart, Loader2, Zap, Plus, Menu, Bell, Wallet, Package, Layers, ShoppingBag } from 'lucide-react';

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

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-[#eaeaec]"><Loader2 className="animate-spin text-[var(--primary)]" /></div>;

  return (
    <div className="flex flex-col h-screen w-full bg-[#f8f9fa] overflow-hidden font-sans text-slate-900">
      
      {/* 1. TOP NAVBAR */}
      <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0 z-40 sticky top-0">
         <div className="flex items-center gap-6">
             <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
                 <Menu size={24} />
             </button>
             <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
         </div>

         {/* Centered Search */}
         <div className="hidden md:flex flex-1 max-w-xl mx-auto relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--primary)] transition-colors" size={18} />
              <input 
                  type="text" 
                  placeholder="Rechercher un produit..." 
                  className="w-full bg-gray-100 pl-11 pr-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:bg-white transition-all border border-transparent"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
              />
         </div>

         <div className="flex items-center gap-4">
             <button className="relative p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors">
                 <Bell size={20} />
                 <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
             </button>
             <div className="h-8 w-[1px] bg-gray-200 mx-1"></div>
             <button onClick={handleLogout} className="flex items-center gap-2 hover:bg-gray-50 p-1.5 rounded-xl transition-colors">
                 <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-bold">
                     {cashier?.name.charAt(0)}
                 </div>
             </button>
         </div>
      </header>

      {/* 2. MAIN LAYOUT (Content + Cart) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT: Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Dashboard Widgets Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Welcome / Active Cashier Card */}
                    <div className="lg:col-span-1 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-between h-48">
                         <div className="relative z-10">
                             <p className="text-white/80 font-medium mb-1">Caisse ouverte</p>
                             <h2 className="text-2xl font-bold">{cashier?.name}</h2>
                         </div>
                         <div className="relative z-10 flex items-center gap-3 bg-white/10 w-fit px-3 py-1.5 rounded-lg backdrop-blur-sm">
                             <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                             <span className="text-xs font-bold">En ligne</span>
                         </div>
                         {/* Decorative circles */}
                         <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                         <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-black/10 rounded-full blur-xl"></div>
                    </div>

                    {/* Stats Grid */}
                    <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center gap-3">
                             <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                                 <ShoppingBag size={24} />
                             </div>
                             <div>
                                 <p className="text-2xl font-bold text-gray-900">0</p>
                                 <p className="text-xs text-gray-500 font-medium">Ventes du jour</p>
                             </div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center gap-3">
                             <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                 <Wallet size={24} />
                             </div>
                             <div>
                                 <p className="text-2xl font-bold text-gray-900">0 F</p>
                                 <p className="text-xs text-gray-500 font-medium">CA Aujourd'hui</p>
                             </div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center gap-3">
                             <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                                 <Package size={24} />
                             </div>
                             <div>
                                 <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                                 <p className="text-xs text-gray-500 font-medium">Produits</p>
                             </div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center gap-3">
                             <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                                 <Layers size={24} />
                             </div>
                             <div>
                                 <p className="text-2xl font-bold text-gray-900">
                                     {new Set(products.map(p => p.category)).size}
                                 </p>
                                 <p className="text-xs text-gray-500 font-medium">Catégories</p>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Categories & Products Section */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-800">Produits Recommandés</h3>
                        <button className="text-[var(--primary)] text-sm font-bold hover:underline">Tout voir</button>
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 mb-4">
                         <button 
                            onClick={() => setActiveCategory('all')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all border
                                ${activeCategory === 'all' 
                                    ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-lg shadow-orange-200' 
                                    : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'}`}
                        >
                            Tout
                        </button>
                        {Array.from(new Set(products.map(p => p.category))).map(cat => (
                             <button 
                             key={cat}
                             onClick={() => setActiveCategory(cat)}
                             className={`px-6 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all border
                                 ${activeCategory === cat
                                     ? 'bg-white border-[var(--primary)] text-[var(--primary)] ring-2 ring-[var(--primary)]/10' 
                                     : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'}`}
                         >
                             {cat}
                         </button>
                        ))}
                    </div>

                    {/* Products Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                        {filteredProducts.map(product => (
                            <div 
                                key={product._id} 
                                onClick={() => handleProductClick(product)}
                                className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-gray-100 group flex flex-col"
                            >
                                <div className="aspect-square rounded-xl bg-gray-50 mb-4 overflow-hidden relative">
                                     {product.images[0] ? (
                                        <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <Package size={32} />
                                        </div>
                                    )}
                                    {/* Stock Tag */}
                                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-bold text-gray-800 shadow-sm border border-gray-100">
                                        {product.stock} en stock
                                    </div>
                                </div>
                                
                                <div className="flex-1 flex flex-col">
                                    <h4 className="font-bold text-gray-900 text-sm line-clamp-2 leading-tight mb-1 group-hover:text-[var(--primary)] transition-colors">
                                        {product.title}
                                    </h4>
                                    <p className="text-xs text-gray-400 mb-3">{product.category}</p>
                                    
                                    <div className="mt-auto flex items-center justify-between">
                                        <span className="text-lg font-extrabold text-gray-900">
                                            {product.price.toLocaleString()} F
                                        </span>
                                        <button className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center group-hover:bg-[var(--primary)] group-hover:text-white transition-colors">
                                            <Plus size={16} strokeWidth={3} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* RIGHT: Fixed Cart Sidebar */}
        <div className={`
            fixed inset-y-0 right-0 z-50 w-full sm:w-[400px] bg-white border-l border-gray-200 shadow-2xl transform transition-transform duration-300 lg:relative lg:transform-none lg:w-[420px] lg:shadow-none lg:block
            ${mobileCartOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}>
            <CartSidebar onPay={() => setShowPayment(true)} />
            
             {/* Mobile Close Button */}
             <button 
                onClick={() => setMobileCartOpen(false)} 
                className="lg:hidden absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500"
            >
                <LogOut className="rotate-180" size={20} />
            </button>
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
      
      {/* Mobile Cart Toggle Fab */}
      <button 
         onClick={() => setMobileCartOpen(true)}
         className="fixed bottom-6 right-6 lg:hidden z-40 bg-[var(--primary)] text-white p-4 rounded-full shadow-xl flex items-center gap-2"
      >
          <ShoppingCart size={24} />
          {cart.length > 0 && <span className="font-bold">{cart.length}</span>}
      </button>

      {/* Mobile Backdrop for Cart */}
      {mobileCartOpen && (
          <div className="fixed inset-0 bg-black/20 z-30 lg:hidden backdrop-blur-sm" onClick={() => setMobileCartOpen(false)} />
      )}
    </div>
  );
}