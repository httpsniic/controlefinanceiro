
import React, { useState } from 'react';
import { ProductGroup } from '../types';
import { Plus, Trash2 } from 'lucide-react';

interface ProductGroupManagerProps {
  groups: ProductGroup[];
  onAdd: (name: string, color: string, target: number, icon: string) => void;
  onDelete: (id: string) => void;
}

const ProductGroupManager: React.FC<ProductGroupManagerProps> = ({ groups, onAdd, onDelete }) => {
  const [formData, setFormData] = useState({ name: '', color: '#4F46E5', target: '30' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name) {
      onAdd(formData.name, formData.color, parseFloat(formData.target), "");
      setFormData({ name: '', color: '#4F46E5', target: '30' });
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <h2 className="text-xl font-black text-slate-800 px-2">Gestão de Grupos</h2>

      <div className="bg-indigo-50/50 border border-indigo-100 p-8 rounded-[32px]">
        <h3 className="text-sm font-black text-indigo-900 mb-6 flex items-center gap-2">
          <Plus size={18} /> Cadastrar Novo Grupo
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row items-end gap-4">
          <div className="flex-[2] w-full">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Nome do Grupo</label>
            <input 
              type="text" required placeholder="Ex: Pizza, Bebidas..."
              className="w-full p-4 rounded-2xl bg-white border border-slate-200 outline-none font-bold"
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Cor</label>
            <input 
              type="color" className="w-full h-[58px] p-1 rounded-2xl bg-white border border-slate-200 cursor-pointer"
              value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})}
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Meta CMV (%)</label>
            <input 
              type="number" required
              className="w-full p-4 rounded-2xl bg-white border border-slate-200 outline-none font-bold text-center"
              value={formData.target} onChange={e => setFormData({...formData, target: e.target.value})}
            />
          </div>
          <button type="submit" className="w-full lg:w-auto bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 h-[58px] shadow-lg">
             Adicionar Grupo
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {groups.map(group => (
          <div key={group.id} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative group overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: group.color }}></div>
            <div className="flex items-center justify-between mb-6">
              <div className="p-4 bg-slate-50 rounded-2xl">
                <div className="w-8 h-8 rounded-full" style={{ backgroundColor: group.color }}></div>
              </div>
              <button onClick={() => onDelete(group.id)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-rose-500 transition-all">
                <Trash2 size={18} />
              </button>
            </div>
            <h4 className="text-xl font-black text-slate-800 mb-4">{group.name}</h4>
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Meta CMV</span>
                  <span className="text-sm font-black text-slate-700">{group.cmcTarget}%</span>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductGroupManager;
