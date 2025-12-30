
export enum TransactionType {
  EXPENSE = 'EXPENSE',
  INCOME = 'INCOME',
  PURCHASE = 'PURCHASE'
}

export type UserRole = 'master' | 'user';

export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface ProductGroup {
  id: string;
  name: string;
  color: string;
  cmcTarget: number;
  icon: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  categories: string;
}

export interface DailyRevenue {
  id: string;
  storeId: string;
  date: string;
  salon: number;
  delivery: number;
  serviceCharge: number;
  total: number;
}

export interface Transaction {
  id: string;
  storeId: string;
  type: TransactionType;
  description: string;
  amount: number;
  date: string;
  dueDate?: string; // Data de vencimento
  groupId: string;
  supplierId?: string;
  invoiceNumber?: string;
}

export interface StoreGoal {
  id: string;
  storeId: string;
  month: string; // YYYY-MM
  revenueTarget: number;
  cmcTarget: number;
  avgTicket: number;
}

export interface Store {
  id: string;
  ownerId: string;
  name: string;
  createdAt: string;
}

export interface AppState {
  users: User[];
  currentUser: User | null;
  stores: Store[];
  activeStoreId: string | null;
  productGroups: Record<string, ProductGroup[]>; 
  suppliers: Record<string, Supplier[]>;
  transactions: Record<string, Transaction[]>;
  dailyRevenues: Record<string, DailyRevenue[]>;
  goals: Record<string, StoreGoal[]>;
  userStoreAccess: Record<string, string[]>;
}

export interface PortionedProduct {
  id: string;
  storeId: string;
  rawProtein: string;
  portionedProduct: string;
  standardWeight: number;
  targetYield: number;
  tolerance: number;
  supplierId?: string;
  supplierName?: string;
  operatorName?: string;
  createdAt: string;
}

export interface PortionedEntry {
  id: string;
  storeId: string;
  portionedProductId: string;
  proteinName: string;
  supplierId?: string;
  supplierName?: string;
  price: number;
  entryDate: string;
  createdAt: string;
}