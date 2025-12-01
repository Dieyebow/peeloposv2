import axios from 'axios';
import { Shop, Product, Cashier, TransactionPayload, TransactionResponse } from '../types';

const API_BASE = 'https://apicommerce.aipeelo.xyz/api';

// Simple in-memory cache for demo performance
const cache: Record<string, any> = {};

export const api = {
  getShop: async (chatbotId: string): Promise<Shop | null> => {
    const url = `${API_BASE}/chatbots/${chatbotId}/peelo-shop`;
    if (cache[url]) return cache[url];
    try {
        const res = await axios.get(url);
        if(res.data.success) {
            cache[url] = res.data.shop;
            return res.data.shop;
        }
        return null;
    } catch (e) {
        console.error("API Error [getShop]:", e);
        throw e;
    }
  },

  getProducts: async (chatbotId: string): Promise<Product[]> => {
    const url = `${API_BASE}/chatbots/${chatbotId}/products?limit=100`;
    try {
        const res = await axios.get(url);
        if(res.data.success) return res.data.products;
        return [];
    } catch (e) {
        console.error("API Error [getProducts]:", e);
        return [];
    }
  },

  getCashiers: async (chatbotId: string): Promise<Cashier[]> => {
     try {
        const res = await axios.get(`${API_BASE}/chatbots/${chatbotId}/cashiers?active=true`);
        if(res.data.success) return res.data.cashiers;
        return [];
     } catch (e) {
        console.error("API Error [getCashiers]:", e);
        return [];
     }
  },

  verifyPin: async (cashierId: string, pin: string): Promise<boolean> => {
     try {
         const res = await axios.post(`${API_BASE}/cashiers/${cashierId}/verify-pin`, { pin });
         return res.data.success;
     } catch (e) {
         console.error("API Error [verifyPin]:", e);
         // Keep a small backdoor for testing if API fails completely, removing this will lock you out if API is down
         // Remove the line below if you want strictly ONLY API verification
         // if (pin === '1234') return true; 
         return false;
     }
  },

  createTransaction: async (chatbotId: string, payload: TransactionPayload): Promise<TransactionResponse> => {
      try {
          const res = await axios.post(`${API_BASE}/chatbots/${chatbotId}/transactions`, payload);
          if(res.data.success) return res.data.transaction;
          throw new Error("Transaction failed");
      } catch (e) {
          console.error("API Error [createTransaction]:", e);
          throw e;
      }
  }
};