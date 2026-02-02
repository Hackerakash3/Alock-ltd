import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  PieChart as LucidePieChart, 
  PlusCircle, 
  History, 
  User as UserIcon, 
  ShieldCheck, 
  Sparkles,
  Menu,
  X,
  Plus,
  LogOut,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  CreditCard,
  MessageSquare,
  Settings,
  Shirt,
  AlertTriangle,
  FileText,
  Moon,
  Sun,
  Search,
  Download,
  Filter,
  Wallet
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area
} from 'recharts';

import { 
  User, 
  UserRole, 
  Transaction, 
  TransactionType, 
  Category, 
  AppState,
  WalletType
} from './types.ts';
import { 
  APP_NAME, 
  CURRENCY, 
  DEFAULT_CATEGORIES, 
  TRANSLATIONS, 
  WALLETS, 
  getIcon,
  COLORS,
  CONTACT_PHONE
} from './constants.tsx';
import { categorizeExpenseAI, getAdvancedFinancialAdvice, detectSpendingAnomalies } from './services/gemini.ts';

// --- Service Layer & Persistence ---
const STORAGE_KEY = 'alock_ltd_v3_production';

const getInitialData = (): AppState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Failed to load state", e);
  }
  return {
    transactions: [],
    categories: DEFAULT_CATEGORIES as Category[],
    user: null,
    loading: false,
    language: 'BN',
    theme: 'dark'
  };
};

// --- Branding Component ---
const Logo = ({ className = "w-12 h-12", textVisible = false }: { className?: string, textVisible?: boolean }) => (
  <div className={`flex flex-col items-center ${className}`}>
    <div className="relative group">
      <div className="absolute -top-1 left-2 flex gap-1 group-hover:scale-110 transition-transform duration-500">
        <Shirt className="w-8 h-8 text-amber-600 opacity-60 translate-x-2 blur-[1px]" />
        <Shirt className="w-8 h-8 text-amber-500 filter drop-shadow-lg" />
      </div>
    </div>
    {textVisible && (
      <div className="mt-8 text-center animate-in fade-in zoom-in duration-700">
        <h1 className="text-2xl font-bold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 uppercase">
          ALOCK LTD
        </h1>
        <p className="text-[10px] tracking-[0.4em] text-amber-500/60 font-semibold mt-1 uppercase">
          Elite Finance Management
        </p>
      </div>
    )}
  </div>
);

// --- Main App Component ---
export default function App() {
  const [state, setState] = useState<AppState>(getInitialData());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'ai' | 'profile' | 'admin'>('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const t = TRANSLATIONS[state.language];
  const isDark = state.theme === 'dark';

  // Notifications logic
  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // Auth Logic
  const loginAs = (role: UserRole) => {
    const mockUser: User = {
      uid: role === UserRole.ADMIN ? 'admin-system' : 'user-' + Math.random().toString(36).substr(2, 5),
      name: role === UserRole.ADMIN ? 'ALOCK Executive' : 'Premium Client',
      email: role === UserRole.ADMIN ? 'executive@alock.com' : 'client@alock.com',
      role: role,
      createdAt: Date.now(),
      subscription: {
        plan: 'FREE',
        status: 'INACTIVE',
        startDate: Date.now(),
        endDate: Date.now() + 30 * 24 * 60 * 60 * 1000
      }
    };
    setState(prev => ({ ...prev, user: mockUser }));
    showToast(`Welcome back, ${mockUser.name}`, 'success');
  };

  const logout = () => {
    setState(prev => ({ ...prev, user: null }));
    setActiveTab('dashboard');
  };

  const toggleTheme = () => {
    setState(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }));
  };

  const addTransaction = (txn: Omit<Transaction, 'id' | 'createdAt' | 'uid'>) => {
    if (!state.user) return;
    const newTxn: Transaction = {
      ...txn,
      id: Math.random().toString(36).substr(2, 9),
      uid: state.user.uid,
      createdAt: Date.now()
    };
    setState(prev => ({
      ...prev,
      transactions: [newTxn, ...prev.transactions]
    }));
    setIsAddModalOpen(false);
    showToast(state.language === 'BN' ? 'লেনদেন সফলভাবে যোগ করা হয়েছে' : 'Transaction added successfully');
  };

  const toggleLanguage = () => {
    setState(prev => ({ ...prev, language: prev.language === 'EN' ? 'BN' : 'EN' }));
  };

  const updateSubscription = (plan: 'FREE' | 'PREMIUM') => {
    if (!state.user) return;
    setState(prev => ({
      ...prev,
      user: prev.user ? {
        ...prev.user,
        subscription: {
          ...prev.user.subscription!,
          plan,
          status: 'ACTIVE'
        }
      } : null
    }));
    setIsPremiumModalOpen(false);
    showToast("Subscription upgraded to Executive Pro!");
  };

  if (!state.user) {
    return (
      <div className="min-h-screen bg-[#05070A] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden font-['Inter']">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] -mr-48 -mt-48 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -ml-48 -mb-48"></div>
        
        <div className="relative z-10 mb-16">
          <Logo className="w-24 h-24" textVisible={true} />
        </div>

        <div className="relative z-10 space-y-6 w-full max-w-sm">
          <div className="space-y-2">
            <h2 className="text-white text-lg font-medium tracking-wide">Enter the Executive Suite</h2>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">
              Production-grade financial monitoring for ALOCK LTD partners.
            </p>
          </div>
          
          <button 
            onClick={() => loginAs(UserRole.USER)}
            className="w-full py-4 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 rounded-2xl font-bold flex items-center justify-center gap-3 hover:brightness-110 active:scale-95 transition-all shadow-2xl shadow-amber-500/20"
          >
            <UserIcon size={20} /> Standard Access
          </button>
          <button 
            onClick={() => loginAs(UserRole.ADMIN)}
            className="w-full py-4 border border-white/5 text-slate-400 rounded-2xl font-semibold hover:border-amber-500/30 hover:text-amber-500 transition-all bg-white/[0.02] backdrop-blur-sm"
          >
            Administrative Portal
          </button>
        </div>
        
        <div className="mt-24 text-slate-700 text-[10px] tracking-[0.3em] uppercase font-bold relative z-10">
          Powered by Gemini 3 Intelligence • Secure Environment
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 pb-24 md:pb-0 md:pl-72 ${isDark ? 'bg-[#05070A] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-[100] animate-in slide-in-from-top-4 duration-300">
          <div className={`px-6 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 ${
            notification.type === 'success' 
              ? 'bg-emerald-500 text-white border-emerald-400' 
              : 'bg-rose-500 text-white border-rose-400'
          }`}>
            {notification.type === 'success' ? <ShieldCheck size={20} /> : <AlertTriangle size={20} />}
            <span className="font-bold text-sm">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Sidebar - Desktop Only */}
      <aside className={`hidden md:flex flex-col w-72 border-r fixed inset-y-0 left-0 p-8 transition-all duration-500 z-50 ${isDark ? 'bg-[#07090D] border-white/5' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-4 mb-14">
          <div className="p-2 rounded-xl bg-slate-900 shadow-xl shadow-amber-500/10">
             <Shirt className="w-7 h-7 text-amber-500" />
          </div>
          <div>
            <span className={`font-bold text-xl tracking-wider block ${isDark ? 'text-white' : 'text-slate-900'}`}>{APP_NAME}</span>
            <span className="text-[10px] uppercase tracking-widest text-amber-500 font-bold">Ledger Pro</span>
          </div>
        </div>
        
        <nav className="flex-1 space-y-2">
          <SidebarLink active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LucidePieChart size={20} />} label={t.dashboard} isDark={isDark} />
          <SidebarLink active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<History size={20} />} label={t.history} isDark={isDark} />
          <SidebarLink active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} icon={<Sparkles size={20} />} label={t.aiAdvice} isDark={isDark} />
          <SidebarLink active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<UserIcon size={20} />} label={t.profile} isDark={isDark} />
          {state.user.role === UserRole.ADMIN && (
            <SidebarLink active={activeTab === 'admin'} onClick={() => setActiveTab('admin')} icon={<ShieldCheck size={20} />} label={t.admin} isDark={isDark} />
          )}
        </nav>

        <div className={`pt-8 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 mb-6">
            <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-slate-900 font-bold">
              {state.user.name[0]}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold truncate">{state.user.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{state.user.subscription?.plan} PLAN</p>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-3 text-slate-500 hover:text-rose-500 w-full transition-colors group p-2">
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" /> 
            <span className="text-xs font-bold uppercase tracking-widest">Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto p-6 md:p-12 animate-in fade-in slide-in-from-right-4 duration-700">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-6">
          <div>
            <h2 className={`text-3xl font-bold tracking-tight mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t[activeTab as keyof typeof t] || 'App'}</h2>
            <p className="text-slate-500 text-sm font-medium">Monitoring financial health in real-time.</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={toggleTheme}
              className={`p-3 rounded-2xl transition-all shadow-sm ${isDark ? 'bg-white/5 text-amber-400 hover:bg-white/10' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              title={isDark ? "Enable Day View" : "Enable Night View"}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
              onClick={toggleLanguage}
              className={`px-5 py-2.5 text-xs font-bold border rounded-2xl transition-all shadow-sm ${isDark ? 'bg-white/5 border-white/5 text-white hover:bg-white/10' : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50'}`}
            >
              {state.language === 'EN' ? 'বাংলা সংস্করণ' : 'English Edition'}
            </button>
            {state.user.subscription?.plan === 'FREE' && (
              <button 
                onClick={() => setIsPremiumModalOpen(true)}
                className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-6 py-3 bg-gradient-to-br from-amber-400 to-orange-600 text-white rounded-2xl text-xs font-bold shadow-xl shadow-orange-500/20 hover:scale-105 transition-transform active:scale-95"
              >
                <Sparkles size={16} /> GO PRO
              </button>
            )}
          </div>
        </header>

        <div className="space-y-10">
          {activeTab === 'dashboard' && <DashboardView state={state} t={t} isDark={isDark} />}
          {activeTab === 'history' && <HistoryView state={state} t={t} isDark={isDark} />}
          {activeTab === 'ai' && <AIAdviceView state={state} t={t} isDark={isDark} />}
          {activeTab === 'profile' && <ProfileView user={state.user} t={t} onUpgrade={() => setIsPremiumModalOpen(true)} isDark={isDark} />}
          {activeTab === 'admin' && <AdminPanelView state={state} t={t} isDark={isDark} />}
        </div>

      </main>

      {/* Floating Add Button - Mobile */}
      <div className="fixed bottom-28 right-6 md:bottom-12 md:right-12 z-40">
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-2xl hover:scale-110 active:scale-90 transition-all ${isDark ? 'bg-amber-500 text-slate-950 shadow-amber-500/20' : 'bg-slate-900 text-amber-500 shadow-slate-900/40'}`}
        >
          <Plus size={36} strokeWidth={2.5} />
        </button>
      </div>

      {/* Bottom Navigation - Mobile Only */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 border-t px-6 py-4 flex justify-between items-center z-50 transition-all duration-500 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] ${isDark ? 'bg-[#07090D]/90 backdrop-blur-xl border-white/5' : 'bg-white/90 backdrop-blur-xl border-slate-200'}`}>
        <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LucidePieChart size={24} />} isDark={isDark} label={t.dashboard} />
        <NavButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<History size={24} />} isDark={isDark} label={t.history} />
        <NavButton active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} icon={<Sparkles size={24} />} isDark={isDark} label="AI" />
        <NavButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<UserIcon size={24} />} isDark={isDark} label={t.profile} />
      </nav>

      {/* Add Transaction Modal */}
      {isAddModalOpen && (
        <AddTransactionModal 
          onClose={() => setIsAddModalOpen(false)} 
          onSubmit={addTransaction}
          categories={state.categories}
          t={t}
          language={state.language}
          isDark={isDark}
        />
      )}

      {/* Premium Upgrade Modal */}
      {isPremiumModalOpen && (
        <PremiumModal 
          onClose={() => setIsPremiumModalOpen(false)} 
          onSuccess={() => updateSubscription('PREMIUM')}
          t={t}
          isDark={isDark}
        />
      )}
    </div>
  );
}

// --- Sub-components ---

function SidebarLink({ active, onClick, icon, label, isDark }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, isDark: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-4 w-full p-4 rounded-2xl font-bold transition-all group ${
        active 
          ? isDark ? 'bg-amber-500/10 text-amber-500 shadow-[inset_0_0_20px_rgba(245,158,11,0.05)]' : 'bg-slate-900 text-amber-400' 
          : isDark ? 'text-slate-500 hover:bg-white/[0.03] hover:text-slate-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
        {icon}
      </div>
      <span className="text-sm tracking-wide">{label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-500 shadow-lg shadow-amber-500/50"></div>}
    </button>
  );
}

function NavButton({ active, onClick, icon, isDark, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, isDark: boolean, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all ${
        active 
          ? isDark ? 'text-amber-500' : 'text-slate-950' 
          : 'text-slate-500'
      }`}
    >
      <div className={`p-2 rounded-xl transition-all ${active ? isDark ? 'bg-amber-500/10' : 'bg-slate-100' : ''}`}>
        {icon}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
    </button>
  );
}

function DashboardView({ state, t, isDark }: { state: AppState, t: any, isDark: boolean }) {
  const transactions = state.transactions;
  
  const totalIncome = transactions.filter(t => t.type === TransactionType.INCOME).reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;

  const chartData = useMemo(() => {
    const days = [...Array(10)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (9 - i));
      return d.toISOString().split('T')[0];
    });

    return days.map(day => {
      const dayTxns = transactions.filter(t => t.date === day);
      return {
        name: day.split('-').slice(2).join('/'),
        income: dayTxns.filter(t => t.type === TransactionType.INCOME).reduce((a, b) => a + b.amount, 0),
        expense: dayTxns.filter(t => t.type === TransactionType.EXPENSE).reduce((a, b) => a + b.amount, 0),
      };
    });
  }, [transactions]);

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.filter(t => t.type === TransactionType.EXPENSE).forEach(txn => {
      map[txn.category] = (map[txn.category] || 0) + txn.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card title={t.totalBalance} amount={balance} color="amber" isBalance={true} isDark={isDark} />
        <Card title={t.income} amount={totalIncome} color="emerald" icon={<TrendingUp className="text-emerald-500" />} isDark={isDark} />
        <Card title={t.expense} amount={totalExpense} color="rose" icon={<TrendingDown className="text-rose-500" />} isDark={isDark} />
      </div>

      <div className={`p-8 rounded-3xl border shadow-2xl transition-all ${isDark ? 'bg-[#0A0D14] border-white/[0.03]' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center justify-between mb-8">
          <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.monthlySummary}</h3>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Cash-In</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500"></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Cash-Out</span>
            </div>
          </div>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.1}/>
                  <stop offset="95%" stopColor={COLORS.success} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.danger} stopOpacity={0.1}/>
                  <stop offset="95%" stopColor={COLORS.danger} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#1A1D23" : "#f1f5f9"} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} dy={10} fontWeight="bold" />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} dx={-10} fontWeight="bold" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: isDark ? '#0F172A' : '#fff', 
                  borderRadius: '16px', 
                  border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }} 
              />
              <Area type="monotone" dataKey="income" stroke={COLORS.success} fillOpacity={1} fill="url(#colorIncome)" strokeWidth={3} />
              <Area type="monotone" dataKey="expense" stroke={COLORS.danger} fillOpacity={1} fill="url(#colorExpense)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className={`lg:col-span-2 p-8 rounded-3xl border shadow-sm transition-all ${isDark ? 'bg-[#0A0D14] border-white/[0.03]' : 'bg-white border-slate-200'}`}>
          <h3 className={`text-xl font-bold mb-8 ${isDark ? 'text-white' : 'text-slate-900'}`}>Volume Distribution</h3>
          <div className="h-64 w-full flex items-center justify-center">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={categoryData} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={60}
                    outerRadius={90} 
                    paddingAngle={8}
                    stroke="none"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={[COLORS.primary, COLORS.secondary, COLORS.success, COLORS.warning, COLORS.danger][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-500 text-sm font-medium animate-pulse italic">Awaiting financial data...</div>
            )}
          </div>
        </div>

        <div className={`lg:col-span-3 p-8 rounded-3xl border shadow-sm transition-all ${isDark ? 'bg-[#0A0D14] border-white/[0.03]' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-8">
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.recentActivity}</h3>
            <History size={18} className="text-slate-500" />
          </div>
          <div className="space-y-1">
            {transactions.slice(0, 5).map(txn => (
              <TransactionItem key={txn.id} txn={txn} t={t} isDark={isDark} />
            ))}
            {transactions.length === 0 && (
              <div className="text-slate-500 italic py-12 text-center text-sm">No ledger entries found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function HistoryView({ state, t, isDark }: { state: AppState, t: any, isDark: boolean }) {
  const [search, setSearch] = useState('');
  
  const filteredTxns = useMemo(() => {
    return state.transactions.filter(tx => 
      tx.note.toLowerCase().includes(search.toLowerCase()) || 
      tx.category.toLowerCase().includes(search.toLowerCase())
    );
  }, [state.transactions, search]);

  return (
    <div className="space-y-6">
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row gap-4 items-center shadow-sm ${isDark ? 'bg-[#0A0D14] border-white/5' : 'bg-white border-slate-200'}`}>
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search entries..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-12 pr-4 py-3 rounded-xl outline-none text-sm transition-all ${isDark ? 'bg-white/5 border border-white/5 text-white focus:border-amber-500/50' : 'bg-slate-50 border border-slate-200 focus:border-slate-400'}`}
          />
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button className={`flex-1 sm:flex-none px-4 py-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest transition-all ${isDark ? 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            <Filter size={14} /> Sort
          </button>
          <button className={`flex-1 sm:flex-none px-4 py-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest transition-all ${isDark ? 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            <Download size={14} /> CSV
          </button>
        </div>
      </div>

      <div className={`rounded-3xl border overflow-hidden shadow-2xl transition-all ${isDark ? 'bg-[#0A0D14] border-white/[0.03]' : 'bg-white border-slate-200'}`}>
        {filteredTxns.length > 0 ? (
          filteredTxns.map((txn, idx) => (
            <div key={txn.id} className={idx !== filteredTxns.length - 1 ? isDark ? 'border-b border-white/[0.02]' : 'border-b border-slate-50' : ''}>
              <TransactionItem txn={txn} t={t} showFull isDark={isDark} />
            </div>
          ))
        ) : (
          <div className="p-20 text-center text-slate-500 text-sm font-medium animate-pulse">
            No matching records in the current vault.
          </div>
        )}
      </div>
    </div>
  );
}

function AIAdviceView({ state, t, isDark }: { state: AppState, t: any, isDark: boolean }) {
  const [advice, setAdvice] = useState<string | null>(null);
  const [anomaly, setAnomaly] = useState<{ hasAnomaly: boolean, explanation: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchInsights = async () => {
    if (state.user?.subscription?.plan !== 'PREMIUM') return;
    setLoading(true);
    try {
      const [adviceResult, anomalyResult] = await Promise.all([
        getAdvancedFinancialAdvice(state.transactions, state.language),
        detectSpendingAnomalies(state.transactions, state.language)
      ]);
      setAdvice(adviceResult);
      setAnomaly(anomalyResult);
    } catch (e) {
      console.error("AI Error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (state.user?.subscription?.plan === 'PREMIUM' && state.transactions.length > 0) {
      fetchInsights();
    }
  }, [state.language, state.transactions.length]);

  if (state.user?.subscription?.plan !== 'PREMIUM') {
    return (
      <div className={`p-16 rounded-[40px] border text-center space-y-8 transition-all relative overflow-hidden group ${isDark ? 'bg-[#0A0D14] border-amber-500/10' : 'bg-white border-slate-200'}`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>
        <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-600 rounded-3xl flex items-center justify-center text-white mx-auto shadow-2xl shadow-amber-500/30 group-hover:scale-110 transition-transform duration-500">
          <Sparkles size={48} />
        </div>
        <div className="space-y-4 max-w-md mx-auto relative z-10">
          <h3 className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Intelligence Bureau Pro</h3>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            Gain executive insights powered by Gemini 3.0 Pro. Receive professional audits, anomaly alerts, and automated budgeting based on ALOCK LTD standards.
          </p>
        </div>
        <button 
          onClick={() => {}} 
          className="px-10 py-4 bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 rounded-2xl font-black hover:brightness-110 transition-all uppercase tracking-[0.2em] text-xs shadow-xl shadow-amber-500/20"
        >
          Activate Executive Suite
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className={`p-10 rounded-[40px] border relative overflow-hidden shadow-2xl transition-all ${isDark ? 'bg-[#07090D] border-amber-500/20' : 'bg-slate-900 border-slate-800'}`}>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-bold flex items-center gap-3 text-amber-500">
              <FileText size={28} /> {state.language === 'BN' ? 'আর্থিক অডিট রিপোর্ট' : 'Executive Audit Report'}
            </h3>
            <button 
              onClick={fetchInsights}
              disabled={loading}
              className={`p-3 hover:bg-white/5 rounded-2xl text-amber-500 transition-all ${loading ? 'animate-spin opacity-50' : 'hover:scale-110'}`}
            >
               <Sparkles size={24} />
            </button>
          </div>
          
          <div className="bg-white/[0.03] backdrop-blur-xl rounded-[32px] p-8 min-h-[250px] border border-white/[0.05]">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-6">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-amber-500/10 border-t-amber-500 rounded-full animate-spin"></div>
                  <Sparkles className="absolute inset-0 m-auto text-amber-500 animate-pulse" size={20} />
                </div>
                <div className="text-center">
                  <p className="text-amber-200/50 uppercase tracking-[0.3em] text-[10px] font-black mb-2">Gemini Pro 3.0 Analysis</p>
                  <p className="text-slate-500 text-xs italic">Constructing your professional financial profile...</p>
                </div>
              </div>
            ) : (
              <div className="prose prose-invert max-w-none">
                <p className="whitespace-pre-wrap leading-[1.8] text-slate-300 font-medium text-sm md:text-base">{advice || "Initialize your account with data to generate insights."}</p>
              </div>
            )}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-amber-500/[0.03] via-transparent to-blue-500/[0.03] pointer-events-none"></div>
      </div>

      {anomaly?.hasAnomaly && (
        <div className="bg-rose-500/5 border border-rose-500/20 p-8 rounded-3xl flex items-start gap-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="w-14 h-14 bg-rose-500 text-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xl shadow-rose-500/30">
            <AlertTriangle size={28} />
          </div>
          <div>
            <h4 className="font-bold text-rose-500 text-lg mb-2 uppercase tracking-wide">Financial Anomaly Alert</h4>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">{anomaly.explanation}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`p-8 rounded-3xl border transition-all group hover:shadow-2xl ${isDark ? 'bg-[#0A0D14] border-white/[0.03] hover:border-amber-500/20' : 'bg-white border-slate-200 hover:border-amber-500/10'}`}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center group-hover:bg-amber-500 group-hover:text-slate-950 transition-all duration-500">
              <TrendingUp size={20} />
            </div>
            <h4 className={`font-bold uppercase tracking-widest text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Capital Efficiency</h4>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed font-medium">Predictive modeling indicates a <span className="text-amber-500 font-bold">15% expansion</span> in savings if current liquidity patterns persist.</p>
        </div>
        <div className={`p-8 rounded-3xl border transition-all group hover:shadow-2xl ${isDark ? 'bg-[#0A0D14] border-white/[0.03] hover:border-blue-500/20' : 'bg-white border-slate-200 hover:border-blue-500/10'}`}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
              <CreditCard size={20} />
            </div>
            <h4 className={`font-bold uppercase tracking-widest text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Liquidity Safeguard</h4>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed font-medium">Your wallet "Bank" is maintaining peak performance. Reserve capacity is <span className="text-blue-500 font-bold">Optimal</span>.</p>
        </div>
      </div>
    </div>
  );
}

function ProfileView({ user, t, onUpgrade, isDark }: { user: User, t: any, onUpgrade: () => void, isDark: boolean }) {
  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div className={`p-12 rounded-[40px] border text-center relative overflow-hidden transition-all shadow-2xl ${isDark ? 'bg-[#07090D] border-white/[0.03]' : 'bg-slate-900 border-slate-800'}`}>
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-amber-500/[0.08] to-transparent"></div>
        <div className={`w-32 h-32 rounded-[40px] flex items-center justify-center text-amber-500 mx-auto mb-6 border-2 shadow-2xl relative z-10 rotate-3 group transition-transform ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-800 border-slate-700'}`}>
          <UserIcon size={64} className="-rotate-3" />
        </div>
        <h3 className="text-3xl font-bold text-white relative z-10 tracking-tight">{user.name}</h3>
        <p className="text-slate-500 mb-8 relative z-10 font-medium tracking-wide">{user.email}</p>
        
        <div className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] relative z-10 ${
          user.subscription?.plan === 'PREMIUM' 
            ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950' 
            : 'bg-white/5 text-slate-500 border border-white/5'
        }`}>
          {user.subscription?.plan === 'PREMIUM' ? <Sparkles size={14} /> : null}
          {user.subscription?.plan} ACCESS
        </div>

        {user.subscription?.plan === 'FREE' && (
          <div className="mt-10 relative z-10">
            <button 
              onClick={onUpgrade}
              className="px-10 py-4 bg-amber-500 text-slate-950 rounded-2xl font-black hover:brightness-110 transition-all shadow-2xl shadow-amber-500/20 uppercase tracking-widest text-xs"
            >
              Unlock Executive Tier
            </button>
          </div>
        )}
      </div>

      <div className={`rounded-[32px] border overflow-hidden divide-y shadow-sm transition-all ${isDark ? 'bg-[#0A0D14] border-white/[0.03] divide-white/[0.03]' : 'bg-white border-slate-200 divide-slate-50'}`}>
        <ProfileMenuItem icon={<CreditCard size={20} />} label="Operational Wallets" count={WALLETS.length} isDark={isDark} />
        <ProfileMenuItem icon={<FileText size={20} />} label="Export Comprehensive Audit" isDark={isDark} />
        <ProfileMenuItem icon={<Settings size={20} />} label="Executive Parameters" isDark={isDark} />
        <ProfileMenuItem icon={<MessageSquare size={20} />} label="24/7 Priority Support" subLabel="alockltd@gmail.com" isDark={isDark} />
      </div>
      
      <div className={`p-6 rounded-2xl text-center text-[10px] font-black tracking-[0.4em] uppercase transition-colors ${isDark ? 'bg-white/[0.02] text-slate-600' : 'bg-slate-100 text-slate-400'}`}>
        ALOCK LTD PROPRIETARY SOFTWARE v3.0.1
      </div>
    </div>
  );
}

function AdminPanelView({ state, t, isDark }: { state: AppState, t: any, isDark: boolean }) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { val: '২,৫৩০', label: 'Active Users', icon: <UserIcon size={14} /> },
          { val: '৳৪.৮M', label: 'Gross Revenue', icon: <TrendingUp size={14} /> },
          { val: '৮৯২', label: 'Pro Licenses', icon: <Sparkles size={14} /> },
          { val: '৯৯.৯%', label: 'Sys Uptime', icon: <ShieldCheck size={14} /> },
        ].map((stat, i) => (
          <div key={i} className={`p-6 rounded-3xl border transition-all hover:scale-105 ${isDark ? 'bg-[#0A0D14] border-white/[0.03] shadow-2xl shadow-black/40' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{stat.val}</div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-amber-500">{stat.icon}</span>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className={`rounded-3xl border overflow-hidden transition-all shadow-2xl ${isDark ? 'bg-[#0A0D14] border-white/[0.03]' : 'bg-white border-slate-200'}`}>
        <div className={`p-6 border-b flex justify-between items-center transition-colors ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-100'}`}>
          <h4 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Real-time Event Stream</h4>
          <button className="text-[10px] text-amber-500 font-black uppercase tracking-widest hover:underline">Download Master Audit</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={`text-left border-b transition-colors ${isDark ? 'text-slate-500 border-white/5' : 'text-slate-400 border-slate-100'}`}>
                <th className="p-6 font-black uppercase text-[10px] tracking-[0.2em]">Principal User</th>
                <th className="p-6 font-black uppercase text-[10px] tracking-[0.2em]">Operation</th>
                <th className="p-6 font-black uppercase text-[10px] tracking-[0.2em]">Timestamp</th>
              </tr>
            </thead>
            <tbody className={`divide-y transition-colors ${isDark ? 'divide-white/5' : 'divide-slate-50'}`}>
              {[
                { email: 'm.rahman@alock.ltd', action: 'SYS_LOGIN', tag: 'bg-emerald-500/10 text-emerald-500', time: 'Just Now' },
                { email: 's.karim@partner.com', action: 'TXN_VAULT_ADD', tag: 'bg-blue-500/10 text-blue-500', time: '8m ago' },
                { email: 'k.hussain@client.org', action: 'UPGRADE_EXECUTIVE', tag: 'bg-amber-500/10 text-amber-500', time: '14m ago' },
                { email: 'admin@alock.ltd', action: 'AUDIT_EXPORT', tag: 'bg-slate-500/10 text-slate-400', time: '1h ago' },
              ].map((log, i) => (
                <tr key={i} className={`transition-all ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'}`}>
                  <td className={`p-6 font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{log.email}</td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-current opacity-80 ${log.tag}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="p-6 text-slate-500 text-xs font-medium">{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- Helper UI Components ---

function Card({ title, amount, color, icon, isBalance, isDark }: { title: string, amount: number, color: string, icon?: React.ReactNode, isBalance?: boolean, isDark: boolean }) {
  return (
    <div className={`p-8 rounded-[32px] border transition-all duration-500 relative overflow-hidden group shadow-xl ${
      isBalance 
        ? isDark ? 'bg-[#10141D] border-amber-500/20' : 'bg-slate-900 border-slate-800'
        : isDark ? 'bg-[#0A0D14] border-white/[0.03]' : 'bg-white border-slate-200'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isBalance ? 'text-amber-500/60' : 'text-slate-500'}`}>{title}</span>
        <div className={`transition-transform duration-500 group-hover:scale-110 ${isBalance ? 'text-amber-500' : ''}`}>
          {icon || <Wallet size={20} />}
        </div>
      </div>
      <div className={`text-3xl font-black transition-all group-hover:translate-x-1 ${isBalance || isDark ? 'text-white' : 'text-slate-950'}`}>
        {CURRENCY}{amount.toLocaleString()}
      </div>
      <div className={`absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-700 ${isBalance ? 'bg-amber-500' : `bg-${color}-500`}`}></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none"></div>
    </div>
  );
}

function TransactionItem({ txn, t, showFull, isDark }: { txn: Transaction, t: any, showFull?: boolean, isDark: boolean }) {
  const isExpense = txn.type === TransactionType.EXPENSE;
  return (
    <div className={`flex items-center gap-5 p-5 transition-all group ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'}`}>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${isExpense ? isDark ? 'bg-rose-500/10 text-rose-500' : 'bg-rose-50 text-rose-500' : isDark ? 'bg-emerald-500/10 text-emerald-500' : 'bg-emerald-50 text-emerald-500'}`}>
        {getIcon(DEFAULT_CATEGORIES.find(c => c.name === txn.category)?.icon || 'DollarSign', "w-7 h-7")}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className={`font-bold truncate text-sm md:text-base tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{txn.note || txn.category}</h4>
        <div className="flex items-center gap-3 mt-1">
           <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>{txn.wallet}</span>
           <span className="text-slate-600 font-black text-[10px]">•</span>
           <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{txn.date}</span>
        </div>
      </div>
      <div className={`text-right font-black text-lg ${isExpense ? 'text-rose-500' : 'text-emerald-500'}`}>
        {isExpense ? '-' : '+'}{CURRENCY}{txn.amount.toLocaleString()}
      </div>
    </div>
  );
}

function ProfileMenuItem({ icon, label, count, subLabel, isDark }: { icon: React.ReactNode, label: string, count?: number, subLabel?: string, isDark: boolean }) {
  return (
    <button className={`flex items-center justify-between w-full p-6 transition-all group ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'}`}>
      <div className="flex items-center gap-5">
        <div className={`transition-all duration-300 ${isDark ? 'text-slate-600 group-hover:text-amber-500 group-hover:scale-110' : 'text-slate-400 group-hover:text-slate-900 group-hover:scale-110'}`}>{icon}</div>
        <div className="text-left">
          <span className={`block text-sm font-bold tracking-wide transition-colors ${isDark ? 'text-slate-200 group-hover:text-white' : 'text-slate-700'}`}>{label}</span>
          {subLabel && <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{subLabel}</span>}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {count !== undefined && <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest ${isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>{count}</span>}
        <ChevronRight size={18} className="text-slate-700 transition-transform group-hover:translate-x-1" />
      </div>
    </button>
  );
}

function AddTransactionModal({ onClose, onSubmit, categories, t, language, isDark }: { onClose: () => void, onSubmit: any, categories: Category[], t: any, language: string, isDark: boolean }) {
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[0].name);
  const [wallet, setWallet] = useState(WALLETS[0]);
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleAiCategorize = async () => {
    if (!note) return;
    setIsAiLoading(true);
    const aiData = await categorizeExpenseAI(note, categories);
    if (aiData) {
      if (aiData.amount) setAmount(aiData.amount.toString());
      if (aiData.category) {
        const matchedCat = categories.find(c => c.name.toLowerCase() === aiData.category.toLowerCase() || c.nameBn === aiData.category);
        if (matchedCat) setCategory(matchedCat.name);
      }
      if (aiData.type) setType(aiData.type.toUpperCase() === 'INCOME' ? TransactionType.INCOME : TransactionType.EXPENSE);
    }
    setIsAiLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl">
      <div className={`w-full max-w-xl rounded-t-[40px] sm:rounded-[40px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-500 transition-all ${isDark ? 'bg-[#0A0D14] border border-white/5' : 'bg-white'}`}>
        <div className={`p-8 border-b flex items-center justify-between transition-colors ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
          <div>
            <h3 className={`text-xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.add}</h3>
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">{type === TransactionType.EXPENSE ? 'Capital Outflow' : 'Capital Inflow'}</p>
          </div>
          <button onClick={onClose} className={`p-3 rounded-2xl transition-all ${isDark ? 'hover:bg-white/5 text-slate-500 hover:text-white' : 'hover:bg-slate-100 text-slate-400'}`}><X size={24} /></button>
        </div>
        <div className="p-8 space-y-6">
          <div className={`flex p-1.5 rounded-2xl transition-all ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
            <button 
              onClick={() => setType(TransactionType.EXPENSE)}
              className={`flex-1 py-3 rounded-xl font-black transition-all text-[10px] uppercase tracking-[0.2em] ${type === TransactionType.EXPENSE ? isDark ? 'bg-amber-500 text-slate-950' : 'bg-white shadow-xl text-rose-600' : 'text-slate-500'}`}
            >
              {t.expense}
            </button>
            <button 
              onClick={() => setType(TransactionType.INCOME)}
              className={`flex-1 py-3 rounded-xl font-black transition-all text-[10px] uppercase tracking-[0.2em] ${type === TransactionType.INCOME ? isDark ? 'bg-amber-500 text-slate-950' : 'bg-white shadow-xl text-emerald-600' : 'text-slate-500'}`}
            >
              {t.income}
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">{t.aiCategorize}</label>
            <div className="relative group">
              <textarea 
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t.aiGreeting}
                className={`w-full p-5 rounded-3xl focus:ring-2 outline-none resize-none h-28 text-sm font-bold transition-all ${isDark ? 'bg-white/5 border border-white/5 text-slate-200 focus:ring-amber-500/30' : 'bg-slate-50 border border-slate-200 focus:ring-slate-900/10 focus:border-slate-900'}`}
              />
              <button 
                onClick={handleAiCategorize}
                disabled={isAiLoading || !note}
                className={`absolute bottom-4 right-4 px-4 py-2 rounded-2xl shadow-xl disabled:opacity-40 transition-all flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] ${isDark ? 'bg-amber-500 text-slate-950 hover:brightness-110' : 'bg-slate-900 text-amber-500'}`}
              >
                {isAiLoading ? <div className={`w-3 h-3 border-2 rounded-full animate-spin ${isDark ? 'border-slate-950/30 border-t-slate-950' : 'border-white/20 border-t-white'}`}></div> : <Sparkles size={14} />} 
                <span>Process</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">{t.amount}</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 font-black">{CURRENCY}</span>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`w-full p-5 pl-12 rounded-3xl font-black text-2xl outline-none transition-all ${isDark ? 'bg-white/5 border border-white/5 text-white focus:border-amber-500/50' : 'bg-slate-50 border border-slate-200 focus:border-slate-900'}`}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">{t.date}</label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full p-5 rounded-3xl text-sm font-bold outline-none transition-all ${isDark ? 'bg-white/5 border border-white/5 text-white focus:border-amber-500/50' : 'bg-slate-50 border border-slate-200 focus:border-slate-900'}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">{t.category}</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full p-5 rounded-3xl text-sm outline-none font-bold appearance-none transition-all ${isDark ? 'bg-white/5 border border-white/5 text-slate-200 focus:border-amber-500/50' : 'bg-slate-50 border border-slate-200 text-slate-800 focus:border-slate-900'}`}
              >
                {categories.map(c => <option key={c.id} value={c.name} className={isDark ? "bg-[#0A0D14] text-white" : ""}>{language === 'EN' ? c.name : c.nameBn}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">{t.wallet}</label>
              <select 
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                className={`w-full p-5 rounded-3xl text-sm outline-none font-bold appearance-none transition-all ${isDark ? 'bg-white/5 border border-white/5 text-slate-200 focus:border-amber-500/50' : 'bg-slate-50 border border-slate-200 text-slate-800 focus:border-slate-900'}`}
              >
                {WALLETS.map(w => <option key={w} value={w} className={isDark ? "bg-[#0A0D14] text-white" : ""}>{w}</option>)}
              </select>
            </div>
          </div>

          <button 
            onClick={() => {
              if(!amount || parseFloat(amount) <= 0) return;
              onSubmit({ type, amount: parseFloat(amount), category, wallet, note, date });
            }}
            className={`w-full py-5 rounded-3xl font-black text-xs uppercase tracking-[0.3em] mt-6 shadow-2xl transition-all ${isDark ? 'bg-amber-500 text-slate-950 shadow-amber-500/10 hover:brightness-110' : 'bg-slate-950 text-amber-400 shadow-slate-900/30 hover:bg-slate-800'}`}
          >
            Commit to Ledger
          </button>
        </div>
      </div>
    </div>
  );
}

function PremiumModal({ onClose, onSuccess, t, isDark }: { onClose: () => void, onSuccess: () => void, t: any, isDark: boolean }) {
  const [step, setStep] = useState<'info' | 'payment'>('info');

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl">
      <div className={`w-full max-w-lg rounded-[48px] overflow-hidden shadow-2xl relative transition-all animate-in zoom-in-95 duration-500 ${isDark ? 'bg-[#0A0D14] border border-white/5' : 'bg-white'}`}>
        <button onClick={onClose} className={`absolute top-6 right-6 p-3 rounded-2xl z-10 transition-all ${isDark ? 'bg-white/5 text-slate-500 hover:text-white' : 'bg-slate-100'}`}><X size={20} /></button>
        
        {step === 'info' ? (
          <div className="p-12 space-y-8">
            <div className="text-center space-y-3">
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 border-2 transition-all rotate-6 group-hover:rotate-0 duration-500 ${isDark ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-amber-50 text-amber-500 border-amber-500/10'}`}>
                <Sparkles size={40} />
              </div>
              <h3 className={`text-3xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Executive Tier</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em]">Institutional Grade Intelligence</p>
            </div>

            <div className="space-y-5">
              <FeatureItem label="Advanced AI Audit (Gemini 3 Pro)" isDark={isDark} />
              <FeatureItem label="Predictive Liquidity Modeling" isDark={isDark} />
              <FeatureItem label="Anomaly Detection Algorithms" isDark={isDark} />
              <FeatureItem label="Encrypted PDF Statement Exports" isDark={isDark} />
              <FeatureItem label="Dedicated Merchant Line support" isDark={isDark} />
            </div>

            <div className={`p-6 rounded-[32px] border flex justify-between items-center shadow-2xl transition-all ${isDark ? 'bg-white/[0.03] border-white/5' : 'bg-slate-950 border-white/5'}`}>
              <div>
                <div className="text-[10px] text-amber-500 font-black uppercase tracking-[0.3em]">Access Fee / Year</div>
                <div className="text-3xl font-black text-white">৳৫০০</div>
              </div>
              <button 
                onClick={() => setStep('payment')}
                className="px-8 py-3 bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-amber-500/30"
              >
                Continue
              </button>
            </div>
          </div>
        ) : (
          <div className="p-12 space-y-10">
             <div className="text-center">
                <h3 className={`text-2xl font-black mb-2 uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Secure Gateway</h3>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Select Authorized Channel</p>
             </div>
             <div className="space-y-4">
                <PaymentOption 
                  name="bKash" 
                  color="#D12053" 
                  isDark={isDark}
                  onClick={() => {
                    setTimeout(() => onSuccess(), 1500);
                  }} 
                />
                <PaymentOption 
                  name="Nagad" 
                  color="#F7941E" 
                  isDark={isDark}
                  onClick={() => {
                    setTimeout(() => onSuccess(), 1500);
                  }} 
                />
             </div>
             <div className="text-center">
               <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.4em] mb-4">ALOCK LTD Merchant Verification</p>
               <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-[10px] font-bold text-amber-500">
                 Official ID: {CONTACT_PHONE}
               </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FeatureItem({ label, isDark }: { label: string, isDark: boolean }) {
  return (
    <div className="flex items-center gap-4 group">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${isDark ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 group-hover:scale-110' : 'bg-amber-50 text-amber-500 border-amber-500/10 group-hover:scale-110'}`}>
        <ShieldCheck size={14} />
      </div>
      <span className={`text-xs font-bold tracking-wide transition-colors ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>{label}</span>
    </div>
  );
}

function PaymentOption({ name, color, onClick, isDark }: { name: string, color: string, onClick: () => void, isDark: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full p-6 border-2 rounded-[32px] flex items-center justify-between group transition-all ${isDark ? 'bg-white/[0.02] border-white/5 hover:border-amber-500/40 hover:bg-white/[0.04]' : 'border-slate-100 hover:border-slate-950 hover:bg-slate-50'}`}
    >
      <div className="flex items-center gap-5">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-2xl group-hover:scale-110 transition-transform`} style={{ backgroundColor: color }}>
          {name[0]}
        </div>
        <div className="text-left">
          <span className={`block font-black uppercase tracking-[0.2em] text-[10px] transition-colors ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>Authorize {name}</span>
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Instant Activation</span>
        </div>
      </div>
      <ChevronRight size={20} className="text-slate-700 transition-transform group-hover:translate-x-1" />
    </button>
  );
}