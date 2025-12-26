import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  Legend
} from 'recharts';
import { Transaction, TransactionType, DailyRevenue, StoreGoal } from '../types';
import { TrendingUp, ShoppingCart, Target, Percent } from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
  revenues: DailyRevenue[];
  goals: StoreGoal[];
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, revenues, goals }) => {
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  const monthRevenues = revenues.filter(r => r.date.startsWith(currentMonth));
  const monthPurchases = transactions.filter(t => t.date.startsWith(currentMonth) && t.type === TransactionType.PURCHASE);
  
  // Forçar conversão para número
  const totalRevenue = monthRevenues.reduce((sum, r) => sum + Number(r.total || 0), 0);
  const totalPurchases = monthPurchases.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  
  const cmc = totalRevenue > 0 ? (totalPurchases / totalRevenue) * 100 : 0;
  const currentGoal = Number(goals.find(g => g.month === currentMonth)?.target || 0);
  const goalProgress = currentGoal > 0 ? Math.min((totalRevenue / currentGoal) * 100, 100) : 0;

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const cleanDate = dateStr.split('T')[0];
    const [year, month, day] = cleanDate.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-black text-slate-800">Painel do Mês</h2>
        <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-black uppercase tracking-wider border border-indigo-100">
          {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Faturamento Total" 
          value={totalRevenue} 
          icon={TrendingUp} 
          color="emerald" 
        />
        <StatCard 
          label="Total Compras (CMC)" 
          value={totalPurchases} 
          icon={ShoppingCart} 
          color="amber" 
        />
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-3">
            <div className={`p-3 rounded-xl ${cmc > 35 ? 'bg-rose-50 text-rose-600' : cmc > 30 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
              <Percent size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">CMC Atual</p>
              <h4 className="text-xl font-black text-slate-900">{cmc.toFixed(1)}%</h4>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${cmc > 35 ? 'bg-rose-500' : cmc > 30 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min(cmc * 2, 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
              <Target size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Meta Vendas</p>
              <h4 className="text-xl font-black text-slate-900">{goalProgress.toFixed(0)}%</h4>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 transition-all duration-1000"
              style={{ width: `${goalProgress}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-bold">Faltam {formatCurrency(Math.max(currentGoal - totalRevenue, 0))}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
          <h3 className="text-lg font-black text-slate-800 mb-8 flex items-center gap-2">
            <TrendingUp size={20} className="text-indigo-600" />
            Vendas Diárias vs Compras
          </h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenues.slice(-15)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}}
                  tickFormatter={(str) => {
                    if (!str) return '';
                    const cleanDate = str.split('T')[0];
                    const parts = cleanDate.split('-');
                    if (parts.length === 3) {
                      return `${parts[2]}/${parts[1]}`;
                    }
                    return str;
                  }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  labelFormatter={(value) => formatDate(value)}
                  formatter={(value: any) => [new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value), '']}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="total" name="Faturamento" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color }: any) => {
  const colorMap: any = {
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  };
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${colorMap[color]}`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase">{label}</p>
          <h4 className="text-xl font-black text-slate-900">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value) || 0)}
          </h4>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;