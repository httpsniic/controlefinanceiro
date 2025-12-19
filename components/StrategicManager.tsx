
import React from 'react';
import { Transaction, DailyRevenue, TransactionType } from '../types';
// Added ShoppingBag to the lucide-react imports
import { BarChart3, TrendingUp, AlertCircle, CheckCircle2, AlertTriangle, ArrowUpRight, TrendingDown, ShoppingBag } from 'lucide-react';

interface StrategicManagerProps {
  revenues: DailyRevenue[];
  transactions: Transaction[];
}

const StrategicManager: React.FC<StrategicManagerProps> = ({ revenues, transactions }) => {
  // Processamento de dados por mês com normalização de data
  const dataByMonth = React.useMemo(() => {
    const monthly: Record<string, { rev: number, buy: number }> = {};
    
    // Processar Vendas
    revenues.forEach(r => {
      // Garantir que pegamos apenas YYYY-MM independente do formato
      const datePart = r.date.includes('T') ? r.date.split('T')[0] : r.date;
      const month = datePart.slice(0, 7); 
      if (!monthly[month]) monthly[month] = { rev: 0, buy: 0 };
      monthly[month].rev += r.total;
    });

    // Processar Compras
    transactions
      .filter(t => t.type === TransactionType.PURCHASE)
      .forEach(t => {
        const datePart = t.date.includes('T') ? t.date.split('T')[0] : t.date;
        const month = datePart.slice(0, 7);
        if (!monthly[month]) monthly[month] = { rev: 0, buy: 0 };
        monthly[month].buy += t.amount;
      });

    return Object.entries(monthly)
      .map(([month, data]) => ({
        month,
        revenue: data.rev,
        purchases: data.buy,
        cmc: data.rev > 0 ? (data.buy / data.rev) * 100 : 0,
        margin: data.rev - data.buy
      }))
      .sort((a, b) => b.month.localeCompare(a.month));
  }, [revenues, transactions]);

  // Sistema de Alertas Dinâmicos
  const alerts = React.useMemo(() => {
    const activeAlerts: { type: 'danger' | 'warning' | 'success', title: string, text: string, icon: any }[] = [];
    if (dataByMonth.length === 0) return [];

    const current = dataByMonth[0];
    const previous = dataByMonth[1];

    // Alerta de CMC Alto
    if (current.cmc > 35) {
      activeAlerts.push({
        type: 'danger',
        title: 'CMC CRÍTICO',
        text: `O CMC de ${current.cmc.toFixed(1)}% está muito acima do ideal (30%). Verifique desperdícios ou preços.`,
        icon: AlertCircle
      });
    } else if (current.cmc > 32) {
      activeAlerts.push({
        type: 'warning',
        title: 'CMC EM ATENÇÃO',
        text: `O CMC subiu para ${current.cmc.toFixed(1)}%. Monitore as compras desta semana.`,
        icon: AlertTriangle
      });
    } else if (current.cmc > 0) {
      activeAlerts.push({
        type: 'success',
        title: 'CMC SOB CONTROLE',
        text: `Parabéns! Seu CMC de ${current.cmc.toFixed(1)}% está dentro da meta saudável.`,
        icon: CheckCircle2
      });
    }

    // Alerta de Tendência de Faturamento
    if (previous && current.revenue < previous.revenue * 0.9) {
      activeAlerts.push({
        type: 'danger',
        title: 'QUEDA DE FATURAMENTO',
        text: `O faturamento está 10% ou mais abaixo do mês anterior. Revise sua estratégia de vendas.`,
        icon: TrendingDown
      });
    }

    // Alerta de Compras sem Vendas
    if (current.purchases > 0 && current.revenue === 0) {
      activeAlerts.push({
        type: 'warning',
        title: 'COMPRAS SEM VENDAS',
        text: `Existem compras lançadas mas nenhum faturamento registrado para este mês ainda.`,
        icon: ShoppingBag
      });
    }

    return activeAlerts;
  }, [dataByMonth]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200">
            <BarChart3 size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Análise Estratégica</h2>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest text-[10px]">Performance & Saúde Financeira</p>
          </div>
        </div>
      </div>

      {/* Painel de Alertas */}
      {alerts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {alerts.map((alert, i) => (
            <div key={i} className={`p-6 rounded-[32px] border flex gap-4 items-start shadow-sm transition-all hover:shadow-md animate-scaleIn ${
              alert.type === 'danger' ? 'bg-rose-50 border-rose-100 text-rose-700' :
              alert.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-700' :
              'bg-emerald-50 border-emerald-100 text-emerald-700'
            }`}>
              <div className={`p-2 rounded-xl bg-white/80`}>
                <alert.icon size={20} />
              </div>
              <div>
                <h4 className="font-black text-xs uppercase tracking-widest mb-1">{alert.title}</h4>
                <p className="text-xs font-bold leading-relaxed opacity-80">{alert.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabela de Dados Agrupados */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
           <h3 className="font-black text-slate-700 text-sm uppercase tracking-widest">Histórico de Performance Mensal</h3>
           <div className="flex items-center gap-2 text-[10px] font-black text-slate-400">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div> LUCRO BRUTO
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                <th className="px-8 py-6">Mês / Período</th>
                <th className="px-8 py-6 text-right">Faturamento</th>
                <th className="px-8 py-6 text-right">Compras (CMC)</th>
                <th className="px-8 py-6 text-center">% CMC</th>
                <th className="px-8 py-6 text-right">Margem Bruta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {dataByMonth.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <BarChart3 size={64} />
                      <p className="font-black text-xl uppercase tracking-tighter">Nenhum dado para analisar</p>
                    </div>
                    <p className="text-slate-400 font-bold text-sm mt-2">Lance vendas e compras para gerar o histórico.</p>
                  </td>
                </tr>
              ) : (
                dataByMonth.map(row => (
                  <tr key={row.month} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-8 rounded-full bg-indigo-100 group-hover:bg-indigo-500 transition-colors"></div>
                        <span className="font-black text-slate-700 capitalize text-sm">
                          {new Date(row.month + '-02').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right text-emerald-600 font-black text-sm">{formatCurrency(row.revenue)}</td>
                    <td className="px-8 py-6 text-right text-rose-500 font-bold text-sm">{formatCurrency(row.purchases)}</td>
                    <td className="px-8 py-6 text-center">
                      <span className={`px-4 py-1.5 rounded-2xl text-[10px] font-black border ${
                        row.cmc > 35 ? 'bg-rose-50 border-rose-100 text-rose-700' : 
                        row.cmc > 30 ? 'bg-amber-50 border-amber-100 text-amber-700' : 
                        'bg-emerald-50 border-emerald-100 text-emerald-700'
                      }`}>
                        {row.cmc.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right font-black text-slate-900 bg-slate-50/20 group-hover:bg-indigo-50 transition-colors">
                      <div className="flex items-center justify-end gap-2 text-sm">
                        {formatCurrency(row.margin)}
                        <ArrowUpRight size={14} className="text-indigo-400" />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dicas de Saúde Financeira */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 bg-white border border-slate-100 rounded-[32px] shadow-sm">
          <h4 className="font-black text-slate-800 text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-500" /> Como otimizar o CMC?
          </h4>
          <ul className="space-y-3">
            <li className="flex gap-3 text-xs font-bold text-slate-500">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1"></div>
              Reduza o desperdício na produção diária.
            </li>
            <li className="flex gap-3 text-xs font-bold text-slate-500">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1"></div>
              Negocie prazos e descontos com seus fornecedores principais.
            </li>
            <li className="flex gap-3 text-xs font-bold text-slate-500">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1"></div>
              Mantenha o inventário de estoque sempre atualizado.
            </li>
          </ul>
        </div>
        <div className="p-8 bg-white border border-slate-100 rounded-[32px] shadow-sm">
          <h4 className="font-black text-slate-800 text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
            <AlertCircle size={18} className="text-indigo-500" /> Sobre a Margem Bruta
          </h4>
          <p className="text-xs font-bold text-slate-500 leading-relaxed">
            A Margem Bruta exibida acima é o que sobra após pagar os insumos (compras). 
            Lembre-se que deste valor ainda devem sair os custos fixos (aluguel, funcionários, energia e impostos).
            Uma margem saudável geralmente fica acima de 65%.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StrategicManager;
