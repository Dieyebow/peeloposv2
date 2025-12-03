
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

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return new Date().toLocaleString('fr-FR');
    return new Date(dateStr).toLocaleString('fr-FR');
  };

  // Helper to get variant name safe
  const getVariantName = (item: any) => {
    if (typeof item.variant === 'string') return item.variant;
    return item.variant?.name || '';
  };

  return (
    <>
      {/* On-Screen Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in print:hidden">
        <div className="bg-white rounded-xl w-full max-w-md p-8 shadow-2xl flex flex-col items-center animate-in zoom-in-95 font-sans max-h-[90vh] overflow-y-auto custom-scrollbar">
          
          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-md shrink-0">
              <Check className="h-8 w-8 text-green-600" strokeWidth={3} />
          </div>
          
          <h2 className="text-2xl font-extrabold text-gray-900 mb-1 text-center">Paiement Réussi !</h2>
          <p className="text-gray-500 mb-8 font-medium text-center">
            {transaction.change > 0 
                ? `Monnaie à rendre: ${transaction.change.toLocaleString()} F` 
                : 'Pas de monnaie à rendre'}
          </p>

          {/* Visual Receipt Preview */}
          <div className="w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-6 mb-6 font-mono text-sm relative">
              <div className="absolute -left-3 top-1/2 -mt-2 h-4 w-4 rounded-full bg-black/70" />
              <div className="absolute -right-3 top-1/2 -mt-2 h-4 w-4 rounded-full bg-black/70" />
              
              <div className="text-center mb-4 pb-4 border-b border-gray-200 border-dashed">
                  <p className="font-bold text-lg uppercase">{shop?.name || 'STORE'}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(transaction.createdAt)}</p>
                  <p className="text-xs text-gray-500">Caissier: {transaction.cashierName || cashier?.name}</p>
                  <p className="text-xs text-gray-500">Ref: {transaction.transactionNumber || transaction._id.slice(-6).toUpperCase()}</p>
              </div>

              {/* Items List */}
              <div className="space-y-2 mb-4 pb-4 border-b border-gray-200 border-dashed">
                  {transaction.items && transaction.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start">
                          <div className="flex-1 pr-2">
                              <p className="font-bold text-gray-800 leading-tight">{item.title}</p>
                              <div className="flex gap-2 text-xs text-gray-500">
                                  <span>{item.quantity} x {item.price.toLocaleString()}</span>
                                  {getVariantName(item) && <span className="uppercase">({getVariantName(item)})</span>}
                              </div>
                          </div>
                          <span className="font-bold text-gray-800">{item.subtotal.toLocaleString()}</span>
                      </div>
                  ))}
              </div>

              <div className="flex justify-between text-base font-bold text-gray-800 mb-1">
                  <span>TOTAL</span>
                  <span>{transaction.totalAmount.toLocaleString()} F</span>
              </div>
              
              {/* Payment Methods Breakdown */}
              {transaction.payments && transaction.payments.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200 border-dashed">
                      <p className="text-xs font-bold text-gray-400 uppercase mb-1">Paiements</p>
                      {transaction.payments.map((p, i) => (
                          <div key={i} className="flex justify-between text-xs text-gray-600">
                              <span className="capitalize">{p.method.replace(/_/g, ' ')}</span>
                              <span>{p.amount.toLocaleString()} F</span>
                          </div>
                      ))}
                      <div className="flex justify-between text-xs text-gray-600 mt-1">
                           <span>Monnaie</span>
                           <span>{transaction.change.toLocaleString()} F</span>
                      </div>
                  </div>
              )}
          </div>

          <div className="flex gap-3 w-full shrink-0">
              <button 
                  onClick={handlePrint}
                  className="flex-1 py-3 bg-white border-2 border-gray-100 hover:border-gray-200 text-gray-700 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
              >
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

      {/* Hidden Print Layout (Thermal Printer Friendly) */}
      <div className="hidden print:block fixed top-0 left-0 w-full h-full bg-white z-[9999]">
          <style>{`
            @media print {
              @page { margin: 0; size: auto; }
              body { margin: 0; padding: 0; }
              .no-print { display: none !important; }
            }
          `}</style>
          <div className="w-[80mm] mx-auto p-2 font-mono text-black text-xs leading-tight">
              
              {/* Header */}
              <div className="text-center mb-3">
                  <h1 className="text-lg font-bold uppercase mb-1">{shop?.name}</h1>
                  <p>{shop?.description}</p>
                  <div className="my-2 border-b border-black border-dashed"></div>
                  <p>{formatDate(transaction.createdAt)}</p>
                  <p>Caissier: {transaction.cashierName || cashier?.name}</p>
                  <p>Ticket: #{transaction.transactionNumber || transaction._id.slice(-6).toUpperCase()}</p>
              </div>

              {/* Items */}
              <div className="mb-3">
                  <div className="flex font-bold border-b border-black border-dashed pb-1 mb-1">
                      <span className="flex-1">DESIGNATION</span>
                      <span className="w-12 text-right">TOTAL</span>
                  </div>
                  {transaction.items && transaction.items.map((item, idx) => (
                      <div key={idx} className="mb-2">
                          <div className="font-bold">{item.title}</div>
                          {getVariantName(item) && <div className="text-[10px] uppercase">Var: {getVariantName(item)}</div>}
                          <div className="flex justify-between mt-0.5">
                               <span>{item.quantity} x {item.price.toLocaleString()}</span>
                               <span className="font-bold">{item.subtotal.toLocaleString()}</span>
                          </div>
                      </div>
                  ))}
              </div>

              {/* Totals */}
              <div className="border-t border-b border-black border-dashed py-2 mb-2">
                  <div className="flex justify-between text-sm font-bold">
                      <span>TOTAL A PAYER</span>
                      <span>{transaction.totalAmount.toLocaleString()} F</span>
                  </div>
              </div>

              {/* Payment Details */}
              <div className="mb-4">
                  {transaction.payments && transaction.payments.map((p, i) => (
                      <div key={i} className="flex justify-between">
                          <span className="capitalize">{p.method.replace(/_/g, ' ')}</span>
                          <span>{p.amount.toLocaleString()}</span>
                      </div>
                  ))}
                  <div className="flex justify-between mt-1">
                      <span>Monnaie Rendue</span>
                      <span>{transaction.change.toLocaleString()}</span>
                  </div>
              </div>

              {/* Footer */}
              <div className="text-center mt-4">
                  <p className="font-bold">*** MERCI DE VOTRE VISITE ***</p>
                  <p className="mt-1 text-[10px]">Propulsé par Peelo POS</p>
              </div>
          </div>
      </div>
    </>
  );
}
