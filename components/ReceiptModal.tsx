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
      <div className="bg-white rounded-xl w-full max-w-sm p-8 shadow-2xl flex flex-col items-center animate-in zoom-in-95 font-sans">
        
        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-md">
            <Check className="h-8 w-8 text-green-600" strokeWidth={3} />
        </div>
        
        <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Paiement Réussi !</h2>
        <p className="text-gray-500 mb-8 font-medium">{transaction.change > 0 ? `Monnaie: ${transaction.change.toLocaleString()} F` : 'Pas de monnaie à rendre'}</p>

        <div className="w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-6 mb-6 font-mono text-sm relative">
            <div className="absolute -left-3 top-1/2 -mt-2 h-4 w-4 rounded-full bg-black/70" />
            <div className="absolute -right-3 top-1/2 -mt-2 h-4 w-4 rounded-full bg-black/70" />
            
            <div className="text-center mb-4 pb-4 border-b border-gray-200">
                <p className="font-bold text-lg uppercase">{shop?.name || 'STORE'}</p>
                <p className="text-xs text-gray-500 mt-1">{new Date(transaction.createdAt).toLocaleString()}</p>
                <p className="text-xs text-gray-500">Caissier: {cashier?.name}</p>
                <p className="text-xs text-gray-500">Ref: {transaction.transactionNumber}</p>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-800">
                <span>TOTAL PAYÉ</span>
                <span>{transaction.totalAmount.toLocaleString()} F</span>
            </div>
        </div>

        <div className="flex gap-3 w-full">
            <button className="flex-1 py-3 bg-white border-2 border-gray-100 hover:border-gray-200 text-gray-700 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors">
                <Printer size={18} /> Reçu
            </button>
            <button 
                onClick={onClose}
                className="flex-1 py-3 bg-[var(--primary)] hover:opacity-90 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-colors shadow-lg"
            >
                Suivant <ArrowRight size={18} />
            </button>
        </div>
      </div>
    </div>
  );
}