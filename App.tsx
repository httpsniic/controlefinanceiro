
import React, { useState, useEffect, useMemo } from 'react';
import { 
  AppState, Store, Transaction, ProductGroup, Supplier, User,
  DailyRevenue, TransactionType, StoreGoal
} from './types';
import { db } from './services/db';
import StoreSelector from './components/StoreSelector';
import TransactionForm from './components/TransactionForm';
import ProductGroupManager from './components/ProductGroupManager';
import SupplierManager from './components/SupplierManager';
import BillingManager from './components/BillingManager';
import PurchaseManager from './components/PurchaseManager';
import Dashboard from './components/Dashboard';
import GoalManager from './components/GoalManager';
import UserManager from './components/UserManager';
import { 
  User as UserIcon, LogOut, ChevronLeft, ChevronRight, 
  LayoutDashboard, ShoppingCart, Target, Truck, 
  Package, TrendingUp, Percent, Calendar,
  Store as StoreIcon, Settings
} from 'lucide-react';

const App: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [authForm, setAuthForm] = useState({ user: '', password: '' });
  const [authError, setAuthError] = useState('');
  
  const [state, setState] = useState<AppState>(db.load());
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => { 
    db.save(state); 
  }, [state]);

  const userStores = useMemo(() => {
    if (!state.currentUser) return [];
    if (state.currentUser.role === 'master') return state.stores;
    const allowedIds = state.userStoreAccess[state.currentUser.id] || [];
    return state.stores.filter(s => allowedIds.includes(s.id));
  }, [state.stores, state.currentUser, state.userStoreAccess]);

  const activeStore = useMemo(() => state.stores.find(s => s.id === state.activeStoreId), [state.stores, state.activeStoreId]);
  const activeTransactions = useMemo(() => state.activeStoreId ? (state.transactions[state.activeStoreId] || []) : [], [state.transactions, state.activeStoreId]);
  const activeRevenues = useMemo(() => state.activeStoreId ? (state.dailyRevenues[state.activeStoreId] || []) : [], [state.dailyRevenues, state.activeStoreId]);
  const activeGoals = useMemo(() => state.activeStoreId ? (state.goals[state.activeStoreId] || []) : [], [state.goals, state.activeStoreId]);
  const activeGroups = useMemo(() => state.activeStoreId ? (state.productGroups[state.activeStoreId] || []) : [], [state.productGroups, state.activeStoreId]);
  const activeSuppliers = useMemo(() => state.activeStoreId ? (state.suppliers[state.activeStoreId] || []) : [], [state.suppliers, state.activeStoreId]);

  const monthData = useMemo(() => {
    const revs = activeRevenues.filter(r => r.date.startsWith(currentMonth));
    const purcs = activeTransactions.filter(t => t.date.startsWith(currentMonth) && t.type === TransactionType.PURCHASE);
    const goal = activeGoals.find(g => g.month === currentMonth);
    const totalRev = revs.reduce((s, r) => s + r.total, 0);
    const totalPurc = purcs.reduce((s, t) => s + t.amount, 0);
    return {
      revenue: totalRev,
      purchases: totalPurc,
      cmc: totalRev > 0 ? (totalPurc / totalRev) * 100 : 0,
      goal: goal?.revenueTarget || 0,
      cmcGoal: goal?.cmcTarget || 30
    };
  }, [activeRevenues, activeTransactions, activeGoals, currentMonth]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = state.users.find(u => u.username === authForm.user && u.password === authForm.password);
    if (user) { 
      setState(p => ({ ...p, currentUser: user })); 
      setAuthError(''); 
    } else { 
      setAuthError('Usuário ou senha incorretos.'); 
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação de Usuário: Apenas letras minúsculas
    if (!/^[a-z]+$/.test(authForm.user)) {
      setAuthError('O usuário deve conter apenas letras minúsculas.');
      return;
    }

    // Validação de Senha: Exatamente 6 dígitos numéricos
    if (!/^\d{6}$/.test(authForm.password)) {
      setAuthError('A senha deve ter exatamente 6 dígitos numéricos.');
      return;
    }

    // Validação de Duplicidade
    if (state.users.some(u => u.username === authForm.user)) { 
      setAuthError('Este nome de usuário já está em uso.'); 
      return; 
    }

    const newUser: User = { 
      id: `user-${Math.random().toString(36).substr(2, 9)}`, 
      username: authForm.user, 
      password: authForm.password, 
      name: authForm.user, // O nome padrão será o próprio usuário
      role: 'user' 
    };
    
    setState(prev => ({ 
      ...prev, 
      users: [...prev.users, newUser], 
      currentUser: newUser 
    }));
    setIsRegistering(false);
    setAuthForm({ user: '', password: '' });
  };

  const handleLogout = () => setState(prev => ({ ...prev, currentUser: null, activeStoreId: null }));
  const changeMonth = (dir: number) => {
    const d = new Date(currentMonth + '-02');
    d.setMonth(d.getMonth() + dir);
    setCurrentMonth(d.toISOString().slice(0, 7));
  };

  if (!state.currentUser) {
    return (
      <div className="min-h-screen bg-[#F4F7FE] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white p-10 rounded-[40px] shadow-xl border border-slate-100 animate-fadeIn">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 text-white rounded-2xl mb-4 shadow-lg">
              <LayoutDashboard size={32} />
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tighter">FinancePro</h1>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Acesso ao Sistema</p>
          </div>
          {authError && <div className="mb-4 p-3 bg-rose-50 text-rose-500 rounded-xl text-xs font-bold text-center border border-rose-100">{authError}</div>}
          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
            <input 
              type="text" 
              required 
              placeholder="Usuário (letras minúsculas)" 
              className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500" 
              value={authForm.user} 
              onChange={e => setAuthForm({...authForm, user: e.target.value.toLowerCase()})} 
            />
            <input 
              type="password" 
              required 
              placeholder="Senha (6 dígitos)" 
              maxLength={6}
              className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500" 
              value={authForm.password} 
              onChange={e => setAuthForm({...authForm, password: e.target.value.replace(/\D/g, '')})} 
            />
            <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-all uppercase tracking-widest text-[10px]">
              {isRegistering ? 'Criar Minha Conta' : 'Entrar no Sistema'}
            </button>
          </form>
          <button onClick={() => { setIsRegistering(!isRegistering); setAuthError(''); setAuthForm({user: '', password: ''}); }} className="w-full mt-6 text-indigo-500 font-black text-[10px] uppercase tracking-widest">
            {isRegistering ? 'Voltar para login' : 'Criar nova conta'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FE] text-slate-800">
      {state.activeStoreId ? (
        <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-6">
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div>
                <h1 className="text-3xl font-black text-indigo-900 tracking-tight flex items-center gap-3">
                   {activeStore?.name}
                   <span className="text-xs bg-indigo-50 text-indigo-500 px-3 py-1 rounded-lg uppercase tracking-widest font-black border border-indigo-100">Ativa</span>
                </h1>
                <p className="text-slate-400 font-medium text-sm">Controle Estratégico de Custos & Performance</p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center bg-slate-50 px-4 py-2 rounded-2xl gap-2 font-bold text-slate-600 border border-slate-100">
                   <UserIcon size={16} className="text-indigo-600" /> {state.currentUser.name}
                </div>
                
                <button 
                  onClick={() => setState(p => ({ ...p, activeStoreId: null }))}
                  className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-slate-200"
                >
                  <StoreIcon size={16} /> Trocar Loja
                </button>

                <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-sm border border-rose-100">
                  <LogOut size={16} /> Sair
                </button>

                <div className="flex items-center bg-slate-50 p-1 rounded-2xl border border-slate-200 ml-auto md:ml-0">
                  <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all"><ChevronLeft size={20}/></button>
                  <span className="px-4 font-black text-slate-700 capitalize text-sm whitespace-nowrap">
                    {new Date(currentMonth + '-02').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                  </span>
                  <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all"><ChevronRight size={20}/></button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <HeaderCard label="FATURAMENTO" value={monthData.revenue} sub={`Média/dia: R$ ${(monthData.revenue / 30).toFixed(2)}`} color="indigo" icon={TrendingUp} />
              <HeaderCard label="COMPRAS" value={monthData.purchases} sub="Total acumulado" color="orange" icon={ShoppingCart} />
              <HeaderCard label="CMC ATUAL" value={`${monthData.cmc.toFixed(2)}%`} sub={`Meta: ${monthData.cmcGoal}% | Diff: ${(monthData.cmc - monthData.cmcGoal).toFixed(2)}%`} color="green" icon={Percent} />
              <HeaderCard label="PROJEÇÃO" value={monthData.revenue} sub="Faltam 31 dias" color="purple" icon={Calendar} />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100 flex overflow-x-auto no-scrollbar">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'billing', label: 'Lançar Vendas', icon: TrendingUp },
              { id: 'purchases', label: 'Lançar Compras', icon: ShoppingCart },
              { id: 'goals', label: 'Metas', icon: Target },
              { id: 'suppliers', label: 'Fornecedores', icon: Truck },
              { id: 'groups', label: 'Grupos', icon: Package },
              ...(state.currentUser.role === 'master' ? [{ id: 'users-admin', label: 'Acessos', icon: Settings }] : [])
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeView === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="animate-fadeIn">
            {activeView === 'dashboard' && <Dashboard revenues={activeRevenues} transactions={activeTransactions} goals={activeGoals} />}
            {activeView === 'billing' && <BillingManager revenues={activeRevenues} onAdd={data => setState(p => ({...p, dailyRevenues: {...p.dailyRevenues, [activeStore!.id]: [ {...data, id: Math.random().toString(36).substr(2, 9), storeId: activeStore!.id, total: data.salon + data.delivery + data.serviceCharge}, ...(p.dailyRevenues[activeStore!.id] || []) ] }}))} onDelete={id => setState(p => ({...p, dailyRevenues: {...p.dailyRevenues, [activeStore!.id]: p.dailyRevenues[activeStore!.id].filter(r => r.id !== id)} }))} />}
            {activeView === 'purchases' && <PurchaseManager purchases={activeTransactions.filter(t => t.type === TransactionType.PURCHASE)} groups={activeGroups} suppliers={activeSuppliers} onAdd={data => setState(p => ({...p, transactions: {...p.transactions, [activeStore!.id]: [{id: Math.random().toString(36).substr(2, 9), storeId: activeStore!.id, ...data}, ...(p.transactions[activeStore!.id] || [])]}}))} onDelete={id => setState(p => ({...p, transactions: {...p.transactions, [activeStore!.id]: p.transactions[activeStore!.id].filter(t => t.id !== id)}}))} />}
            {activeView === 'goals' && <GoalManager goals={activeGoals} onAdd={(m, r, c, t) => setState(p => ({...p, goals: {...p.goals, [activeStore!.id]: [{id: Math.random().toString(36).substr(2,9), storeId: activeStore!.id, month: m, revenueTarget: r, cmcTarget: c, avgTicket: t}, ...(p.goals[activeStore!.id] || [])].filter((v,i,a) => a.findIndex(x => x.month === v.month) === i)}}))} onDelete={id => setState(p => ({...p, goals: {...p.goals, [activeStore!.id]: p.goals[activeStore!.id].filter(g => g.id !== id)}}))} />}
            {activeView === 'groups' && <ProductGroupManager groups={activeGroups} onAdd={(n, c, target, i) => setState(p => ({...p, productGroups: {...p.productGroups, [activeStore!.id]: [...(p.productGroups[activeStore!.id] || []), {id: Math.random().toString(36).substr(2, 9), name: n, color: c, cmcTarget: target, icon: i}]}}))} onDelete={id => setState(p => ({...p, productGroups: {...p.productGroups, [activeStore!.id]: p.productGroups[activeStore!.id].filter(g => g.id !== id)}}))} />}
            {activeView === 'suppliers' && <SupplierManager suppliers={activeSuppliers} onAdd={(n, c, e, cats) => setState(p => ({...p, suppliers: {...p.suppliers, [activeStore!.id]: [...(p.suppliers[activeStore!.id] || []), {id: Math.random().toString(36).substr(2, 9), name: n, contact: c, email: e, categories: cats}]}}))} onDelete={id => setState(p => ({...p, suppliers: {...p.suppliers, [activeStore!.id]: p.suppliers[activeStore!.id].filter(s => s.id !== id)}}))} />}
            {activeView === 'users-admin' && <UserManager users={state.users} stores={state.stores} accessMap={state.userStoreAccess} onToggleAccess={(u, s) => { const curr = state.userStoreAccess[u] || []; const next = curr.includes(s) ? curr.filter(id => id !== s) : [...curr, s]; setState(p => ({...p, userStoreAccess: {...p.userStoreAccess, [u]: next}})); }} />}
          </div>
          
          {activeView === 'purchases-form' && <TransactionForm groups={activeGroups} suppliers={activeSuppliers} onAdd={data => { setState(p => ({...p, transactions: {...p.transactions, [activeStore!.id]: [{id: Math.random().toString(36).substr(2, 9), storeId: activeStore!.id, ...data}, ...(p.transactions[activeStore!.id] || [])]}})); setActiveView('purchases'); }} onClose={() => setActiveView('purchases')} initialType={TransactionType.PURCHASE} />}
        </div>
      ) : (
        <div className="min-h-screen flex flex-col">
          <header className="bg-white border-b border-slate-100 p-6 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg">
                  <LayoutDashboard size={20} />
                </div>
                <h1 className="text-xl font-black text-slate-800 uppercase tracking-tighter">FinancePro</h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden md:flex flex-col items-end mr-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Usuário:</span>
                  <span className="text-sm font-black text-slate-700">{state.currentUser.name}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 text-rose-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-sm border border-rose-100"
                >
                  <LogOut size={16} /> Sair
                </button>
              </div>
            </div>
          </header>
          <main className="flex-1">
            <StoreSelector 
              stores={userStores} 
              onSelect={id => { setState(p => ({...p, activeStoreId: id})); setActiveView('dashboard'); }} 
              onCreate={n => { const id = `store-${Math.random().toString(36).substr(2, 9)}`; setState(p => ({...p, stores: [...p.stores, {id, name: n, ownerId: p.currentUser!.id, createdAt: new Date().toISOString()}]})); }} 
              onDelete={id => setState(p => ({...p, stores: p.stores.filter(s => s.id !== id)}))} 
              currentUser={state.currentUser} 
            />
          </main>
        </div>
      )}
    </div>
  );
};

const HeaderCard = ({ label, value, sub, color, icon: Icon }: any) => {
  const themes: any = {
    indigo: 'bg-indigo-50 border-indigo-100 text-indigo-600',
    orange: 'bg-orange-50 border-orange-100 text-orange-600',
    green: 'bg-emerald-50 border-emerald-100 text-emerald-600',
    purple: 'bg-purple-50 border-purple-100 text-purple-600',
  };
  return (
    <div className={`flex items-center gap-4 p-6 rounded-3xl border ${themes[color]} flex-1`}>
      <div className={`p-3 rounded-2xl bg-white shadow-sm`}>
        <Icon size={24} />
      </div>
      <div>
        <div className="flex items-center justify-between w-full">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{label}</p>
        </div>
        <h4 className="text-xl font-black">{typeof value === 'number' ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value) : value}</h4>
        <p className="text-[10px] font-bold opacity-70">{sub}</p>
      </div>
    </div>
  );
};

export default App;
