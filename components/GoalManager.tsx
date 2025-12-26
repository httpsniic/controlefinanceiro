import React, { useState } from 'react';
import { StoreGoal } from '../types';
import { Target, Plus, Trash2, Calendar, TrendingUp, Percent, Ticket } from 'lucide-react';
import { maskCurrency, parseCurrency } from '../utils';

interface GoalManagerProps {
  goals: StoreGoal[];
  onAdd: (month: string, rev: number, cmc: number, ticket: number) => void;
  onDelete: (id: string) => void;
}

const GoalManager: React.FC<GoalManagerProps> = ({ goals, onAdd, onDelete }) => {
  const [formData, setFormData] = useState({ month: new Date().toISOString().slice(0, 7), revenue: '', cmc: '30', ticket: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.revenue) {
      onAdd(formData.month, parseCurrency(formData.revenue), parseFloat(formData.cmc), parseCurrency(formData.ticket));
      setFormData({ ...formData, revenue: '', ticket: '' });
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <h2 className="text-xl font-black text-slate-800 px-2">Gestão de Metas</h2>

      <div className="bg-[#F5F3FF] border border-[#EDE9FE] p-8 rounded-[32px]">
        <h3 className="text-sm font-black text-indigo-900 mb-6 flex items-center gap-2">
          <Plus size={18} /> Cadastrar Nova Meta
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row items-end gap-4">
          <div className="flex-1 w-full">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Período</label>
            <input 
              type="month" required
              className="w-full p-4 rounded-2xl bg-white border border-slate-200 outline-none font-bold"
              value={formData.month} onChange={e => setFormData({...formData, month: e.target.value})}
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Fat. Meta (R$)</label>
            <input 
              type="text" required placeholder="0,00"
              className="w-full p-4 rounded-2xl bg-white border border-slate-200 outline-none font-bold text-right"
              value={formData.revenue} onChange={e => setFormData({...formData, revenue: maskCurrency(e.target.value)})}
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">CMC Meta (%)</label>
            <input 
              type="number" required
              className="w-full p-4 rounded-2xl bg-white border border-slate-200 outline-none font-bold text-center"
              value={formData.cmc} onChange={e => setFormData({...formData, cmc: e.target.value})}
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Ticket Médio (R$)</label>
            <input 
              type="text" placeholder="0,00"
              className="w-full p-4 rounded-2xl bg-white border border-slate-200 outline-none font-bold text-right"
              value={formData.ticket} onChange={e => setFormData({...formData, ticket: maskCurrency(e.target.value)})}
            />
          </div>
          <button type="submit" className="w-full lg:w-auto bg-purple-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 h-[58px] shadow-lg">
             Adicionar
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map(goal => (
          <div key={goal.id} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <button onClick={() => onDelete(goal.id)} className="text-slate-200 hover:text-rose-500 transition-colors"><Trash2 size={20}/></button>
            </div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Calendar size={20}/></div>
              <h4 className="text-xl font-black text-slate-800 capitalize">
                {new Date(goal.month + '-02').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </h4>
            </div>
            <div className="space-y-6">
               <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-emerald-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase">Faturamento Alvo</span>
                  </div>
                  <span className="font-black text-slate-800">{new Intl.NumberFormat('pt-BR', {style:'currency', currency:'BRL'}).format(goal.target || 0)}</span>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 bg-slate-50 rounded-2xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Percent size={14} className="text-amber-500" />
                      <span className="text-[9px] font-black text-slate-400 uppercase">CMC Meta</span>
                    </div>
                    <span className="font-black text-slate-800">{goal.cmcTarget || 0}%</span>
                 </div>
                 <div className="p-4 bg-slate-50 rounded-2xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Ticket size={14} className="text-indigo-500" />
                      <span className="text-[9px] font-black text-slate-400 uppercase">Ticket Médio</span>
                    </div>
                    <span className="font-black text-slate-800">{new Intl.NumberFormat('pt-BR', {style:'currency', currency:'BRL'}).format(goal.avgTicket || 0)}</span>
                 </div>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GoalManager;