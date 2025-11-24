import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Trash2, Wallet, TrendingUp, TrendingDown, 
  Sparkles, PieChart, LayoutGrid, Home, 
  Coffee, Car, ShoppingBag, Zap, Activity, MoreHorizontal, DollarSign
} from 'lucide-react';

const CATEGORIES = {
  expense: [
    { id: 'food', label: 'อาหาร', icon: Coffee, color: 'bg-orange-100 text-orange-500' },
    { id: 'transport', label: 'เดินทาง', icon: Car, color: 'bg-blue-100 text-blue-500' },
    { id: 'shopping', label: 'ช้อปปิ้ง', icon: ShoppingBag, color: 'bg-pink-100 text-pink-500' },
    { id: 'utilities', label: 'บิล/น้ำไฟ', icon: Zap, color: 'bg-yellow-100 text-yellow-500' },
    { id: 'health', label: 'สุขภาพ', icon: Activity, color: 'bg-emerald-100 text-emerald-500' },
    { id: 'other', label: 'อื่นๆ', icon: MoreHorizontal, color: 'bg-slate-100 text-slate-500' }
  ],
  income: [
    { id: 'salary', label: 'เงินเดือน', icon: DollarSign, color: 'bg-green-100 text-green-500' },
    { id: 'bonus', label: 'โบนัส', icon: Sparkles, color: 'bg-purple-100 text-purple-500' },
    { id: 'other_income', label: 'รายได้อื่นๆ', icon: MoreHorizontal, color: 'bg-slate-100 text-slate-500' }
  ]
};

const App = () => {
  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState('home'); // 'home' or 'dashboard'
  
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('money-tracker-data');
    if (saved) return JSON.parse(saved);
    return [];
  });

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('food');

  useEffect(() => {
    localStorage.setItem('money-tracker-data', JSON.stringify(transactions));
  }, [transactions]);

  // Reset category when type changes
  useEffect(() => {
    setCategory(type === 'expense' ? 'food' : 'salary');
  }, [type]);

  // --- CALCULATIONS ---
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const expense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = income - expense;

  // Dashboard Calculations
  const expenseByCategory = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const grouped = expenses.reduce((acc, t) => {
      const catId = t.category || 'other'; 
      acc[catId] = (acc[catId] || 0) + t.amount;
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([id, total]) => ({
        id,
        total,
        ...CATEGORIES.expense.find(c => c.id === id) || CATEGORIES.expense.find(c => c.id === 'other')
      }))
      .sort((a, b) => b.total - a.total);
  }, [transactions]);

  // Calculate Donut Chart Segments
  const donutSegments = useMemo(() => {
    let cumulativePercent = 0;
    return expenseByCategory.map(cat => {
      const percent = (cat.total / expense) * 100;
      const segment = {
        ...cat,
        percent,
        offset: cumulativePercent
      };
      cumulativePercent += percent;
      return segment;
    });
  }, [expenseByCategory, expense]);

  // --- ACTIONS ---
  const addTransaction = (e) => {
    e.preventDefault();
    if (!description || !amount) return;

    const newTransaction = {
      id: Date.now(),
      description,
      amount: parseFloat(amount),
      type,
      category,
      date: new Date().toLocaleDateString('th-TH')
    };

    setTransactions([newTransaction, ...transactions]);
    setDescription('');
    setAmount('');
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const formatNumber = (num) => {
    return num.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // --- RENDER HELPERS ---
  const getCategoryIcon = (catId, type) => {
    const list = type === 'income' ? CATEGORIES.income : CATEGORIES.expense;
    const cat = list.find(c => c.id === catId) || list.find(c => c.id === 'other') || list[0];
    const Icon = cat.icon;
    return <div className={`p-2 rounded-full ${cat.color}`}><Icon size={18} /></div>;
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 pb-24 relative">
      
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-800 text-white p-6 shadow-lg rounded-b-3xl mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="max-w-md mx-auto relative z-10">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Wallet className="w-8 h-8" /> Money Tracker
            </h1>
          </div>
          <div className="text-center mb-6">
            <p className="text-blue-100 text-sm mb-1">ยอดเงินคงเหลือ</p>
            <h2 className="text-4xl font-bold tracking-tight">฿ {formatNumber(balance)}</h2>
          </div>
          <div className="flex gap-4">
            <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-3 flex items-center gap-3 border border-white/10">
              <div className="bg-emerald-400/20 p-2 rounded-full text-emerald-300"><TrendingUp size={20} /></div>
              <div>
                <p className="text-xs text-blue-100">รายรับ</p>
                <p className="font-bold text-lg">+{formatNumber(income)}</p>
              </div>
            </div>
            <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-3 flex items-center gap-3 border border-white/10">
              <div className="bg-rose-400/20 p-2 rounded-full text-rose-300"><TrendingDown size={20} /></div>
              <div>
                <p className="text-xs text-blue-100">รายจ่าย</p>
                <p className="font-bold text-lg">-{formatNumber(expense)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4">
        
        {/* --- TABS CONTENT --- */}
        {activeTab === 'home' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            
            {/* Input Form */}
            <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
              <h3 className="font-bold text-lg mb-4 text-slate-700">เพิ่มรายการ</h3>
              <form onSubmit={addTransaction} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 font-medium ml-1">ชื่อรายการ</label>
                  <input 
                    type="text" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ระบุชื่อรายการ..."
                  />
                </div>
                
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-slate-400 font-medium ml-1">จำนวนเงิน</label>
                    <input 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="w-1/3">
                    <label className="text-xs text-slate-400 font-medium ml-1">ประเภท</label>
                    <select 
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="expense">รายจ่าย</option>
                      <option value="income">รายรับ</option>
                    </select>
                  </div>
                </div>

                <div>
                   <label className="text-xs text-slate-400 font-medium ml-1">หมวดหมู่</label>
                   <div className="grid grid-cols-3 gap-2 mt-1">
                      {(type === 'income' ? CATEGORIES.income : CATEGORIES.expense).map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCategory(cat.id)}
                          className={`p-2 rounded-lg text-xs font-medium border flex flex-col items-center gap-1 transition-all ${
                            category === cat.id 
                              ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500' 
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <cat.icon size={16} />
                          {cat.label}
                        </button>
                      ))}
                   </div>
                </div>

                <button 
                  type="submit"
                  className={`w-full py-3 rounded-xl text-white font-bold shadow-md transition-transform active:scale-95 flex justify-center items-center gap-2 ${type === 'income' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
                >
                  <Plus size={20} /> บันทึกรายการ
                </button>
              </form>
            </div>

            {/* Transactions List */}
            <div className="space-y-3">
              <h3 className="font-bold text-lg text-slate-700">รายการล่าสุด</h3>
              {transactions.length === 0 ? (
                <div className="text-center py-10 text-slate-400 bg-white rounded-2xl border-dashed border-2 border-slate-200">
                  ไม่มีรายการ
                </div>
              ) : (
                transactions.map((t) => (
                  <div key={t.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(t.category, t.type)}
                      <div>
                        <p className="font-semibold text-slate-700">{t.description}</p>
                        <p className="text-xs text-slate-400">{t.date} • {t.category ? (CATEGORIES.expense.find(c=>c.id===t.category)?.label || CATEGORIES.income.find(c=>c.id===t.category)?.label || 'อื่นๆ') : 'ทั่วไป'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-bold ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                        {t.type === 'income' ? '+' : '-'}{formatNumber(t.amount)}
                      </span>
                      <button onClick={() => deleteTransaction(t.id)} className="text-slate-300 hover:text-red-400">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
            {/* Dashboard Content */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <PieChart className="text-blue-500" size={20} /> 
                สัดส่วนรายจ่าย
              </h3>
              
              {expense === 0 ? (
                <div className="text-center py-12 text-slate-400">ยังไม่มีรายจ่าย</div>
              ) : (
                <div>
                  {/* Donut Chart SVG */}
                  <div className="relative w-64 h-64 mx-auto mb-8">
                    <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                      {/* Background Circle */}
                      <circle cx="50" cy="50" r="40" className="text-slate-100 stroke-current" strokeWidth="12" fill="none" />
                      
                      {/* Segments */}
                      {donutSegments.map((cat) => (
                        <circle
                          key={cat.id}
                          cx="50" cy="50" r="40"
                          fill="none"
                          strokeWidth="12"
                          strokeDasharray={`${cat.percent} 100`}
                          strokeDashoffset={-cat.offset}
                          strokeLinecap="round"
                          className={`${cat.color.split(' ')[1]} stroke-current transition-all duration-1000 ease-out`}
                        />
                      ))}
                    </svg>
                    
                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <p className="text-xs text-slate-400">รายจ่ายรวม</p>
                      <p className="text-2xl font-bold text-slate-700">฿{formatNumber(expense)}</p>
                    </div>
                  </div>

                  {/* Legend List */}
                  <div className="space-y-3">
                    {expenseByCategory.map((cat) => (
                      <div key={cat.id} className="flex items-center justify-between group p-2 hover:bg-slate-50 rounded-xl transition-colors">
                        <div className="flex items-center gap-3">
                           <div className={`p-2 rounded-lg ${cat.color}`}>
                             <cat.icon size={16} />
                           </div>
                           <div>
                             <p className="text-sm font-semibold text-slate-700">{cat.label}</p>
                             <div className="flex items-center gap-2">
                               <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                 <div 
                                   className={`h-full rounded-full ${cat.color.split(' ')[0]}`} 
                                   style={{ width: `${((cat.total / expense) * 100)}%` }}
                                 ></div>
                               </div>
                               <p className="text-xs text-slate-400">{((cat.total / expense) * 100).toFixed(1)}%</p>
                             </div>
                           </div>
                        </div>
                        <p className="font-bold text-slate-700">฿{formatNumber(cat.total)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
              <h3 className="font-bold text-lg mb-2 text-indigo-900">💡 Tip การเงิน</h3>
              <p className="text-indigo-700 text-sm leading-relaxed">
                การแบ่งเงินเป็นส่วนๆ ตามหมวดหมู่ (เช่น อาหาร 40%, เก็บออม 20%) จะช่วยให้คุณคุมงบประมาณได้ง่ายขึ้น ลองตั้งเป้าลดรายจ่ายในหมวด "{expenseByCategory[0]?.label || 'ทั่วไป'}" ดูสิครับ!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 px-6 py-3 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-40">
        <div className="max-w-md mx-auto flex justify-around">
          <button 
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'home' ? 'text-blue-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Home size={24} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">หน้าหลัก</span>
          </button>
          
          <div className="w-px h-8 bg-slate-100"></div>

          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'dashboard' ? 'text-blue-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <LayoutGrid size={24} strokeWidth={activeTab === 'dashboard' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">ภาพรวม</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;