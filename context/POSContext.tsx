import React, { createContext, useContext, useEffect, useState, PropsWithChildren } from 'react';
import { Cashier, Shop, CartItem } from '../types';

interface POSContextType {
  shop: Shop | null;
  setShop: (shop: Shop) => void;
  cashier: Cashier | null;
  setCashier: (cashier: Cashier | null) => void;
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (key: string) => void;
  updateQuantity: (key: string, delta: number) => void;
  clearCart: () => void;
  chatbotId: string | null;
  setChatbotId: (id: string) => void;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export const POSProvider = ({ children }: PropsWithChildren<{}>) => {
  const [shop, setShop] = useState<Shop | null>(null);
  const [cashier, setCashier] = useState<Cashier | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [chatbotId, setChatbotId] = useState<string | null>(null);

  // Inject Shop Colors into CSS Variables
  useEffect(() => {
    if (shop?.style) {
      document.documentElement.style.setProperty('--primary', shop.style.primaryColor);
      // Fallback to primary if secondary isn't defined or distinct
      document.documentElement.style.setProperty('--secondary', shop.style.secondaryColor || shop.style.primaryColor);
      
      // Calculate a lighter shade for backgrounds (rough approximation)
      document.documentElement.style.setProperty('--primary-light', `${shop.style.primaryColor}15`); // 15 = roughly 8% opacity hex
    } else {
      // Default fallback
      document.documentElement.style.setProperty('--primary', '#075E54');
      document.documentElement.style.setProperty('--secondary', '#128C7E');
      document.documentElement.style.setProperty('--primary-light', '#075E5415');
    }
  }, [shop]);

  const addToCart = (newItem: CartItem) => {
    setCart(prev => {
      const existingIdx = prev.findIndex(item => item.key === newItem.key);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx].quantity += newItem.quantity;
        return updated;
      }
      return [...prev, newItem];
    });
  };

  const updateQuantity = (key: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.key === key) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (key: string) => {
    setCart(prev => prev.filter(item => item.key !== key));
  };

  const clearCart = () => setCart([]);

  return (
    <POSContext.Provider value={{
      shop, setShop,
      cashier, setCashier,
      cart, addToCart, removeFromCart, updateQuantity, clearCart,
      chatbotId, setChatbotId
    }}>
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => {
  const context = useContext(POSContext);
  if (!context) throw new Error('usePOS must be used within a POSProvider');
  return context;
};