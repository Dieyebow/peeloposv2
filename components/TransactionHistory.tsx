import React, { useEffect, useState } from 'react';
import { X, Receipt, Calendar, User, Package, TrendingUp, Loader2, AlertCircle } from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { api } from '../services/api';
import { TransactionResponse } from '../types';

interface Props {
  onClose: () => void;
  chatbotId: string;
}

export default function TransactionHistory({ onClose, chatbotId }: Props) {
  const { cashier } = usePOS();
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'mine'>('mine');

  useEffect(() => {
    loadTransactions();
  }, [chatbotId, filter, cashier]);

  const loadTransactions = async () => {
    if (!chatbotId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const params = filter === 'mine' && cashier ? { cashierId: cashier._id, limit: 50 } : { limit: 50 };
      console.log('Loading transactions with params:', params);
      const data = await api.getTransactions(chatbotId, params);
      console.log('Transactions received:', data);
      setTransactions(data || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const totalRevenue = transactions.reduce((sum, txn) => sum + txn.totalAmount, 0);
  const totalItems = transactions.reduce((sum, txn) => sum + txn.items.reduce((s, item) => s + item.quantity, 0), 0);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white w-full max-w-5xl rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] p-6 shrink-0 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors shadow-sm z-20"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Receipt className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Historique des Transactions</h2>
              <p className="text-white/80 text-sm font-medium">
                {filter === 'mine' ? `Transactions de ${cashier?.name}` : 'Toutes les transactions'}
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Receipt className="text-white/70" size={16} />
                <span className="text-white/70 text-xs font-medium uppercase tracking-wider">Total Transactions</span>
              </div>
              <p className="text-3xl font-bold text-white">{transactions.length}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Package className="text-white/70" size={16} />
                <span className="text-white/70 text-xs font-medium uppercase tracking-wider">Articles Vendus</span>
              </div>
              <p className="text-3xl font-bold text-white">{totalItems}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="text-white/70" size={16} />
                <span className="text-white/70 text-xs font-medium uppercase tracking-wider">Revenu Total</span>
              </div>
              <p className="text-3xl font-bold text-white">{totalRevenue.toLocaleString()} F</p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setFilter('mine')}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                filter === 'mine'
                  ? 'bg-white text-[var(--primary)] shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Mes Transactions
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                filter === 'all'
                  ? 'bg-white text-[var(--primary)] shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Toutes
            </button>
          </div>
        </div>

        {/* Transaction List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-[var(--primary)]" size={32} />
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <AlertCircle size={48} className="mb-3 opacity-50" />
              <p className="text-lg font-medium">Aucune transaction trouvée</p>
              <p className="text-sm">Les transactions apparaîtront ici une fois effectuées</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((txn) => (
                <div
                  key={txn._id}
                  className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-lg hover:border-gray-200 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center shrink-0">
                        <Receipt className="text-[var(--primary)]" size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">
                            #{txn.transactionNumber || txn._id.slice(-6).toUpperCase()}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              txn.status === 'completed'
                                ? 'bg-green-100 text-green-600'
                                : txn.status === 'refunded'
                                ? 'bg-orange-100 text-orange-600'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {txn.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar size={12} />
                            <span>{formatDate(txn.createdAt)}</span>
                          </div>
                          {txn.cashierName && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <User size={12} />
                              <span>{txn.cashierName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{txn.totalAmount.toLocaleString()} F</p>
                      <p className="text-xs text-gray-400 font-medium">
                        {txn.items.reduce((s, item) => s + item.quantity, 0)} article(s)
                      </p>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="border-t border-gray-100 pt-3 space-y-2">
                    {txn.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <div className="flex-1">
                          <span className="text-gray-700 font-medium">{item.title}</span>
                          {item.variant && (
                            <span className="text-gray-400 text-xs ml-2">({item.variant.name})</span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-gray-500">
                          <span className="text-xs">×{item.quantity}</span>
                          <span className="font-bold text-gray-900 min-w-[80px] text-right">
                            {item.subtotal.toLocaleString()} F
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Payment Info */}
                  <div className="border-t border-gray-100 mt-3 pt-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 font-medium">Paiement:</span>
                      <div className="flex gap-2">
                        {txn.payments.map((payment, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-100 rounded-lg text-xs font-bold text-gray-700"
                          >
                            {payment.method}: {payment.amount.toLocaleString()} F
                          </span>
                        ))}
                      </div>
                    </div>
                    {txn.change > 0 && (
                      <div className="flex justify-between items-center text-sm mt-1">
                        <span className="text-gray-500 font-medium">Monnaie rendue:</span>
                        <span className="font-bold text-green-600">{txn.change.toLocaleString()} F</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
