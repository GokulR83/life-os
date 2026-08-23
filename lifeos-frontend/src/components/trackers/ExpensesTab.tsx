import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { CustomSelect } from '../common/CustomSelect';
import { CustomDatePicker } from '../common/CustomDatePicker';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { DollarSign, Plus, CreditCard, Tag, Trash2, IndianRupee, Globe, Calendar, TrendingUp, TrendingDown, Wallet, FolderPlus, Filter, Check } from 'lucide-react';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';

export const ExpensesTab = () => {
  const {
    expenses,
    addExpense,
    deleteExpenseApi,
    fetchExpensesApi,
    currency = 'INR',
    setCurrency,
    categories = [],
    addCategory,
    monthlyBudgetInr = 40000,
    monthlyBudgetUsd = 500,
    setMonthlyBudgetInr,
    setMonthlyBudgetUsd
  } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddingNewCat, setIsAddingNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInputValue, setBudgetInputValue] = useState('');

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; description: string } | null>(null);

  // Month selector state defaulting to current year-month (e.g. 2026-08)
  const currentYearMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentYearMonth);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Personal Expenses');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (fetchExpensesApi) fetchExpensesApi(true);
  }, []);

  const activeCurrency = currency || 'INR';
  const currencySymbol = activeCurrency === 'INR' ? '₹' : '$';
  const currencyLocale = activeCurrency === 'INR' ? 'en-IN' : 'en-US';

  const formatAmount = (val: number) => {
    const isNeg = val < 0;
    const absVal = Math.abs(val || 0);
    const formattedNum = absVal.toLocaleString(currencyLocale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return `${isNeg ? '-' : ''}${currencySymbol}${formattedNum}`;
  };

  const expensesList = expenses || [];

  // Filter expenses by selected month
  const monthFilteredExpenses = selectedMonth === 'ALL'
    ? expensesList
    : expensesList.filter((e) => (e.date || '').startsWith(selectedMonth));

  // Filter expenses by selected category
  const filteredExpenses = selectedCategoryFilter === 'ALL'
    ? monthFilteredExpenses
    : monthFilteredExpenses.filter((e) => (e.category || 'General') === selectedCategoryFilter);

  const totalMonthlySpend = monthFilteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  // Budget and Remaining Balance calculation
  const monthlyCap = activeCurrency === 'INR' ? (monthlyBudgetInr || 40000) : (monthlyBudgetUsd || 500);
  const remainingBalance = monthlyCap - totalMonthlySpend;
  const isOverBudget = remainingBalance < 0;
  const capPercent = Math.min(100, Math.round((totalMonthlySpend / monthlyCap) * 100));

  // Compute Month-over-Month (MoM) comparison
  const getPrevMonthStr = (ymStr: string) => {
    if (ymStr === 'ALL') return null;
    const [y, m] = ymStr.split('-').map(Number);
    const d = new Date(y, m - 2, 1);
    return d.toISOString().slice(0, 7);
  };

  const prevMonthStr = getPrevMonthStr(selectedMonth);
  const prevMonthExpenses = prevMonthStr
    ? expensesList.filter((e) => (e.date || '').startsWith(prevMonthStr))
    : [];
  const prevMonthSpend = prevMonthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  let momChangePercent: number | null = null;
  if (prevMonthStr && prevMonthSpend > 0) {
    momChangePercent = Math.round(((totalMonthlySpend - prevMonthSpend) / prevMonthSpend) * 100);
  }

  // Generate last 6 months options and historical bar chart data
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const ym = d.toISOString().slice(0, 7);
    const monthName = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const monthExpenses = expensesList.filter((e) => (e.date || '').startsWith(ym));
    const total = monthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    return {
      ym,
      label: monthName,
      shortName: d.toLocaleDateString('en-US', { month: 'short' }),
      amount: parseFloat(total.toFixed(2))
    };
  });

  const monthOptions = [
    { value: 'ALL', label: '📅 All Time Logged' },
    ...last6Months.slice().reverse().map((m) => ({
      value: m.ym,
      label: `🗓️ ${m.label}`
    }))
  ];

  // Dynamically build category options list
  const activeCategoriesList = Array.from(new Set([
    'Personal Expenses',
    'Software & Subscriptions',
    'Food & Dining',
    'Bills & Utilities',
    'Learning & Books',
    'Hosting & Infrastructure',
    'Coffee & Productivity',
    'Travel & Transport',
    'Shopping & General',
    ...(categories || [])
  ]));

  const categoryFilterOptions = [
    { value: 'ALL', label: '🏷️ All Categories' },
    ...activeCategoriesList.map((cat) => ({ value: cat, label: `🏷️ ${cat}` }))
  ];

  const categoryMap = monthFilteredExpenses.reduce((acc, curr) => {
    const cat = curr.category || 'General';
    acc[cat] = (acc[cat] || 0) + (curr.amount || 0);
    return acc;
  }, {} as Record<string, number>);

  const pieColors = ['var(--accent)', '#3b82f6', '#10b981', '#a855f7', '#ec4899', '#f59e0b', '#06b6d4', '#6366f1'];
  const pieData = Object.keys(categoryMap).map((cat, i) => ({
    name: cat,
    value: parseFloat((categoryMap[cat] || 0).toFixed(2)),
    color: pieColors[i % pieColors.length]
  }));

  const handleCreateCustomCategory = () => {
    if (!newCatName.trim()) return;
    const trimmed = newCatName.trim();
    if (addCategory) addCategory(trimmed);
    setCategory(trimmed);
    setNewCatName('');
    setIsAddingNewCat(false);
  };

  const handleSaveBudgetLimit = () => {
    const val = parseFloat(budgetInputValue);
    if (!isNaN(val) && val >= 0) {
      if (activeCurrency === 'INR' && setMonthlyBudgetInr) {
        setMonthlyBudgetInr(val);
      } else if (activeCurrency === 'USD' && setMonthlyBudgetUsd) {
        setMonthlyBudgetUsd(val);
      }
    }
    setIsEditingBudget(false);
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount) return;
    if (addExpense) {
      await addExpense({
        description: description.trim(),
        title: description.trim(),
        amount: parseFloat(amount) || 0,
        category,
        date: expenseDate || new Date().toISOString().split('T')[0],
        paymentMethod: 'Credit Card'
      });
    }
    setDescription('');
    setAmount('');
    setExpenseDate(new Date().toISOString().split('T')[0]);
    setIsModalOpen(false);
  };

  const handleConfirmDeleteExpense = async () => {
    if (deleteTarget && deleteExpenseApi) {
      await deleteExpenseApi(deleteTarget.id);
    }
    setDeleteTarget(null);
  };

  const selectedMonthLabel = selectedMonth === 'ALL'
    ? 'All Time'
    : new Date(`${selectedMonth}-01`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Top Controls: Currency & Month Selector Bar */}
      <div className="flex items-center justify-between p-3 px-4 rounded-2xl border border-theme-border bg-theme-surface/60 backdrop-blur-sm flex-wrap gap-3">
        <div className="flex items-center space-x-3 flex-wrap gap-y-2">
          {/* Month Selector Dropdown */}
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-theme-accent shrink-0" />
            <span className="text-xs font-bold text-theme-main">Filter Month:</span>
            <CustomSelect
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              options={monthOptions}
              variant="default"
              size="sm"
            />
          </div>

          <span className="text-xs text-theme-muted font-semibold hidden md:inline">|</span>

          <span className="text-xs font-semibold text-theme-muted">
            Displaying expenses for <span className="font-bold text-theme-main">{selectedMonthLabel}</span> in {activeCurrency === 'INR' ? 'Indian Rupee (₹)' : 'US Dollar ($)'}
          </span>
        </div>

        {/* Live Currency Toggle Switch */}
        <div className="flex items-center p-1 rounded-xl bg-theme-card border border-theme-border text-xs font-bold shadow-inner">
          <button
            onClick={() => setCurrency && setCurrency('INR')}
            className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition cursor-pointer ${
              activeCurrency === 'INR'
                ? 'bg-theme-accent text-white shadow-sm font-extrabold'
                : 'text-theme-muted hover:text-theme-main'
            }`}
          >
            <span>₹ INR</span>
          </button>

          <button
            onClick={() => setCurrency && setCurrency('USD')}
            className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition cursor-pointer ${
              activeCurrency === 'USD'
                ? 'bg-theme-accent text-white shadow-sm font-extrabold'
                : 'text-theme-muted hover:text-theme-main'
            }`}
          >
            <span>$ USD</span>
          </button>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Monthly Spend Card */}
        <div className="p-4 rounded-2xl border border-theme-border bg-theme-card shadow-sm flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-theme-muted">
                {selectedMonth === 'ALL' ? 'Total Expenses (All Time)' : `${selectedMonthLabel} Spend`}
              </span>
              {activeCurrency === 'INR' ? (
                <IndianRupee className="h-4 w-4 text-emerald-500" />
              ) : (
                <DollarSign className="h-4 w-4 text-emerald-500" />
              )}
            </div>

            <p className="text-2xl font-extrabold text-theme-main tracking-tight">
              {formatAmount(totalMonthlySpend)}
            </p>

            <div className="flex items-center justify-between mt-1">
              <p className="text-[11px] text-theme-muted">{monthFilteredExpenses.length} transactions</p>
              {momChangePercent !== null && (
                <span className={`inline-flex items-center gap-0.5 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md border ${
                  momChangePercent > 0
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}>
                  {momChangePercent > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {momChangePercent > 0 ? `+${momChangePercent}%` : `${momChangePercent}%`} vs prev
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full py-2 rounded-xl bg-theme-accent hover:bg-theme-accent-hover text-white font-bold text-xs shadow transition flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add New Expense</span>
          </button>
        </div>

        {/* Card 2: Remaining Balance to Spend Card */}
        <div className="p-4 rounded-2xl border border-theme-border bg-theme-card shadow-sm flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-theme-muted">
                Remaining Balance to Spend
              </span>
              <Wallet className={`h-4 w-4 ${isOverBudget ? 'text-rose-500' : 'text-emerald-400'}`} />
            </div>

            <p className={`text-2xl font-extrabold tracking-tight ${isOverBudget ? 'text-rose-400' : 'text-emerald-400'}`}>
              {formatAmount(remainingBalance)}
            </p>

            <div className="mt-2 p-2.5 rounded-xl bg-theme-surface border border-theme-border text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-theme-muted">Monthly Limit:</span>
                {isEditingBudget ? (
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      value={budgetInputValue}
                      onChange={(e) => setBudgetInputValue(e.target.value)}
                      className="w-16 px-1.5 py-0.5 rounded text-[11px] font-bold border border-theme-border bg-theme-card text-theme-main outline-none"
                    />
                    <button
                      onClick={handleSaveBudgetLimit}
                      className="p-1 rounded bg-emerald-500 text-white text-[10px] font-bold"
                    >
                      <Check className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setBudgetInputValue(String(monthlyCap));
                      setIsEditingBudget(true);
                    }}
                    className="text-[10px] font-extrabold text-theme-accent hover:underline cursor-pointer"
                    title="Click to edit monthly budget limit"
                  >
                    {formatAmount(monthlyCap)} (Edit)
                  </button>
                )}
              </div>

              <div className="w-full bg-theme-card rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${isOverBudget ? 'bg-rose-500' : 'bg-emerald-500'}`}
                  style={{ width: `${capPercent}%` }}
                />
              </div>
            </div>
          </div>

          <p className="text-[10px] font-bold text-theme-muted flex items-center justify-between">
            <span>Budget Utilized: {capPercent}%</span>
            <span className={isOverBudget ? 'text-rose-400 font-extrabold' : 'text-emerald-400 font-extrabold'}>
              {isOverBudget ? 'Over Budget' : 'Safe Balance'}
            </span>
          </p>
        </div>

        {/* Card 3: 6-Month Spending Trend Bar Chart */}
        <div className="p-4 rounded-2xl border border-theme-border bg-theme-card shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-theme-main">6-Month Trend</h3>
            <span className="text-[10px] text-theme-muted font-bold">{activeCurrency}</span>
          </div>

          <div className="h-28 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last6Months} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="shortName" stroke="var(--text-muted)" fontSize={9} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={9} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    fontSize: '10px'
                  }}
                  formatter={(val) => formatAmount(val as number)}
                />
                <Bar dataKey="amount" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 4: Category Breakdown Pie Chart */}
        <div className="p-4 rounded-2xl border border-theme-border bg-theme-card shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-theme-main">Category Split</h3>
            <span className="text-[10px] text-theme-muted font-bold">{selectedMonthLabel}</span>
          </div>

          <div className="h-28 w-full flex items-center justify-center">
            {pieData.length === 0 ? (
              <div className="text-center text-[10px] text-theme-muted">
                <CreditCard className="h-5 w-5 mx-auto opacity-50 mb-1" />
                <span>No data</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={45}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-card)',
                      borderColor: 'var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      fontSize: '10px'
                    }}
                    formatter={(val) => formatAmount(val as number)}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Expenses Table with Category Filter & Manage Categories Header */}
      <div className="p-5 rounded-2xl border border-theme-border bg-theme-card shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-theme-accent" />
            <h3 className="text-base font-bold text-theme-main">Expense Log ({selectedMonthLabel})</h3>
          </div>

          <div className="flex items-center space-x-3 flex-wrap gap-y-2">
            {/* Category Filter Dropdown */}
            <div className="flex items-center space-x-1.5">
              <Filter className="h-3.5 w-3.5 text-theme-muted" />
              <CustomSelect
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                options={categoryFilterOptions}
                variant="default"
                size="xs"
              />
            </div>

            <span className="text-xs text-theme-muted font-bold">{filteredExpenses.length} Records</span>
          </div>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="py-12 px-4 border border-dashed border-theme-border rounded-2xl text-center space-y-3">
            <div className="h-10 w-10 mx-auto rounded-full bg-theme-surface border border-theme-border flex items-center justify-center text-theme-muted">
              <CreditCard className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold text-theme-main">No expense records found for {selectedMonthLabel}</p>
            <p className="text-[11px] text-theme-muted max-w-sm mx-auto">
              Track personal expenses, subscriptions, and productivity tools by clicking "Add New Expense".
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-theme-border text-theme-muted font-semibold uppercase tracking-wider">
                  <th className="pb-3 px-2">Description</th>
                  <th className="pb-3 px-2">Category</th>
                  <th className="pb-3 px-2">Amount ({currencySymbol})</th>
                  <th className="pb-3 px-2">Date</th>
                  <th className="pb-3 px-2">Payment Method</th>
                  <th className="pb-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border">
                {filteredExpenses.map((expense) => {
                  const expId = expense.id || expense._id;
                  const desc = expense.description || expense.title || 'Expense';
                  return (
                    <tr key={expId} className="hover:bg-theme-card-hover transition group">
                      <td className="py-3 px-2 font-semibold text-theme-main">{desc}</td>
                      <td className="py-3 px-2">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-theme-muted bg-theme-surface border border-theme-border px-2 py-0.5 rounded-full">
                          <Tag className="h-3 w-3" />
                          {expense.category || 'Personal Expenses'}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-extrabold text-emerald-500">
                        {formatAmount(expense.amount || 0)}
                      </td>
                      <td className="py-3 px-2 text-theme-muted">{expense.date || '—'}</td>
                      <td className="py-3 px-2 text-theme-muted">{expense.paymentMethod || 'Credit Card'}</td>
                      <td className="py-3 px-2 text-right">
                        <button
                          onClick={() => setDeleteTarget({ id: expId, description: desc })}
                          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                          title="Delete Expense"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Expense Modal with Dynamic Category Creator */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl border border-theme-border bg-theme-card shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-theme-border">
              <h3 className="text-lg font-bold text-theme-main">Add Expense</h3>
              <span className="text-xs text-theme-accent font-extrabold">Active: {activeCurrency}</span>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-theme-muted mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Personal Expense, Groceries, ChatGPT Plus"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-theme-border bg-theme-surface text-xs text-theme-main outline-none focus:border-theme-accent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-theme-muted mb-1">Amount ({currencySymbol})</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-theme-muted">{currencySymbol}</span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder={activeCurrency === 'INR' ? '1500.00' : '20.00'}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 rounded-xl border border-theme-border bg-theme-surface text-xs text-theme-main outline-none focus:border-theme-accent font-semibold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-theme-muted">Category</label>
                    <button
                      type="button"
                      onClick={() => setIsAddingNewCat(!isAddingNewCat)}
                      className="text-[10px] font-extrabold text-theme-accent hover:underline cursor-pointer flex items-center gap-0.5"
                    >
                      <FolderPlus className="h-3 w-3" />
                      <span>{isAddingNewCat ? 'Cancel' : '+ Custom'}</span>
                    </button>
                  </div>

                  {isAddingNewCat ? (
                    <div className="flex items-center space-x-1">
                      <input
                        type="text"
                        placeholder="e.g. Gym, Travel"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-theme-border bg-theme-surface text-xs text-theme-main outline-none focus:border-theme-accent"
                      />
                      <button
                        type="button"
                        onClick={handleCreateCustomCategory}
                        className="px-2 py-1.5 rounded-xl bg-theme-accent text-white font-bold text-xs shrink-0"
                      >
                        Add
                      </button>
                    </div>
                  ) : (
                    <CustomSelect
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      options={activeCategoriesList}
                      variant="default"
                      size="sm"
                      fullWidth
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-theme-muted mb-1">Expense Date</label>
                <CustomDatePicker
                  value={expenseDate}
                  onChange={(e: any) => setExpenseDate(e.value || e.target?.value || '')}
                  fullWidth
                  size="sm"
                  placeholder="Select Expense Date"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-theme-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-theme-muted hover:bg-theme-card-hover"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-theme-accent text-white font-medium text-xs shadow"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDeleteExpense}
        itemTitle={deleteTarget?.description}
        message="Are you sure you want to delete this expense entry? This action cannot be undone."
      />
    </div>
  );
};
