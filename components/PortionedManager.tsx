import React, { useState } from 'react';
import { PortionedProduct, PortionedEntry, Supplier } from '../types';
import { Plus, Trash2, Package } from 'lucide-react';
import { maskCurrency, parseCurrency, maskDate, dateToISO, isoToDisplayDate } from '../utils';

interface PortionedManagerProps {
  products: PortionedProduct[];
  entries: PortionedEntry[];
  suppliers: Supplier[];
  onAddProduct: (data: any) => void;
  onDeleteProduct: (id: string) => void;
  onAddEntry: (data: any) => void;
  onDeleteEntry: (id: string) => void;
}

const PortionedManager: React.FC<PortionedManagerProps> = ({
  products,
  entries,
  suppliers,
  onAddProduct,
  onDeleteProduct,
  onAddEntry,
  onDeleteEntry
}) => {
  const [productForm, setProductForm] = useState({
    rawProtein: '',
    portionedProduct: '',
    standardWeight: '',
    targetYield: '90',
    tolerance: '5',
    supplierId: '',
    operatorName: ''
  });

  const [entryForm, setEntryForm] = useState({
    portionedProductId: '',
    proteinName: '',
    supplierId: '',
    price: '',
    entryDate: isoToDisplayDate(new Date().toISOString().split('T')[0])
  });

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    onAddProduct({
      rawProtein: productForm.rawProtein,
      portionedProduct: productForm.portionedProduct,
      standardWeight: parseFloat(productForm.standardWeight),
      targetYield: parseFloat(productForm.targetYield),
      tolerance: parseFloat(productForm.tolerance),
      supplierId: productForm.supplierId || null,
      operatorName: productForm.operatorName
    });
    setProductForm({
      rawProtein: '',
      portionedProduct: '',
      standardWeight: '',
      targetYield: '90',
      tolerance: '5',
      supplierId: '',
      operatorName: ''
    });
  };

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedProduct = products.find(p => p.id === entryForm.portionedProductId);
    onAddEntry({
      portionedProductId: entryForm.portionedProductId,
      proteinName: selectedProduct?.rawProtein || entryForm.proteinName,
      supplierId: entryForm.supplierId || null,
      price: parseCurrency(entryForm.price),
      entryDate: dateToISO(entryForm.entryDate)
    });
    setEntryForm({
      ...entryForm,
      price: '',
      entryDate: isoToDisplayDate(new Date().toISOString().split('T')[0])
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <h2 className="text-xl font-black text-slate-800 px-2">Gestão de Porcionados</h2>

      {/* SEÇÃO 1: CADASTRO DE PRODUTOS PORCIONADOS */}
      <div className="bg-indigo-50/50 border border-indigo-100 p-8 rounded-[32px]">
        <h3 className="text-sm font-black text-indigo-900 mb-6 flex items-center gap-2">
          <Plus size={18} /> Cadastrar Produto Porcionado
        </h3>
        <form onSubmit={handleAddProduct} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Proteína Bruta</label>
              <input
                type="text"
                required
                placeholder="Ex: Filé Mignon"
                className="w-full p-4 rounded-2xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                value={productForm.rawProtein}
                onChange={e => setProductForm({ ...productForm, rawProtein: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Produto Porcionado</label>
              <input
                type="text"
                required
                placeholder="Ex: Filé Bife"
                className="w-full p-4 rounded-2xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                value={productForm.portionedProduct}
                onChange={e => setProductForm({ ...productForm, portionedProduct: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Peso Padrão (g)</label>
              <input
                type="number"
                step="0.001"
                required
                placeholder="165"
                className="w-full p-4 rounded-2xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-right"
                value={productForm.standardWeight}
                onChange={e => setProductForm({ ...productForm, standardWeight: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Meta Rendimento (%)</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="90"
                className="w-full p-4 rounded-2xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-center"
                value={productForm.targetYield}
                onChange={e => setProductForm({ ...productForm, targetYield: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">% Tolerância Porcionados</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="5"
                className="w-full p-4 rounded-2xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-center"
                value={productForm.tolerance}
                onChange={e => setProductForm({ ...productForm, tolerance: e.target.value })}
              />
              <p className="text-[9px] text-slate-400 mt-1 font-medium">Variação permitida na gramatura da porção</p>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Fornecedor</label>
              <select
                className="w-full p-4 rounded-2xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                value={productForm.supplierId}
                onChange={e => setProductForm({ ...productForm, supplierId: e.target.value })}
              >
                <option value="">Selecione...</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Operador</label>
              <input
                type="text"
                placeholder="Nome do operador"
                className="w-full p-4 rounded-2xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                value={productForm.operatorName}
                onChange={e => setProductForm({ ...productForm, operatorName: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full md:w-auto bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <Plus size={18} /> Adicionar Produto
          </button>
        </form>
      </div>

      {/* TABELA DE PRODUTOS CADASTRADOS */}
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <Package size={20} className="text-indigo-600" />
            Produtos Porcionados Cadastrados
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Proteína Bruta</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Produto Porcionado</th>
                <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-wider">Peso Padrão</th>
                <th className="px-6 py-4 text-center text-xs font-black text-slate-400 uppercase tracking-wider">Meta Rend.</th>
                <th className="px-6 py-4 text-center text-xs font-black text-slate-400 uppercase tracking-wider">Tolerância</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Fornecedor</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Operador</th>
                <th className="px-6 py-4 text-center text-xs font-black text-slate-400 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-slate-700">{product.rawProtein}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-600">{product.portionedProduct}</td>
                  <td className="px-6 py-4 text-sm font-bold text-right text-slate-700">{product.standardWeight}g</td>
                  <td className="px-6 py-4 text-sm font-bold text-center text-emerald-600">{product.targetYield}%</td>
                  <td className="px-6 py-4 text-sm font-bold text-center text-amber-600">±{product.tolerance}%</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{product.supplierName || '-'}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{product.operatorName || '-'}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => {
                        if (confirm(`Deletar produto "${product.portionedProduct}"?`)) {
                          onDeleteProduct(product.id);
                        }
                      }}
                      className="text-slate-300 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400 font-medium">
                    Nenhum produto porcionado cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SEÇÃO 2: MATRIZ DE LANÇAMENTOS */}
      <div className="bg-emerald-50/50 border border-emerald-100 p-8 rounded-[32px]">
        <h3 className="text-sm font-black text-emerald-900 mb-6 flex items-center gap-2">
          <Plus size={18} /> Lançar Preço
        </h3>
        <form onSubmit={handleAddEntry} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Proteína</label>
              <select
                required
                className="w-full p-4 rounded-2xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                value={entryForm.portionedProductId}
                onChange={e => setEntryForm({ ...entryForm, portionedProductId: e.target.value })}
              >
                <option value="">Selecione...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.rawProtein}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Fornecedor</label>
              <select
                className="w-full p-4 rounded-2xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                value={entryForm.supplierId}
                onChange={e => setEntryForm({ ...entryForm, supplierId: e.target.value })}
              >
                <option value="">Selecione...</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Preço (R$)</label>
              <input
                type="text"
                required
                placeholder="0,00"
                className="w-full p-4 rounded-2xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-right"
                value={entryForm.price}
                onChange={e => setEntryForm({ ...entryForm, price: maskCurrency(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Data</label>
              <input
                type="text"
                required
                placeholder="DD/MM/AAAA"
                className="w-full p-4 rounded-2xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                value={entryForm.entryDate}
                onChange={e => setEntryForm({ ...entryForm, entryDate: maskDate(e.target.value) })}
                maxLength={10}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full md:w-auto bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <Plus size={18} /> Lançar Preço
          </button>
        </form>
      </div>

      {/* TABELA DE LANÇAMENTOS */}
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-black text-slate-800">Histórico de Lançamentos de Preços</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Data</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Proteína</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Fornecedor</th>
                <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-wider">Preço</th>
                <th className="px-6 py-4 text-center text-xs font-black text-slate-400 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entries.sort((a, b) => b.entryDate.localeCompare(a.entryDate)).map(entry => (
                <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-slate-700">
                    {new Date(entry.entryDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-600">{entry.proteinName}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{entry.supplierName || '-'}</td>
                  <td className="px-6 py-4 text-sm font-black text-right text-emerald-600">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(entry.price)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => {
                        if (confirm('Deletar este lançamento?')) {
                          onDeleteEntry(entry.id);
                        }
                      }}
                      className="text-slate-300 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">
                    Nenhum lançamento registrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PortionedManager;