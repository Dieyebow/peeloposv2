import React, { createContext, useContext, useEffect, useState, useRef, PropsWithChildren } from 'react';
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
  const addingRef = useRef(false);

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
    console.log('addToCart called with key:', newItem.key, 'quantity:', newItem.quantity);

    // Prevent double execution in React StrictMode
    if (addingRef.current) {
      console.log('Prevented double add - already processing');
      return;
    }

    addingRef.current = true;

    setCart(prev => {
      const existingIdx = prev.findIndex(item => item.key === newItem.key);
      if (existingIdx >= 0) {
        const updated = [...prev];
        const oldQty = updated[existingIdx].quantity;
        updated[existingIdx].quantity += newItem.quantity;
        console.log('Item exists. Old qty:', oldQty, 'Adding:', newItem.quantity, 'New qty:', updated[existingIdx].quantity);
        return updated;
      }
      console.log('New item added to cart');
      return [...prev, newItem];
    });

    // Reset the flag after a short delay
    setTimeout(() => {
      addingRef.current = false;
    }, 100);
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