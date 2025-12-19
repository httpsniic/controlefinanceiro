
import React from 'react';
import { Transaction, TransactionType, ProductGroup, Supplier } from '../types';
import { Trash2, ShoppingBag, Receipt, ArrowUpRight, ArrowDownLeft, CalendarDays } from 'lucide-react';
import { isoToDisplayDate } from '../utils';

interface TransactionListProps {
  transactions: Transaction[];
  groups: ProductGroup[];
  suppliers: Supplier[];
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, groups, suppliers, onDelete, onAddNew }) => {
  const getGroupName = (id: string) => groups.find(g => g.id === id)?.name || 'Sem categoria';
  const getSupplierName = (id?: string) => suppliers.find(s => s.id === id)?.name || '-';

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn">
      <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <h2 className="text-xl font-bold text-slate-800">Histórico Financeiro</h2>
        <button 
          onClick={onAddNew}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all flex items-center gap-2"
        >
          Novo Lançamento
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-slate-400 text-xs uppercase tracking-wider bg-slate-50">
              <th className="px-8 py-4 font-semibold">Data</th>
              <th className="px-8 py-4 font-semibold">Vencimento</th>
              <th className="px-8 py-4 font-semibold">Descrição</th>
              <th className="px-8 py-4 font-semibold">Tipo</th>
              <th className="px-8 py-4 font-semibold">Grupo</th>
              <th className="px-8 py-4 font-semibold text-right">Valor</th>
              <th className="px-8 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-8 py-20 text-center text-slate-400">
                  <div className="flex flex-col items-center gap-4">
                    <Receipt size={48} className="opacity-20" />
                    <p>Nenhuma transação encontrada.</p>
                  </div>
                </td>
              </tr>
            ) : (
              transactions.sort((a,b) => b.date.localeCompare(a.date)).map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-8 py-5 text-sm text-slate-600 whitespace-nowrap">
                    {isoToDisplayDate(t.date)}
                  </td>
                  <td className="px-8 py-5 text-sm text-rose-500 font-bold whitespace-nowrap">
                    {t.dueDate ? (
                      <div className="flex items-center gap-1">
                        <CalendarDays size={14} className="opacity-40" />
                        {isoToDisplayDate(t.dueDate)}
                      </div>
                    ) : '-'}
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm font-bold text-slate-800">{t.description}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      {t.type === TransactionType.INCOME ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                          <ArrowUpRight size={14} /> Entrada
                        </span>
                      ) : t.type === TransactionType.EXPENSE ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-full">
                          <ArrowDownLeft size={14} /> Gasto
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                          <ShoppingBag size={14} /> Compra
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-medium text-slate-600">
                    {getGroupName(t.groupId)}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className={`text-sm font-bold ${t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {t.type === TransactionType.INCOME ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => onDelete(t.id)}
                      className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionList;
