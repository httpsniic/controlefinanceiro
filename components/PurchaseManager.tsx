import React, { useState } from 'react';
import { Transaction, ProductGroup, Supplier, TransactionType } from '../types';
import { Plus, Trash2, CalendarDays } from 'lucide-react';
import { maskCurrency, parseCurrency, maskDate, dateToISO, isoToDisplayDate } from '../utils';

interface PurchaseManagerProps {
  purchases: Transaction[];
  groups: ProductGroup[];
  suppliers: Supplier[];
  onAdd: (data: any) => void;
  onDelete: (id: string) => void;
}

const PurchaseManager: React.FC<PurchaseManagerProps> = ({ purchases, groups, suppliers, onAdd, onDelete }) => {
  const [formData, setFormData] = useState({
    date: isoToDisplayDate(new Date().toISOString().split('T')[0]),
    amount: '',
    groupId: '',
    supplierId: '',
    invoiceNumber: '',
    description: 'Compra de Insumos'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.groupId) return;
    
    onAdd({
      ...formData,
      amount: parseCurrency(formData.amount),
      date: dateToISO(formData.date),
      type: TransactionType.PURCHASE
    });

    setFormData({
      date: isoToDisplayDate(new Date().toISOString().split('T')[0]),
      amount: '',
      groupId: '',
      supplierId: '',
      invoiceNumber: '',
      description: 'Compra de Insumos'
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-black text-slate-800 px-2">Lançamento de Compras</h2>
      
      <div className="bg-indigo-50/50 border border-indigo-100 p-8 rounded-[32px]">
        <h3 className="text-sm font-black text-indigo-900 mb-6 flex items-center gap-2">
          <Plus size={18} /> Nova Compra
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 items-end gap-4">
          <div className="w-full">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Data Emissão</label>
            <input 
              type="text" 
              required
              placeholder="DD/MM/AAAA"
              className="w-full p-4 rounded-2xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
              value={formData.date}
              onChange={e => setFormData({...formData, date: maskDate(e.target.value)})}
              maxLength={10}
            />
          </div>
          <div className="w-full">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Valor (R$)</label>
            <input 
              type="text" 
              required
              placeholder="0,00"
              className="w-full p-4 rounded-2xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-right"
              value={formData.amount}
              onChange={e => setFormData({...formData, amount: maskCurrency(e.target.value)})}
            />
          </div>
          <div className="w-full">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">NF</label>
            <input 
              type="text" 
              placeholder="000.000"
              className="w-full p-4 rounded-2xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
              value={formData.invoiceNumber}
              onChange={e => setFormData({...formData, invoiceNumber: e.target.value})}
            />
          </div>
          <div className="w-full">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Grupo</label>
            <select 
              required
              className="w-full p-4 rounded-2xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 font-bold appearance-none"
              value={formData.groupId}
              onChange={e => setFormData({...formData, groupId: e.target.value})}
            >
              <option value="">Selecione...</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
          <div className="w-full">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Fornecedor</label>
            <select 
              required
              className="w-full p-4 rounded-2xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 font-bold appearance-none"
              value={formData.supplierId}
              onChange={e => setFormData({...formData, supplierId: e.target.value})}
            >
              <option value="">Selecione...</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white px-4 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg h-[58px]">
            <Plus size={18} /> LANÇAR
          </button>
        </form>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden mt-8">
        <div className="px-8 py-6 bg-slate-50/50 border-b border-slate-100">
           <h3 className="font-black text-slate-700 text-sm">Últimas Compras do Mês</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-[10px] uppercase font-black text-slate-400 bg-slate-50/30">
                <th className="px-8 py-4">Emissão</th>
                <th className="px-8 py-4">NF</th>
                <th className="px-8 py-4">Fornecedor</th>
                <th className="px-8 py-4">Grupo</th>
                <th className="px-8 py-4 text-right">Valor</th>
                <th className="px-8 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {purchases.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-4 text-sm font-bold text-slate-600">{new Date(p.date + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                  <td className="px-8 py-4 text-sm font-medium text-slate-500">{p.invoiceNumber || '-'}</td>
                  <td className="px-8 py-4 text-sm font-medium">{suppliers.find(s => s.id === p.supplierId)?.name || '-'}</td>
                  <td className="px-8 py-4 text-xs font-black text-indigo-400 uppercase">{groups.find(g => g.id === p.groupId)?.name}</td>
                  <td className="px-8 py-4 text-sm font-black text-right">{new Intl.NumberFormat('pt-BR', {style: 'currency', currency:'BRL'}).format(p.amount)}</td>
                  <td className="px-8 py-4 text-right">
                    <button onClick={() => onDelete(p.id)} className="text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={18}/></button>
                  </td>
                </tr>
              ))}
              {purchases.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-10 text-center text-slate-400 font-bold">Nenhuma compra registrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PurchaseManager;