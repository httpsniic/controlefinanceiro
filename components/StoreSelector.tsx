
import React, { useState } from 'react';
import { Store, User } from '../types';
import { Plus, Store as StoreIcon, ArrowRight, Trash2 } from 'lucide-react';

interface StoreSelectorProps {
  stores: Store[];
  onSelect: (id: string) => void;
  onCreate: (name: string) => void;
  onDelete: (id: string) => void;
  currentUser: User | null;
}

const StoreSelector: React.FC<StoreSelectorProps> = ({ stores, onSelect, onCreate, onDelete, currentUser }) => {
  const [newStoreName, setNewStoreName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const isMaster = currentUser?.role === 'master';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStoreName.trim()) {
      onCreate(newStoreName.trim());
      setNewStoreName('');
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 animate-fadeIn">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-black text-slate-900 mb-2">Painel de Lojas</h1>
        <p className="text-slate-500 font-medium">
          {isMaster 
            ? 'Gerenciamento global de todas as unidades do sistema.' 
            : 'Selecione uma loja autorizada para gerenciar as finanças.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.map((store) => (
          <div 
            key={store.id} 
            className="group relative bg-white p-6 rounded-[32px] border-2 border-slate-100 hover:border-indigo-500 transition-all cursor-pointer shadow-sm hover:shadow-xl"
            onClick={() => onSelect(store.id)}
          >
            <div className="flex flex-col h-full">
              <div className="bg-indigo-50 text-indigo-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <StoreIcon size={24} />
              </div>
              <h3 className="text-lg font-black text-slate-800 mb-1">{store.name}</h3>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-6">Unidade Operacional</p>
              
              <div className="mt-auto flex items-center justify-between">
                <span className="text-indigo-600 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                  Entrar <ArrowRight size={16} />
                </span>
                {isMaster && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if(confirm('ATENÇÃO: Deseja excluir esta loja e TODOS os seus dados permanentemente?')) onDelete(store.id);
                    }}
                    className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {isMaster && (
          isCreating ? (
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-[32px] border-2 border-indigo-200 shadow-sm animate-scaleIn">
              <h3 className="text-lg font-black text-slate-800 mb-4">Nova Unidade</h3>
              <input
                autoFocus
                type="text"
                value={newStoreName}
                onChange={(e) => setNewStoreName(e.target.value)}
                placeholder="Nome da loja..."
                className="w-full p-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 mb-4 font-bold"
                required
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-black text-xs uppercase hover:bg-indigo-700 transition-colors"
                >
                  Criar
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-3 text-slate-500 hover:bg-slate-100 rounded-xl font-black text-xs uppercase transition-colors"
                >
                  Sair
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="group p-6 rounded-[32px] border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all flex flex-col items-center justify-center text-slate-400 hover:text-indigo-500 min-h-[220px]"
            >
              <div className="p-4 bg-slate-100 rounded-2xl mb-3 group-hover:bg-indigo-100 transition-colors">
                <Plus size={32} />
              </div>
              <span className="font-black text-xs uppercase tracking-widest">Adicionar Unidade</span>
            </button>
          )
        )}
      </div>

      {!isMaster && stores.length === 0 && (
        <div className="mt-12 p-12 bg-white rounded-[40px] border-2 border-dashed border-slate-200 text-center animate-fadeIn">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
            <StoreIcon size={40} />
          </div>
          <h2 className="text-xl font-black text-slate-800 mb-2">Sem acesso a lojas</h2>
          <p className="text-slate-400 font-medium max-w-xs mx-auto">Sua conta ainda não tem permissão para acessar nenhuma loja. Solicite acesso ao administrador master.</p>
        </div>
      )}
    </div>
  );
};

export default StoreSelector;
