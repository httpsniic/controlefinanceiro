import React, { useState, useEffect, useMemo } from 'react';
import { 
  AppState, Store, Transaction, ProductGroup, Supplier, User,
  DailyRevenue, TransactionType, StoreGoal, PortionedProduct, PortionedEntry
} from './types';
import { auth, stores as storesApi, transactions as transactionsApi, suppliers as suppliersApi, productGroups as productGroupsApi, dailyRevenues as dailyRevenuesApi, goals as goalsApi, userStoreAccess as userStoreAccessApi, portionedProducts as portionedProductsApi, portionedEntries as portionedEntriesApi } from './services/api';
import StoreSelector from './components/StoreSelector';
import TransactionForm from './components/TransactionForm';
import ProductGroupManager from './components/ProductGroupManager';
import SupplierManager from './components/SupplierManager';
import BillingManager from './components/BillingManager';
import PurchaseManager from './components/PurchaseManager';
import Dashboard from './components/Dashboard';
import GoalManager from './components/GoalManager';
import UserManager from './components/UserManager';
import PortionedManager from './components/PortionedManager';
import { 
  User as UserIcon, LogOut, ChevronLeft, ChevronRight, 
  LayoutDashboard, ShoppingCart, Target, Truck, 
  Package, TrendingUp, Percent, Calendar,
  Store as StoreIcon, Settings, Loader2
} from 'lucide-react';

const App: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [authForm, setAuthForm] = useState({ user: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [state, setState] = useState<AppState>({
    users: [],
    currentUser: null,
    stores: [],
    activeStoreId: null,
    productGroups: {},
    suppliers: {},
    transactions: {},
    dailyRevenues: {},
    goals: {},
    userStoreAccess: {},
    portionedProducts: {},
    portionedEntries: {}
  });
  
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7));
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Carregar dados quando selecionar uma loja
  useEffect(() => {
    if (state.activeStoreId && state.currentUser) {
      loadStoreData(state.activeStoreId);
    }
  }, [state.activeStoreId]);

  // Carregar lojas quando usuário logar
  useEffect(() => {
    if (state.currentUser) {
      loadStores();
    }
  }, [state.currentUser]);

  // Carregar usuários quando entrar na aba ACESSOS
  useEffect(() => {
    if (activeView === 'users-admin' && state.currentUser?.role === 'master') {
      loadUsers();
    }
  }, [activeView, state.currentUser]);

  const loadStores = async () => {
    try {
      setIsLoading(true);
      const storesList = await storesApi.list();
      
      // REMOVER DUPLICATAS (por ID)
      const uniqueStores = storesList.reduce((acc: Store[], store: Store) => {
        if (!acc.find(s => s.id === store.id)) {
          acc.push(store);
        }
        return acc;
      }, []);
      
      console.log('📊 Lojas originais:', storesList.length);
      console.log('📊 Lojas únicas:', uniqueStores.length);
      
      // Se for admin e não tiver lojas, criar as 7 lojas padrão
      if (state.currentUser?.role === 'master' && uniqueStores.length === 0) {
        const defaultStores = [
          'Paris6',
          'Xian',
          'Stella',
          'New Hakata',
          'Jardim Secreto',
          'Mestre Cuca',
          'Food Zone'
        ];
        
        console.log('Criando lojas padrão...');
        
        // Criar todas as lojas em paralelo
        const createdStores = await Promise.all(
          defaultStores.map(name => storesApi.create(name))
        );
        
        console.log('Lojas padrão criadas:', createdStores);
        setState(prev => ({ ...prev, stores: createdStores }));
      } else {
        setState(prev => ({ ...prev, stores: uniqueStores }));
      }

      // CARREGAR PERMISSÕES DO USUÁRIO LOGADO
      try {
        console.log('🔑 Carregando permissões...');
        const accessMap = await userStoreAccessApi.list();
        console.log('🔑 Permissões recebidas:', accessMap);
        console.log('🔑 Tipo do accessMap:', typeof accessMap);
        console.log('🔑 É objeto?', accessMap && typeof accessMap === 'object');
        
        // Validar que accessMap é um objeto válido
        if (accessMap && typeof accessMap === 'object') {
          setState(prev => ({ ...prev, userStoreAccess: accessMap }));
          console.log('✅ Permissões aplicadas ao state');
        } else {
          console.warn('⚠️ accessMap inválido, usando objeto vazio');
          setState(prev => ({ ...prev, userStoreAccess: {} }));
        }
      } catch (error) {
        console.error('❌ Erro ao carregar permissões:', error);
        setState(prev => ({ ...prev, userStoreAccess: {} }));
      }
    } catch (error: any) {
      console.error('Erro ao carregar lojas:', error);
      alert('Erro ao carregar lojas: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch('https://sistema-cmc-server.onrender.com/api/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar usuários');
      }

      const users = await response.json();
      setAllUsers(users);

      // Carregar permissões de acesso
      try {
        const accessMap = await userStoreAccessApi.list();
        setState(prev => ({ ...prev, userStoreAccess: accessMap }));
      } catch (error) {
        console.error('Erro ao carregar permissões:', error);
      }
    } catch (error: any) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const loadStoreData = async (storeId: string) => {
    try {
      setIsLoading(true);
      const [transactionsList, suppliersList, groupsList, revenuesList, goalsList, portionedProductsList, portionedEntriesList] = await Promise.all([
        transactionsApi.list(storeId),
        suppliersApi.list(storeId),
        productGroupsApi.list(storeId),
        dailyRevenuesApi.list(storeId),
        goalsApi.list(storeId),
        portionedProductsApi.list(storeId),
        portionedEntriesApi.list(storeId)
      ]);

      setState(prev => ({
        ...prev,
        transactions: { ...prev.transactions, [storeId]: transactionsList },
        suppliers: { ...prev.suppliers, [storeId]: suppliersList },
        productGroups: { ...prev.productGroups, [storeId]: groupsList },
        dailyRevenues: { ...prev.dailyRevenues, [storeId]: revenuesList },
        goals: { ...prev.goals, [storeId]: goalsList },
        portionedProducts: { ...prev.portionedProducts, [storeId]: portionedProductsList },
        portionedEntries: { ...prev.portionedEntries, [storeId]: portionedEntriesList }
      }));
    } catch (error: any) {
      console.error('Erro ao carregar dados da loja:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
  const activePortionedProducts = useMemo(() => state.activeStoreId ? (state.portionedProducts[state.activeStoreId] || []) : [], [state.portionedProducts, state.activeStoreId]);
  const activePortionedEntries = useMemo(() => state.activeStoreId ? (state.portionedEntries[state.activeStoreId] || []) : [], [state.portionedEntries, state.activeStoreId]);

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);
    
    try {
      const user = await auth.login(authForm.user, authForm.password);
      setState(prev => ({ ...prev, currentUser: user }));
    } catch (error: any) {
      setAuthError(error.message || 'Usuário ou senha incorretos.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    
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

    setIsLoading(true);
    
    try {
      const user = await auth.register(authForm.user, authForm.password, authForm.user);
      setState(prev => ({ ...prev, currentUser: user }));
      setIsRegistering(false);
      setAuthForm({ user: '', password: '' });
    } catch (error: any) {
      setAuthError(error.message || 'Erro ao criar usuário.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    auth.logout();
    setState(prev => ({ ...prev, currentUser: null, activeStoreId: null }));
  };

  const changeMonth = (dir: number) => {
    const d = new Date(currentMonth + '-02');
    d.setMonth(d.getMonth() + dir);
    setCurrentMonth(d.toISOString().slice(0, 7));
  };

  // Funções de gerenciamento de lojas
  const handleCreateStore = async (name: string) => {
    try {
      const newStore = await storesApi.create(name);
      setState(prev => ({ ...prev, stores: [...prev.stores, newStore] }));
    } catch (error: any) {
      console.error('Erro ao criar loja:', error);
      alert('Erro ao criar loja: ' + error.message);
    }
  };

  const handleDeleteStore = async (id: string) => {
    try {
      await storesApi.delete(id);
      setState(prev => ({ ...prev, stores: prev.stores.filter(s => s.id !== id) }));
    } catch (error: any) {
      console.error('Erro ao deletar loja:', error);
      alert('Erro ao deletar loja: ' + error.message);
    }
  };

  // Funções de gerenciamento de receitas diárias
  const handleAddRevenue = async (data: any) => {
    if (!activeStore) return;
    
    try {
      const newRevenue = await dailyRevenuesApi.createOrUpdate({
        storeId: activeStore.id,
        ...data
      });
      
      setState(prev => ({
        ...prev,
        dailyRevenues: {
          ...prev.dailyRevenues,
          [activeStore.id]: [newRevenue, ...(prev.dailyRevenues[activeStore.id] || []).filter(r => r.id !== newRevenue.id)]
        }
      }));
    } catch (error: any) {
      console.error('Erro ao adicionar receita:', error);
      alert('Erro ao adicionar receita: ' + error.message);
    }
  };

  const handleDeleteRevenue = async (id: string) => {
    if (!activeStore) return;
    
    try {
      await dailyRevenuesApi.delete(id);
      setState(prev => ({
        ...prev,
        dailyRevenues: {
          ...prev.dailyRevenues,
          [activeStore.id]: prev.dailyRevenues[activeStore.id].filter(r => r.id !== id)
        }
      }));
    } catch (error: any) {
      console.error('Erro ao deletar receita:', error);
      alert('Erro ao deletar receita: ' + error.message);
    }
  };

  // Funções de gerenciamento de transações/compras
  const handleAddTransaction = async (data: any) => {
    if (!activeStore) return;
    
    try {
      const newTransaction = await transactionsApi.create({
        storeId: activeStore.id,
        ...data
      });
      
      setState(prev => ({
        ...prev,
        transactions: {
          ...prev.transactions,
          [activeStore.id]: [newTransaction, ...(prev.transactions[activeStore.id] || [])]
        }
      }));
    } catch (error: any) {
      console.error('Erro ao adicionar transação:', error);
      alert('Erro ao adicionar transação: ' + error.message);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!activeStore) return;
    
    try {
      await transactionsApi.delete(id);
      setState(prev => ({
        ...prev,
        transactions: {
          ...prev.transactions,
          [activeStore.id]: prev.transactions[activeStore.id].filter(t => t.id !== id)
        }
      }));
    } catch (error: any) {
      console.error('Erro ao deletar transação:', error);
      alert('Erro ao deletar transação: ' + error.message);
    }
  };

  // Funções de gerenciamento de metas
  const handleAddGoal = async (month: string, revenueTarget: number, cmcTarget: number, avgTicket: number) => {
    if (!activeStore) return;
    
    try {
      const newGoal = await goalsApi.createOrUpdate({
        storeId: activeStore.id,
        month,
        revenueTarget,
        cmcTarget,
        avgTicket
      });
      
      setState(prev => ({
        ...prev,
        goals: {
          ...prev.goals,
          [activeStore.id]: [newGoal, ...(prev.goals[activeStore.id] || []).filter(g => g.month !== month)]
        }
      }));
    } catch (error: any) {
      console.error('Erro ao adicionar meta:', error);
      alert('Erro ao adicionar meta: ' + error.message);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!activeStore) return;
    
    try {
      await goalsApi.delete(id);
      setState(prev => ({
        ...prev,
        goals: {
          ...prev.goals,
          [activeStore.id]: prev.goals[activeStore.id].filter(g => g.id !== id)
        }
      }));
    } catch (error: any) {
      console.error('Erro ao deletar meta:', error);
      alert('Erro ao deletar meta: ' + error.message);
    }
  };

  // Funções de gerenciamento de porcionados
  const handleAddPortionedProduct = async (data: any) => {
    if (!activeStore) return;
    
    try {
      const newProduct = await portionedProductsApi.create({
        ...data,
        storeId: activeStore.id
      });
      setState(prev => ({
        ...prev,
        portionedProducts: {
          ...prev.portionedProducts,
          [activeStore.id]: [...(prev.portionedProducts[activeStore.id] || []), newProduct]
        }
      }));
    } catch (error: any) {
      console.error('Erro ao adicionar produto porcionado:', error);
      alert('Erro ao adicionar produto: ' + error.message);
    }
  };

  const handleDeletePortionedProduct = async (id: string) => {
    if (!activeStore) return;
    
    try {
      await portionedProductsApi.delete(id);
      setState(prev => ({
        ...prev,
        portionedProducts: {
          ...prev.portionedProducts,
          [activeStore.id]: prev.portionedProducts[activeStore.id].filter(p => p.id !== id)
        }
      }));
    } catch (error: any) {
      console.error('Erro ao deletar produto porcionado:', error);
      alert('Erro ao deletar produto: ' + error.message);
    }
  };

  const handleAddPortionedEntry = async (data: any) => {
    if (!activeStore) return;
    
    try {
      const newEntry = await portionedEntriesApi.create({
        ...data,
        storeId: activeStore.id
      });
      setState(prev => ({
        ...prev,
        portionedEntries: {
          ...prev.portionedEntries,
          [activeStore.id]: [...(prev.portionedEntries[activeStore.id] || []), newEntry]
        }
      }));
    } catch (error: any) {
      console.error('Erro ao adicionar lançamento:', error);
      alert('Erro ao adicionar lançamento: ' + error.message);
    }
  };

  const handleDeletePortionedEntry = async (id: string) => {
    if (!activeStore) return;
    
    try {
      await portionedEntriesApi.delete(id);
      setState(prev => ({
        ...prev,
        portionedEntries: {
          ...prev.portionedEntries,
          [activeStore.id]: prev.portionedEntries[activeStore.id].filter(e => e.id !== id)
        }
      }));
    } catch (error: any) {
      console.error('Erro ao deletar lançamento:', error);
      alert('Erro ao deletar lançamento: ' + error.message);
    }
  };

  // Funções de gerenciamento de grupos de produtos
  const handleAddProductGroup = async (name: string, color: string, cmcTarget: number, icon: string) => {
    if (!activeStore) return;
    
    try {
      const newGroup = await productGroupsApi.create({
        storeId: activeStore.id,
        name,
        color,
        cmcTarget,
        icon
      });
      
      setState(prev => ({
        ...prev,
        productGroups: {
          ...prev.productGroups,
          [activeStore.id]: [...(prev.productGroups[activeStore.id] || []), newGroup]
        }
      }));
    } catch (error: any) {
      console.error('Erro ao adicionar grupo:', error);
      alert('Erro ao adicionar grupo: ' + error.message);
    }
  };

  const handleDeleteProductGroup = async (id: string) => {
    if (!activeStore) return;
    
    try {
      await productGroupsApi.delete(id);
      setState(prev => ({
        ...prev,
        productGroups: {
          ...prev.productGroups,
          [activeStore.id]: prev.productGroups[activeStore.id].filter(g => g.id !== id)
        }
      }));
    } catch (error: any) {
      console.error('Erro ao deletar grupo:', error);
      alert('Erro ao deletar grupo: ' + error.message);
    }
  };

  // Funções de gerenciamento de fornecedores
  const handleAddSupplier = async (name: string, contact: string, email: string, categories: string) => {
    if (!activeStore) return;
    
    try {
      const newSupplier = await suppliersApi.create({
        storeId: activeStore.id,
        name,
        contact,
        email,
        categories
      });
      
      setState(prev => ({
        ...prev,
        suppliers: {
          ...prev.suppliers,
          [activeStore.id]: [...(prev.suppliers[activeStore.id] || []), newSupplier]
        }
      }));
    } catch (error: any) {
      console.error('Erro ao adicionar fornecedor:', error);
      alert('Erro ao adicionar fornecedor: ' + error.message);
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    if (!activeStore) return;
    
    try {
      await suppliersApi.delete(id);
      setState(prev => ({
        ...prev,
        suppliers: {
          ...prev.suppliers,
          [activeStore.id]: prev.suppliers[activeStore.id].filter(s => s.id !== id)
        }
      }));
    } catch (error: any) {
      console.error('Erro ao deletar fornecedor:', error);
      alert('Erro ao deletar fornecedor: ' + error.message);
    }
  };

  if (!state.currentUser) {
    return (
      <div className="min-h-screen bg-[#F4F7FE] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white p-10 rounded-[40px] shadow-xl border border-slate-100 animate-fadeIn">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-4 rounded-3xl inline-block mb-4 shadow-lg">
              <LayoutDashboard size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter mb-2">ONE MARKETING</h1>
            <p className="text-slate-500 font-bold text-sm">Sistema de Controle Financeiro Multi-Lojas</p>
          </div>

          {authError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl mb-6 text-sm font-bold">
              {authError}
            </div>
          )}

          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-600 uppercase tracking-widest mb-2">Usuário</label>
              <input
                type="text"
                value={authForm.user}
                onChange={e => setAuthForm(prev => ({ ...prev, user: e.target.value }))}
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-indigo-600 focus:outline-none font-bold text-slate-700 transition-all"
                placeholder="Digite seu usuário"
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-600 uppercase tracking-widest mb-2">Senha</label>
              <input
                type="password"
                value={authForm.password}
                onChange={e => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-indigo-600 focus:outline-none font-bold text-slate-700 transition-all"
                placeholder="Digite sua senha"
                disabled={isLoading}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 size={20} className="animate-spin" />}
              {isRegistering ? 'Criar Conta' : 'Entrar'}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setAuthError('');
                setAuthForm({ user: '', password: '' });
              }}
              className="w-full text-indigo-600 py-3 rounded-2xl font-bold text-sm hover:bg-indigo-50 transition-all"
              disabled={isLoading}
            >
              {isRegistering ? 'Já tenho conta' : 'Criar nova conta'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FE]">
      {activeStore ? (
        <div className="min-h-screen p-4 md:p-8 space-y-6">
          <div className="bg-white rounded-[40px] p-6 md:p-8 shadow-xl border border-slate-100">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-3 rounded-2xl text-white shadow-lg">
                  <LayoutDashboard size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">ONE MARKETING</h1>
                  <p className="text-sm font-bold text-slate-500">{activeStore.name}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
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

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={32} className="animate-spin text-indigo-600" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <HeaderCard label="FATURAMENTO" value={monthData.revenue} sub={`Média/dia: R$ ${(monthData.revenue / 30).toFixed(2)}`} color="indigo" icon={TrendingUp} />
                <HeaderCard label="COMPRAS" value={monthData.purchases} sub="Total acumulado" color="orange" icon={ShoppingCart} />
                <HeaderCard label="CMC ATUAL" value={`${monthData.cmc.toFixed(2)}%`} sub={`Meta: ${monthData.cmcGoal}% | Diff: ${(monthData.cmc - monthData.cmcGoal).toFixed(2)}%`} color="green" icon={Percent} />
                <HeaderCard label="PROJEÇÃO" value={monthData.revenue} sub="Faltam 31 dias" color="purple" icon={Calendar} />
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100 flex overflow-x-auto no-scrollbar">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'billing', label: 'Lançar Vendas', icon: TrendingUp },
              { id: 'purchases', label: 'Lançar Compras', icon: ShoppingCart },
              { id: 'goals', label: 'Metas', icon: Target },
              { id: 'suppliers', label: 'Fornecedores', icon: Truck },
              { id: 'groups', label: 'Grupos', icon: Package },
              { id: 'portioned', label: 'Porcionados', icon: Package },
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
            {activeView === 'billing' && <BillingManager revenues={activeRevenues} onAdd={handleAddRevenue} onDelete={handleDeleteRevenue} />}
            {activeView === 'purchases' && <PurchaseManager purchases={activeTransactions.filter(t => t.type === TransactionType.PURCHASE)} groups={activeGroups} suppliers={activeSuppliers} onAdd={handleAddTransaction} onDelete={handleDeleteTransaction} />}
            {activeView === 'goals' && <GoalManager goals={activeGoals} onAdd={handleAddGoal} onDelete={handleDeleteGoal} />}
            {activeView === 'groups' && <ProductGroupManager groups={activeGroups} onAdd={handleAddProductGroup} onDelete={handleDeleteProductGroup} />}
            {activeView === 'portioned' && <PortionedManager products={activePortionedProducts} entries={activePortionedEntries} suppliers={activeSuppliers} onAddProduct={handleAddPortionedProduct} onDeleteProduct={handleDeletePortionedProduct} onAddEntry={handleAddPortionedEntry} onDeleteEntry={handleDeletePortionedEntry} />}
            {activeView === 'suppliers' && <SupplierManager suppliers={activeSuppliers} onAdd={handleAddSupplier} onDelete={handleDeleteSupplier} />}
            {activeView === 'users-admin' && <UserManager users={allUsers} stores={state.stores} accessMap={state.userStoreAccess} onToggleAccess={async (u, s) => { try { await userStoreAccessApi.toggle(u, s); const curr = state.userStoreAccess[u] || []; const next = curr.includes(s) ? curr.filter(id => id !== s) : [...curr, s]; setState(p => ({...p, userStoreAccess: {...p.userStoreAccess, [u]: next}})); } catch (error) { console.error('Erro ao alterar acesso:', error); alert('Erro ao alterar permissão'); } }} />}
          </div>
          
          {activeView === 'purchases-form' && <TransactionForm groups={activeGroups} suppliers={activeSuppliers} onAdd={data => { handleAddTransaction(data); setActiveView('purchases'); }} onClose={() => setActiveView('purchases')} initialType={TransactionType.PURCHASE} />}
        </div>
      ) : (
        <div className="min-h-screen flex flex-col">
          <header className="bg-white border-b border-slate-100 p-6 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-xl text-white shadow-lg">
                  <LayoutDashboard size={20} />
                </div>
                <h1 className="text-xl font-black text-slate-800 uppercase tracking-tighter">ONE MARKETING</h1>
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
            {isLoading ? (
              <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                  <Loader2 size={48} className="animate-spin text-indigo-600 mx-auto mb-4" />
                  <p className="text-slate-600 font-bold">Carregando lojas...</p>
                </div>
              </div>
            ) : (
              <StoreSelector 
                stores={userStores} 
                onSelect={id => { setState(p => ({...p, activeStoreId: id})); setActiveView('dashboard'); }} 
                onCreate={handleCreateStore} 
                onDelete={handleDeleteStore} 
                currentUser={state.currentUser} 
              />
            )}
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