
import React from 'react';
import { User, Store } from '../types';
import { Users, Shield, CheckCircle2, Circle } from 'lucide-react';

interface UserManagerProps {
  users: User[];
  stores: Store[];
  accessMap: Record<string, string[]>;
  onToggleAccess: (userId: string, storeId: string) => void;
}

const UserManager: React.FC<UserManagerProps> = ({ users, stores, accessMap, onToggleAccess }) => {
  const regularUsers = users.filter(u => u.role === 'user');

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200">
          <Users size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800">Controle de Acesso</h2>
          <p className="text-sm text-slate-400 font-bold">Gerencie quais lojas cada usuário pode visualizar e editar</p>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                <th className="px-8 py-6">Usuário</th>
                <th className="px-8 py-6">Lojas com Acesso Concedido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {regularUsers.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-8 py-20 text-center text-slate-400 font-bold">
                    Nenhum usuário comum cadastrado para gerenciar acesso.
                  </td>
                </tr>
              ) : (
                regularUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-8 w-1/3">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-black text-slate-800">{user.name}</h4>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <div className="flex flex-wrap gap-3">
                        {stores.map(store => {
                          const hasAccess = (accessMap[user.id] || []).includes(store.id);
                          const isOwner = store.ownerId === user.id;
                          
                          return (
                            <button
                              key={store.id}
                              disabled={isOwner}
                              onClick={() => onToggleAccess(user.id, store.id)}
                              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all border ${
                                isOwner 
                                  ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60' 
                                  : hasAccess 
                                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' 
                                    : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-400 hover:text-indigo-500'
                              }`}
                            >
                              {isOwner ? <Shield size={14} /> : hasAccess ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                              {store.name}
                              {isOwner && <span className="text-[8px] opacity-60 ml-1">(DONO)</span>}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManager;
