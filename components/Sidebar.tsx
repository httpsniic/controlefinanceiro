
import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Truck, 
  Store as StoreIcon,
  LogOut,
  ChevronRight,
  TrendingUp,
  ShoppingCart,
  Target,
  BarChart3,
  Users
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  onLogout: () => void;
  storeName?: string;
  currentUser: User | null;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, onLogout, storeName, currentUser }) => {
  const isAdmin = currentUser?.role === 'master';
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'billing', label: 'Faturamento', icon: TrendingUp },
    { id: 'purchases', label: 'Compras (NF)', icon: ShoppingCart },
    { id: 'strategic', label: 'Estratégico (CMC)', icon: BarChart3 },
    { id: 'goals', label: 'Metas Mensais', icon: Target },
    { id: 'groups', label: 'Grupos / Categorias', icon: Package },
    { id: 'suppliers', label: 'Fornecedores', icon: Truck },
  ];

  if (isAdmin) {
    menuItems.push({ id: 'users-admin', label: 'Controle de Acesso', icon: Users });
  }

  return (
    <div className="w-64 h-screen bg-slate-900 text-white flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <div className="bg-indigo-600 p-1 rounded-lg">
            <StoreIcon size={20} />
          </div>
          FinancePro
        </h1>
        {storeName && (
          <p className="text-slate-400 text-[10px] mt-2 uppercase tracking-widest font-black truncate">
            {storeName}
          </p>
        )}
      </div>

      <nav className="flex-1 mt-6 px-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                  activeView === item.id 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} />
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
                {activeView === item.id && <ChevronRight size={14} />}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={() => setActiveView('store-selector')}
          className="w-full flex items-center gap-3 p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors mb-2 text-sm"
        >
          <StoreIcon size={20} />
          Trocar Loja
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors text-sm"
        >
          <LogOut size={20} />
          Sair do Sistema
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
