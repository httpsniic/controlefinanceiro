import React, { useState } from 'react';
import { ProductGroup } from '../types';
import { Package, Plus, Trash2, Percent } from 'lucide-react';

interface ProductGroupManagerProps {
  groups: ProductGroup[];
  onAdd: (name: string, color: string, cmcTarget: number) => void;
  onDelete: (id: string) => void;
}

const ProductGroupManager: React.FC<ProductGroupManagerProps> = ({ groups, onAdd, onDelete }) => {
  const [formData, setFormData] = useState({ name: '', color: '#3b82f6', cmcTarget: '30' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onAdd(formData.name.trim(), formData.color, parseFloat(formData.cmcTarget));
      setFormData({ name: '', color: '#3b82f6', cmcTarget: '30' });
    }
  };

  const colors = [
    '#ef4444', '#f59e0b', '#10b981', '#3b82f6', 
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      <h2 className="text-xl font-black text-slate-800 px-2">Grupos de Produtos</h2>
      
      <div className="bg-indigo-50/50 border border-indigo-100 p-8 rounded-[32px]">
        <h3 className="text-sm font-black text-indigo-900 mb-6 flex items-center gap-2">
          <Plus size={18} /> Cadastrar Novo Grupo
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-end gap-4">
          <div className="flex-1 w-full">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Nome do Grupo</label>
            <input 
              type="text" 
              required
              placeholder="Ex: Pizza, Bebidas..."
              className="w-full p-4 rounded-2xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="w-full md:w-auto">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Cor</label>
            <div className="flex gap-2 p-2 bg-white rounded-2xl border border-slate-200">
              {colors.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFormData({...formData, color: c})}
                  className={`w-10 h-10 rounded-xl transition-all ${formData.color === c ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="w-full md:w-32">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Meta CMV (%)</label>
            <input 
              type="number" 
              required
              className="w-full p-4 rounded-2xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-center"
              value={formData.cmcTarget}
              onChange={e => setFormData({...formData, cmcTarget: e.target.value})}
            />
          </div>
          <button 
            type="submit"
            className="w-full md:w-auto bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 h-[58px] shadow-lg"
          >
            <Plus size={18} /> Adicionar Grupo
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map(group => (
          <div 
            key={group.id} 
            className="bg-white p-6 rounded-[32px] border-2 border-slate-100 shadow-sm relative overflow-hidden hover:shadow-lg transition-all"
          >
            <div 
              className="absolute top-0 left-0 w-2 h-full"
              style={{ backgroundColor: group.color }}
            />
            <div className="pl-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="p-3 rounded-2xl"
                    style={{ backgroundColor: `${group.color}20` }}
                  >
                    <Package size={24} style={{ color: group.color }} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-800">{group.name}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Grupo de Produtos</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (confirm(`Deseja deletar o grupo "${group.name}"?`)) {
                      onDelete(group.id);
                    }
                  }}
                  className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                <Percent size={16} className="text-slate-400" />
                <span className="text-xs font-black text-slate-400 uppercase">Meta CMV:</span>
                <span className="text-sm font-black text-slate-700 ml-auto">{group.cmcTarget || 0}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {groups.length === 0 && (
        <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-slate-200">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
            <Package size={40} />
          </div>
          <h3 className="text-xl font-black text-slate-800 mb-2">Nenhum grupo cadastrado</h3>
          <p className="text-slate-400 font-medium max-w-xs mx-auto">
            Crie grupos para organizar seus produtos e controlar o CMV por categoria.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductGroupManager;