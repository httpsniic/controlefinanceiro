
import React, { useState } from 'react';
import { Supplier } from '../types';
import { Plus, Trash2, Truck, Mail, Phone } from 'lucide-react';
import { maskPhone } from '../utils';

interface SupplierManagerProps {
  suppliers: Supplier[];
  onAdd: (name: string, contact: string, email: string, categories: string) => void;
  onDelete: (id: string) => void;
}

const SupplierManager: React.FC<SupplierManagerProps> = ({ suppliers, onAdd, onDelete }) => {
  const [formData, setFormData] = useState({ name: '', contact: '', email: '', categories: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name) {
      onAdd(formData.name, formData.contact, formData.email, formData.categories);
      setFormData({ name: '', contact: '', email: '', categories: '' });
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <h2 className="text-xl font-black text-slate-800 px-2">Gestão de Fornecedores</h2>

      <div className="bg-[#E8F8F5] border border-[#D1F2EB] p-8 rounded-[32px]">
        <h3 className="text-sm font-black text-emerald-900 mb-6 flex items-center gap-2">
          <Plus size={18} /> Cadastrar Novo Fornecedor
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row items-end gap-4">
          <div className="flex-[2] w-full">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Nome</label>
            <input 
              type="text" required placeholder="Ex: Atacadão"
              className="w-full p-4 rounded-2xl bg-white border border-slate-200 outline-none font-bold"
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Contato</label>
            <input 
              type="text" placeholder="(00) 00000-0000"
              className="w-full p-4 rounded-2xl bg-white border border-slate-200 outline-none font-bold"
              value={formData.contact} 
              onChange={e => setFormData({...formData, contact: maskPhone(e.target.value)})}
              maxLength={15}
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">E-mail</label>
            <input 
              type="email" placeholder="contato@fornecedor.com"
              className="w-full p-4 rounded-2xl bg-white border border-slate-200 outline-none font-bold"
              value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Categorias (sep. vírgula)</label>
            <input 
              type="text" placeholder="Sushi, Outros"
              className="w-full p-4 rounded-2xl bg-white border border-slate-200 outline-none font-bold"
              value={formData.categories} onChange={e => setFormData({...formData, categories: e.target.value})}
            />
          </div>
          <button type="submit" className="w-full lg:w-auto bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 h-[58px] shadow-lg">
             Adicionar Fornecedor
          </button>
        </form>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
              <th className="px-8 py-6">Fornecedor</th>
              <th className="px-8 py-6">Informações</th>
              <th className="px-8 py-6">Categorias</th>
              <th className="px-8 py-6"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {suppliers.map(s => (
              <tr key={s.id} className="hover:bg-slate-50/30 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Truck size={20}/></div>
                    <span className="font-black text-slate-700">{s.name}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500"><Phone size={12}/> {s.contact || 'N/A'}</div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500"><Mail size={12}/> {s.email || 'N/A'}</div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-wrap gap-2">
                    {s.categories.split(',').map((c, i) => (
                      <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-tighter">
                        {c.trim()}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <button onClick={() => onDelete(s.id)} className="text-slate-200 hover:text-rose-500 transition-colors"><Trash2 size={20}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SupplierManager;
