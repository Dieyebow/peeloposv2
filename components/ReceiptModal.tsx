import React from 'react';
import { TransactionResponse } from '../types';
import { usePOS } from '../context/POSContext';
import { Printer, Check, ArrowRight } from 'lucide-react';

interface Props {
  transaction: TransactionResponse;
  onClose: () => void;
}

export default function ReceiptModal({ transaction, onClose }: Props) {
  const { shop, cashier } = usePOS();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl flex flex-col items-center animate-in zoom-in-95">
        
        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <Check className="h-8 w-8 text-green-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Payment Successful!</h2>
        <p className="text-gray-500 mb-8">{transaction.change > 0 ? `Change: ${transaction.change.toLocaleString()} F` : 'No change due'}</p>

        <div className="w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-6 mb-6 font-mono text-sm">
            <div className="text-center mb-4 pb-4 border-b border-gray-200">
                <p className="font-bold text-lg uppercase">{shop?.name || 'STORE'}</p>
                <p>{new Date(transaction.createdAt).toLocaleString()}</p>
                <p>Host: {cashier?.name}</p>
                <p>Ref: {transaction.transactionNumber}</p>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-800">
                <span>TOTAL PAID</span>
                <span>{transaction.totalAmount.toLocaleString()} F</span>
            </div>
        </div>

        <div className="flex gap-3 w-full">
            <button className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors">
                <Printer size={18} /> Print
            </button>
            <button 
                onClick={onClose}
                className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
            >
                New Order <ArrowRight size={18} />
            </button>
        </div>
      </div>
    </div>
  );
}
