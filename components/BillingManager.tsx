import React, { useState } from 'react';
import { DailyRevenue } from '../types';
import { Plus, Trash2, Calendar as CalendarIcon, TrendingUp } from 'lucide-react';
import { maskCurrency, parseCurrency, maskDate, dateToISO, isoToDisplayDate } from '../utils';

interface BillingManagerProps {
  revenues: DailyRevenue[];
  onAdd: (data: Omit<DailyRevenue, 'id' | 'storeId' | 'total'>) => void;
  onDelete: (id: string) => void;
}

const BillingManager: React.FC<BillingManagerProps> = ({ revenues, onAdd, onDelete }) => {
  const [formData, setFormData] = useState({
    date: isoToDisplayDate(new Date().toISOString().split('T')[0]),
    salon: '',
    delivery: '',
    serviceCharge: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      date: dateToISO(formData.date),
      salon: parseCurrency(formData.salon),
      delivery: parseCurrency(formData.delivery),
      serviceCharge: parseCurrency(formData.serviceCharge)
    };
    console.log('📤 Dados enviados:', data);
    console.log('💰 Service Charge:', formData.serviceCharge, '→', parseCurrency(formData.serviceCharge));
    onAdd(data);
    setFormData({ ...formData, salon: '', delivery: '', serviceCharge: '' });
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const cleanDate = dateStr.split('T')[0];
    const [year, month, day] = cleanDate.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm col-span-1 md:col-span-2 lg:col-span-1">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-indigo-600" />
            Novo Faturamento
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Data</label>
              <input 
                type="text" 
                required
                placeholder="DD/MM/AAAA"
                className="w-full p-3 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.date}
                onChange={e => setFormData({...formData, date: maskDate(e.target.value)})}
                maxLength={10}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Salão (R$)</label>
              <input 
                type="text" 
                placeholder="0,00"
                className="w-full p-3 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-right font-bold"
                value={formData.salon}
                onChange={e => setFormData({...formData, salon: maskCurrency(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Delivery (R$)</label>
              <input 
                type="text" 
                placeholder="0,00"
                className="w-full p-3 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-right font-bold"
                value={formData.delivery}
                onChange={e => setFormData({...formData, delivery: maskCurrency(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">10% / Serviço (R$)</label>
              <input 
                type="text" 
                placeholder="0,00"
                className="w-full p-3 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-right font-bold"
                value={formData.serviceCharge}
                onChange={e => setFormData({...formData, serviceCharge: maskCurrency(e.target.value)})}
              />
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100">
              <Plus size={20} /> LANÇAR DIA
            </button>
          </form>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Histórico de Faturamento</h3>
              <div className="text-sm font-medium text-slate-500">
                Total Acumulado: {formatCurrency(revenues.reduce((acc, curr) => acc + curr.total, 0))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-slate-400 text-xs uppercase tracking-wider bg-slate-50/50">
                    <th className="px-8 py-4">Data</th>
                    <th className="px-8 py-4 text-right">Salão</th>
                    <th className="px-8 py-4 text-right">Delivery</th>
                    <th className="px-8 py-4 text-right">10%</th>
                    <th className="px-8 py-4 text-right font-bold text-slate-600">Total Dia</th>
                    <th className="px-8 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {revenues.length === 0 ? (
                    <tr><td colSpan={6} className="px-8 py-20 text-center text-slate-400">Nenhum faturamento lançado.</td></tr>
                  ) : (
                    revenues.sort((a,b) => b.date.localeCompare(a.date)).map(rev => (
                      <tr key={rev.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-5 text-sm font-medium flex items-center gap-2">
                          <CalendarIcon size={16} className="text-slate-300" />
                          {formatDate(rev.date)}
                        </td>
                        <td className="px-8 py-5 text-sm text-right text-slate-600">{formatCurrency(rev.salon || 0)}</td>
                        <td className="px-8 py-5 text-sm text-right text-slate-600">{formatCurrency(rev.delivery || 0)}</td>
                        <td className="px-8 py-5 text-sm text-right text-slate-500 italic">{formatCurrency(rev.serviceCharge || 0)}</td>
                        <td className="px-8 py-5 text-sm text-right font-black text-indigo-600">{formatCurrency(rev.total || 0)}</td>
                        <td className="px-8 py-5 text-right">
                          <button onClick={() => onDelete(rev.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
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
        </div>
      </div>
    </div>
  );
};

export default BillingManager;