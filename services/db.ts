
import { AppState, User, Store } from '../types';

const STORAGE_KEY = 'finance_pro_v5_data';

const DEFAULT_MASTER: User = {
  id: 'master-id',
  username: 'thiago',
  password: '271205',
  name: 'thiago',
  role: 'master'
};

const DEFAULT_STORES: Store[] = [
  { id: 'store-paris6', name: 'Paris6', ownerId: 'master-id', createdAt: new Date().toISOString() },
  { id: 'store-xian', name: 'Xian', ownerId: 'master-id', createdAt: new Date().toISOString() },
  { id: 'store-stella', name: 'Stella', ownerId: 'master-id', createdAt: new Date().toISOString() },
  { id: 'store-newhakata', name: 'New Hakata', ownerId: 'master-id', createdAt: new Date().toISOString() },
  { id: 'store-jardimsecreto', name: 'Jardim Secreto', ownerId: 'master-id', createdAt: new Date().toISOString() },
  { id: 'store-mestrecuca', name: 'Mestre Cuca', ownerId: 'master-id', createdAt: new Date().toISOString() },
  { id: 'store-foodzone', name: 'Food Zone', ownerId: 'master-id', createdAt: new Date().toISOString() },
];

const INITIAL_STATE: AppState = {
  users: [DEFAULT_MASTER],
  currentUser: null,
  stores: DEFAULT_STORES,
  activeStoreId: null,
  productGroups: {},
  suppliers: {},
  transactions: {},
  dailyRevenues: {},
  goals: {},
  userStoreAccess: {}
};

export const db = {
  save: (state: AppState) => {
    // Only save essential persistent data
    const dataToSave = {
      ...state,
      currentUser: null // Safety: don't persist current session user in storage
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  },

  load: (): AppState => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return INITIAL_STATE;
    try {
      const parsed = JSON.parse(data);
      
      // Prevent duplicate masters and force update master credentials
      // Now the master username is 'thiago'
      const nonMasterUsers = (parsed.users || []).filter((u: User) => u.role !== 'master');
      const updatedUsers = [DEFAULT_MASTER, ...nonMasterUsers];

      // Se não houver lojas no storage, garante que as padrão existam
      const currentStores = parsed.stores && parsed.stores.length > 0 ? parsed.stores : DEFAULT_STORES;

      return { 
        ...INITIAL_STATE, 
        ...parsed, 
        users: updatedUsers,
        stores: currentStores,
        currentUser: null 
      }; 
    } catch (e) {
      return INITIAL_STATE;
    }
  },

  reset: () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  }
};
