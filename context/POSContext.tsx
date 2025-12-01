import React, { createContext, useContext, useState, ReactNode, PropsWithChildren } from 'react';
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

// Fix: Use PropsWithChildren to make children prop optional in type definition, avoiding errors when consumers use it with nested elements
export const POSProvider = ({ children }: PropsWithChildren<{}>) => {
  const [shop, setShop] = useState<Shop | null>(null);
  const [cashier, setCashier] = useState<Cashier | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [chatbotId, setChatbotId] = useState<string | null>(null);

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