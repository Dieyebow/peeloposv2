export interface Shop {
  _id: string;
  chatbotId: string;
  name: string;
  description?: string;
  logo?: string;
  style: {
    primaryColor: string;
    secondaryColor: string;
  };
  payment: {
    methods: string[];
    currency: string;
  };
  categories: { _id: string; name: string; order: number }[];
}

export interface Variant {
  _id: string;
  name: string;
  price: number;
  stock: number;
  images: string[];
}

export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  category: string;
  hasVariants: boolean;
  variants: Variant[];
  isActive: boolean;
}

export interface Cashier {
  _id: string;
  name: string;
  role: string;
  avatar?: string;
  isActive: boolean;
}

export interface CartItem {
  key: string; // Unique key: productId + variantId
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variant: string | null;
  variantId: string | null;
  stock: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface TransactionPayload {
  cashierId: string;
  items: {
    productId: string;
    variantId: string | null;
    name: string;
    variant: string | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  subtotal: number;
  discount: number;
  totalAmount: number;
  payments: { method: string; amount: number }[];
  cashGiven: number;
  change: number;
  paymentStatus: 'paid';
  source: 'pos';
}

export interface TransactionResponse {
  _id: string;
  transactionNumber: string;
  totalAmount: number;
  change: number;
  createdAt: string;
}