
import React, { useState } from 'react';
import { TransactionType, ProductGroup, Supplier } from '../types';
import { PlusCircle, X, FileText, Calendar as CalendarIcon, CalendarDays } from 'lucide-react';
import { maskCurrency, parseCurrency, maskDate, dateToISO, isoToDisplayDate } from '../utils';

interface TransactionFormProps {
  groups: ProductGroup[];
  suppliers: Supplier[];
  onAdd: (data: any) => void;
  onClose: () => void;
  initialType?: TransactionType;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ groups, suppliers, onAdd, onClose, initialType }) => {
  const [formData, setFormData] = useState({
    type: initialType || TransactionType.EXPENSE,
    description: '',
    amount: '',
    date: isoToDisplayDate(new Date().toISOString().split('T')[0]),
    dueDate: '', // Novo campo
    groupId: groups[0]?.id || '',
    supplierId: '',
    invoiceNumber: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount || !formData.groupId) return;

    onAdd({
      ...formData,
      amount: parseCurrency(formData.amount),
      date: dateToISO(formData.date),
      dueDate: formData.dueDate ? dateToISO(formData.dueDate) : undefined
    });
    onClose();
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, amount: maskCurrency(e.target.value) }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, date: maskDate(e.target.value) }));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-scaleIn">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800">
            {formData.type === TransactionType.PURCHASE ? 'Lançar Compra' : 'Novo Lançamento'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          {!initialType && (
            <div className="flex p-1 bg-slate-100 rounded-2xl">
              {Object.values(TransactionType).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type }))}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                    formData.type === type 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {type === TransactionType.INCOME ? 'Entrada' : type === TransactionType.EXPENSE ? 'Gasto' : 'Compra'}
                </button>
              ))}
            </div>
          )}

          {formData.type === TransactionType.PURCHASE && (
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
              <label className="block text-xs font-bold text-amber-700 uppercase mb-1.5 flex items-center gap-1">
                <FileText size={14} /> Número da NF
              </label>
              <input
                type="text"
                required={formData.type === TransactionType.PURCHASE}
                placeholder="Ex: 000.123.456"
                className="w-full p-3 rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData(p => ({ ...p, invoiceNumber: e.target.value }))}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Descrição</label>
            <input
              type="text"
              required
              placeholder="Ex: Aluguel, Compra de Carne..."
              className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.description}
              onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Valor (R$)</label>
              <input
                type="text"
                required
                placeholder="0,00"
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right font-bold text-indigo-600"
                value={formData.amount}
                onChange={handleAmountChange}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <CalendarIcon size={14} /> Data Emissão
              </label>
              <input
                type="text"
                required
                placeholder="DD/MM/AAAA"
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.date}
                onChange={handleDateChange}
                maxLength={10}
              />
            </div>
          </div>

          {formData.type === TransactionType.PURCHASE && (
            <div>
              <label className="block text-sm font-bold text-rose-600 mb-1.5 flex items-center gap-1">
                <CalendarDays size={14} /> Data de Vencimento
              </label>
              <input
                type="text"
                placeholder="DD/MM/AAAA"
                className="w-full p-3 rounded-xl border border-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-rose-50/30 text-rose-700 font-bold"
                value={formData.dueDate}
                onChange={(e) => setFormData(p => ({ ...p, dueDate: maskDate(e.target.value) }))}
                maxLength={10}
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Grupo</label>
              <select
                required
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                value={formData.groupId}
                onChange={(e) => setFormData(p => ({ ...p, groupId: e.target.value }))}
              >
                <option value="">Selecione...</option>
                {groups.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
            {(formData.type === TransactionType.PURCHASE) && (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Fornecedor</label>
                <select
                  required={formData.type === TransactionType.PURCHASE}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  value={formData.supplierId}
                  onChange={(e) => setFormData(p => ({ ...p, supplierId: e.target.value }))}
                >
                  <option value="">Selecione...</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 mt-4"
          >
            <PlusCircle size={20} />
            {formData.type === TransactionType.PURCHASE ? 'Confirmar Compra' : 'Salvar Lançamento'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
