import React, { useState, useMemo, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip 
} from 'recharts';
import { 
  Calendar, CreditCard, PieChart as PieChartIcon, Plus, 
  ChevronLeft, ChevronRight, Settings, Utensils, 
  Car, ShoppingBag, Home, Smartphone, Gamepad2, 
  DollarSign, Briefcase, Heart, CheckCircle2, Circle, X, Edit3, Trash2, 
  Upload, FileText, ChevronDown, GripVertical, Coins,
  PlusCircle, MinusCircle, CornerDownRight, TrendingUp, TrendingDown,
  ToggleLeft, ToggleRight, ArrowLeft, LogIn, LogOut, User,
  Plane, Coffee, Music, Book, Zap, Star, Smile, Sun, Umbrella, Gift
} from 'lucide-react';

// --- Firebase Imports ---
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  updateDoc
} from 'firebase/firestore';

// --- Firebase Initialization ---
// ★★★ 已更新為 accounting-c6599 的設定 ★★★
const firebaseConfig = {
  apiKey: "AIzaSyAuAZSgs-oUS7hmfsDKZyQNqpbSCiOUfik",
  authDomain: "accounting-c6599.firebaseapp.com",
  projectId: "accounting-c6599",
  storageBucket: "accounting-c6599.firebasestorage.app",
  messagingSenderId: "53340382920",
  appId: "1:53340382920:web:ada671f7d3464ace5867fd"
};

let app;
let auth;
let db;
try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
} catch (e) {
    console.error("Firebase init error", e);
}

// --- 圖示庫定義 ---
const AVAILABLE_ICONS = {
  'Utensils': <Utensils className="w-full h-full p-1.5 text-white" />,
  'Car': <Car className="w-full h-full p-1.5 text-white" />,
  'ShoppingBag': <ShoppingBag className="w-full h-full p-1.5 text-white" />,
  'Home': <Home className="w-full h-full p-1.5 text-white" />,
  'Smartphone': <Smartphone className="w-full h-full p-1.5 text-white" />,
  'Gamepad2': <Gamepad2 className="w-full h-full p-1.5 text-white" />,
  'Briefcase': <Briefcase className="w-full h-full p-1.5 text-white" />,
  'DollarSign': <DollarSign className="w-full h-full p-1.5 text-white" />,
  'Heart': <Heart className="w-full h-full p-1.5 text-white" />,
  'Plane': <Plane className="w-full h-full p-1.5 text-white" />,
  'Coffee': <Coffee className="w-full h-full p-1.5 text-white" />,
  'Music': <Music className="w-full h-full p-1.5 text-white" />,
  'Book': <Book className="w-full h-full p-1.5 text-white" />,
  'Zap': <Zap className="w-full h-full p-1.5 text-white" />,
  'Star': <Star className="w-full h-full p-1.5 text-white" />,
  'Smile': <Smile className="w-full h-full p-1.5 text-white" />,
  'Sun': <Sun className="w-full h-full p-1.5 text-white" />,
  'Umbrella': <Umbrella className="w-full h-full p-1.5 text-white" />,
  'Gift': <Gift className="w-full h-full p-1.5 text-white" />,
  'Circle': <Circle className="w-full h-full p-1.5 text-white" />,
};

const ICON_COLORS = {
  'Utensils': 'bg-orange-300',
  'Car': 'bg-blue-300',
  'ShoppingBag': 'bg-pink-300',
  'Home': 'bg-green-300',
  'Smartphone': 'bg-purple-300',
  'Gamepad2': 'bg-yellow-300',
  'Briefcase': 'bg-teal-300',
  'DollarSign': 'bg-red-300',
  'Heart': 'bg-rose-300',
  'Plane': 'bg-sky-300',
  'Coffee': 'bg-amber-400',
  'Music': 'bg-violet-300',
  'Book': 'bg-indigo-300',
  'Zap': 'bg-yellow-400',
  'Star': 'bg-yellow-200',
  'Smile': 'bg-lime-300',
  'Sun': 'bg-orange-200',
  'Umbrella': 'bg-blue-200',
  'Gift': 'bg-red-200',
  'Circle': 'bg-gray-300',
};

const DEFAULT_EXPENSE_CATEGORIES = {
    '飲食': { subs: [], includeInBudget: true, icon: 'Utensils' },
    '居家': { subs: ['孝親費'], includeInBudget: false, icon: 'Home' }, 
    '課金': { subs: ['鳴潮', '崩鐵', '妮姬'], includeInBudget: true, icon: 'Gamepad2' },
    '其他-計預算': { subs: ['補正'], includeInBudget: true, icon: 'Circle' },
    '其他-不計預算': { subs: ['HDMI分離器'], includeInBudget: false, icon: 'Circle' },
    '汽車': { subs: [], includeInBudget: true, icon: 'Car' },
    '娛樂': { subs: ['拼圖框'], includeInBudget: true, icon: 'Smile' },
    '東京遊': { subs: ['日本遊-其他', '日本遊-動漫', '日本遊-購物'], includeInBudget: false, icon: 'Plane' },
    '日常用品': { subs: [], includeInBudget: true, icon: 'ShoppingBag' },
    '交通': { subs: [], includeInBudget: true, icon: 'Car' },
    '電話網路': { subs: [], includeInBudget: true, icon: 'Smartphone' },
    '美容美髮': { subs: [], includeInBudget: true, icon: 'Heart' },
    '交際應酬': { subs: [], includeInBudget: true, icon: 'Coffee' }
};

const DEFAULT_INCOME_CATEGORIES = {
    '工資': { subs: [], icon: 'Briefcase' },
    '獎金': { subs: [], icon: 'DollarSign' },
    '投資': { subs: [], icon: 'TrendingUp' },
    '其他': { subs: [], icon: 'Circle' }
};

// --- 工具函數 ---

const getIconComponent = (iconName, customClass) => {
  if (AVAILABLE_ICONS[iconName]) {
      return <div className={`w-10 h-10 rounded-2xl ${ICON_COLORS[iconName] || 'bg-gray-300'} shadow-sm flex items-center justify-center ${customClass}`}>{AVAILABLE_ICONS[iconName]}</div>;
  }
  return <div className="w-10 h-10 rounded-2xl bg-gray-300 shadow-sm flex items-center justify-center"><Circle className="w-full h-full p-1.5 text-white" /></div>;
};

const getIcon = (categoryName, categoriesSettings) => {
    let iconName = 'Circle';
    if (categoriesSettings && categoriesSettings[categoryName] && categoriesSettings[categoryName].icon) {
        iconName = categoriesSettings[categoryName].icon;
    } else {
        const name = categoryName ? categoryName.toLowerCase() : '';
        if (name.includes('食') || name.includes('吃')) iconName = 'Utensils';
        else if (name.includes('車') || name.includes('通')) iconName = 'Car';
        else if (name.includes('購') || name.includes('買')) iconName = 'ShoppingBag';
        else if (name.includes('居') || name.includes('房')) iconName = 'Home';
        else if (name.includes('網') || name.includes('機')) iconName = 'Smartphone';
        else if (name.includes('樂') || name.includes('遊') || name.includes('課')) iconName = 'Gamepad2';
        else if (name.includes('薪') || name.includes('工')) iconName = 'Briefcase';
        else if (name.includes('投') || name.includes('金')) iconName = 'DollarSign';
        else if (name.includes('美')) iconName = 'Heart';
        else if (name.includes('旅') || name.includes('飛')) iconName = 'Plane';
    }
    return getIconComponent(iconName);
};


const formatMoney = (amount) => new Intl.NumberFormat('zh-TW', { style: 'decimal', minimumFractionDigits: 0 }).format(amount);
const formatDateForInput = (date) => date.toISOString().split('T')[0];
const getMonthKey = (date) => `${date.getFullYear()}-${date.getMonth() + 1}`;

const parseCSV = (csv) => {
  const lines = csv.split('\n');
  const result = [];
  
  for (let i = 1; i < lines.length; i++) {
    const currentline = lines[i].split(',');
    if(currentline.length < 2) continue;

    const dateStr = currentline[0];
    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6)) - 1;
    const day = parseInt(dateStr.substring(6, 8));
    
    const category = currentline[1];
    const majorCategory = currentline[2] || category;
    
    let includeInBudget = true;
    if (currentline[12]) {
        includeInBudget = currentline[12].trim().toLowerCase() === 'true';
    } else {
        if (majorCategory.includes('不計') || majorCategory.includes('遊') || majorCategory.includes('居家')) {
            includeInBudget = false;
        }
    }

    const obj = {
      date: new Date(year, month, day).toISOString(), 
      category: category, 
      majorCategory: majorCategory, 
      hasSub: !!currentline[2], 
      amount: parseInt(currentline[3]),
      note: currentline[8] || '',
      type: currentline[9] === '收' ? 'income' : 'expense',
      includeInBudget: includeInBudget
    };
    result.push(obj);
  }
  return result;
};

const PASTEL_COLORS = ['#FFADAD', '#FFD6A5', '#FDFFB6', '#CAFFBF', '#9BF6FF', '#A0C4FF', '#BDB2FF', '#FFC6FF'];

export default function ExpenseApp() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]); 
  const [currentView, setCurrentView] = useState('daily'); 
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [statsRange, setStatsRange] = useState('month'); 
  const [statsType, setStatsType] = useState('expense'); 
  
  const [monthlyBudgets, setMonthlyBudgets] = useState({ '2025-12': 15000 }); 
  const [defaultBudget, setDefaultBudget] = useState(11000); 

  const [expenseCategories, setExpenseCategories] = useState({});
  const [incomeCategories, setIncomeCategories] = useState({});

  const [detailConfig, setDetailConfig] = useState({ category: '', type: 'expense', parentView: 'daily', range: 'month' });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    amount: '', 
    majorCategory: '', 
    subCategory: '', 
    type: 'expense', 
    date: formatDateForInput(new Date()), 
    note: '',
    includeInBudget: true
  });
  const [isCategorySelectorOpen, setIsCategorySelectorOpen] = useState(false); 
  const [isSubCategorySelectorOpen, setIsSubCategorySelectorOpen] = useState(false);
  const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ major: '', subs: [], includeInBudget: true, newSub: '', type: 'expense', icon: 'Circle' });
  const [isIconSelectorOpen, setIsIconSelectorOpen] = useState(false);

  const [isBudgetEditOpen, setIsBudgetEditOpen] = useState(false);
  const [tempBudget, setTempBudget] = useState('');

  // --- Firebase Logic ---
  useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser);
          if (!currentUser) setTransactions([]); 
      });
      return () => unsubscribe();
  }, []);

  useEffect(() => {
      if (!user) return;
      const collectionRef = collection(db, 'users', user.uid, 'transactions');
      const q = query(collectionRef); 

      const unsubscribe = onSnapshot(q, (snapshot) => {
          const transData = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              date: new Date(doc.data().date)
          }));
          transData.sort((a, b) => b.date - a.date);
          setTransactions(transData);
      });

      return () => unsubscribe();
  }, [user]);

  useEffect(() => {
      const savedEx = localStorage.getItem('expenseCategories');
      if (savedEx) setExpenseCategories(JSON.parse(savedEx));
      else setExpenseCategories(DEFAULT_EXPENSE_CATEGORIES);

      const savedIn = localStorage.getItem('incomeCategories');
      if (savedIn) setIncomeCategories(JSON.parse(savedIn));
      else setIncomeCategories(DEFAULT_INCOME_CATEGORIES);
      
      const savedBudgets = localStorage.getItem('monthlyBudgets');
      if (savedBudgets) setMonthlyBudgets(JSON.parse(savedBudgets));
      
      const savedDefault = localStorage.getItem('defaultBudget');
      if (savedDefault) setDefaultBudget(parseInt(savedDefault));
  }, []);

  useEffect(() => {
      if (Object.keys(expenseCategories).length > 0) 
        localStorage.setItem('expenseCategories', JSON.stringify(expenseCategories));
  }, [expenseCategories]);

  useEffect(() => {
      if (Object.keys(incomeCategories).length > 0)
        localStorage.setItem('incomeCategories', JSON.stringify(incomeCategories));
  }, [incomeCategories]);
  
  useEffect(() => {
      localStorage.setItem('monthlyBudgets', JSON.stringify(monthlyBudgets));
  }, [monthlyBudgets]);

  useEffect(() => {
      localStorage.setItem('defaultBudget', defaultBudget.toString());
  }, [defaultBudget]);

  const handleGoogleLogin = async () => {
      try {
          await signInWithPopup(auth, new GoogleAuthProvider());
      } catch (error) {
          console.error("Login failed", error);
          alert("登入失敗");
      }
  };

  const handleLogout = async () => {
      await signOut(auth);
  };

  const saveToFirestore = async (data) => {
      if (!user) return;
      const collectionRef = collection(db, 'users', user.uid, 'transactions');
      const saveData = { ...data, date: data.date.toISOString() };
      
      if (data.id) {
          const { id, ...rest } = saveData;
          await updateDoc(doc(db, 'users', user.uid, 'transactions', id), rest);
      } else {
          await addDoc(collectionRef, saveData);
      }
  };

  const deleteFromFirestore = async (id) => {
      if (!user) return;
      await deleteDoc(doc(db, 'users', user.uid, 'transactions', id));
  };

  const currentMonthBudget = useMemo(() => {
      const key = getMonthKey(currentDate);
      return monthlyBudgets[key] !== undefined ? monthlyBudgets[key] : defaultBudget;
  }, [monthlyBudgets, currentDate, defaultBudget]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (currentView === 'categoryDetail') {
          const isAll = detailConfig.range === 'all';
          const isYearly = detailConfig.range === 'year';
          const sameYear = t.date.getFullYear() === currentDate.getFullYear();
          const sameMonth = t.date.getMonth() === currentDate.getMonth();
          let dateMatch = false;
          if (isAll) dateMatch = true;
          else if (isYearly) dateMatch = sameYear;
          else dateMatch = (sameYear && sameMonth);
          return dateMatch && t.majorCategory === detailConfig.category && t.type === detailConfig.type;
      }
      if (currentView === 'stats') {
         if (statsRange === 'all') return true;
         if (statsRange === 'year') return t.date.getFullYear() === currentDate.getFullYear();
         return t.date.getFullYear() === currentDate.getFullYear() && t.date.getMonth() === currentDate.getMonth();
      }
      return t.date.getFullYear() === currentDate.getFullYear() && t.date.getMonth() === currentDate.getMonth();
    });
  }, [transactions, currentDate, statsRange, currentView, detailConfig]);

  const dailySummary = useMemo(() => {
    let income = 0;
    let expense = 0;
    const currentMonthTrans = transactions.filter(t => 
        t.date.getFullYear() === currentDate.getFullYear() &&
        t.date.getMonth() === currentDate.getMonth()
    );
    currentMonthTrans.forEach(t => {
      if (t.type === 'income') income += t.amount;
      else expense += t.amount;
    });
    return { income, expense, total: income - expense };
  }, [transactions, currentDate]);

  const groupedByDate = useMemo(() => {
    const groups = {};
    filteredTransactions.forEach(t => {
      const dateKey = t.date.toLocaleDateString('zh-TW');
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(t);
    });
    return Object.keys(groups).sort((a, b) => new Date(b) - new Date(a)).reduce((obj, key) => {
        obj[key] = groups[key];
        return obj;
    }, {});
  }, [filteredTransactions]);

  const budgetStatus = useMemo(() => {
    let totalActual = 0;
    let includedSpending = {};

    const currentMonthTrans = transactions.filter(t => 
        t.type === 'expense' &&
        t.date.getFullYear() === currentDate.getFullYear() &&
        t.date.getMonth() === currentDate.getMonth()
    );

    currentMonthTrans.forEach(t => {
        if (t.includeInBudget) {
            totalActual += t.amount;
            
            if(!includedSpending[t.majorCategory]) {
                includedSpending[t.majorCategory] = { total: 0, subs: {} };
            }
            includedSpending[t.majorCategory].total += t.amount;
            
            if(t.hasSub && t.category !== t.majorCategory) {
                if(!includedSpending[t.majorCategory].subs[t.category]) {
                    includedSpending[t.majorCategory].subs[t.category] = 0;
                }
                includedSpending[t.majorCategory].subs[t.category] += t.amount;
            }
        }
    });

    const now = new Date();
    const isCurrentViewingMonth = now.getFullYear() === currentDate.getFullYear() && now.getMonth() === currentDate.getMonth();
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    let remainingDays = 0;
    if (isCurrentViewingMonth) {
        remainingDays = Math.max(1, daysInMonth - now.getDate() + 1);
    } else if (now < currentDate) {
        remainingDays = daysInMonth;
    }
    
    const remainingBudget = currentMonthBudget - totalActual;
    const dailyAverage = remainingDays > 0 ? Math.floor(remainingBudget / remainingDays) : 0;

    const includedList = Object.keys(includedSpending).map(key => ({
        name: key,
        value: includedSpending[key].total,
        subs: Object.keys(includedSpending[key].subs).map(s => ({ name: s, value: includedSpending[key].subs[s] })).sort((a,b)=>b.value-a.value),
        ratio: totalActual > 0 ? includedSpending[key].total / totalActual : 0
    })).sort((a, b) => b.value - a.value);

    return { 
        totalBudget: currentMonthBudget, 
        totalActual, 
        percent: currentMonthBudget > 0 ? (totalActual / currentMonthBudget) * 100 : 0,
        remaining: remainingBudget,
        remainingDays,
        dailyAverage,
        includedList
    };
  }, [transactions, currentDate, currentMonthBudget]);

  const statsData = useMemo(() => {
    const groupData = {}; 
    let total = 0;
    filteredTransactions.forEach(t => {
      if (t.type === statsType) {
        const major = t.majorCategory;
        const sub = t.category !== t.majorCategory ? t.category : '其他';
        if (!groupData[major]) groupData[major] = { total: 0, subs: {} };
        groupData[major].total += t.amount;
        if (!groupData[major].subs[sub]) groupData[major].subs[sub] = 0;
        groupData[major].subs[sub] += t.amount;
        total += t.amount;
      }
    });
    const chartData = Object.keys(groupData).map(major => ({
      name: major,
      value: groupData[major].total,
      subs: Object.keys(groupData[major].subs).map(s => ({ name: s, value: groupData[major].subs[s] })).sort((a,b)=>b.value-a.value),
      ratio: total > 0 ? (groupData[major].total / total) : 0
    })).sort((a, b) => b.value - a.value);
    return { total, chartData };
  }, [filteredTransactions, statsType]);

  const changeMonth = (offset) => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + offset);
    setCurrentDate(d);
  };
  const changeYear = (offset) => {
    const d = new Date(currentDate);
    d.setFullYear(d.getFullYear() + offset);
    setCurrentDate(d);
  };

  const openBudgetEditModal = () => {
      setTempBudget(currentMonthBudget.toString());
      setIsBudgetEditOpen(true);
  };

  const saveSpecificMonthBudget = () => {
      const amount = parseInt(tempBudget) || 0;
      const key = getMonthKey(currentDate);
      setMonthlyBudgets(prev => ({ ...prev, [key]: amount }));
      setIsBudgetEditOpen(false);
  };

  const updateDefaultBudget = (val) => setDefaultBudget(parseInt(val) || 0);
  const updateMonthlyBudget = (val) => { 
      const key = getMonthKey(currentDate);
      setMonthlyBudgets(prev => ({ ...prev, [key]: parseInt(val) || 0 }));
  };

  const handleToggleCategoryBudgetRule = (majorCat) => {
      const newStatus = !expenseCategories[majorCat].includeInBudget;
      setExpenseCategories(prev => ({
          ...prev,
          [majorCat]: { ...prev[majorCat], includeInBudget: newStatus }
      }));
  };

  const handleSaveTransaction = async () => {
    const amount = parseInt(formData.amount);
    if (!amount) return;

    const currentSettings = formData.type === 'expense' ? expenseCategories : incomeCategories;
    const setSettings = formData.type === 'expense' ? setExpenseCategories : setIncomeCategories;
    const major = formData.majorCategory;
    const sub = formData.subCategory;
    if (!currentSettings[major]) {
        setSettings(prev => ({ ...prev, [major]: { includeInBudget: formData.type === 'expense', subs: sub ? [sub] : [], icon: 'Circle' } }));
    } else if (sub && !currentSettings[major].subs.includes(sub)) {
        setSettings(prev => ({ ...prev, [major]: { ...prev[major], subs: [...prev[major].subs, sub] } }));
    }

    const transactionData = {
      id: editingId, 
      date: new Date(formData.date),
      category: sub || major,
      majorCategory: major,
      hasSub: !!sub,
      amount: amount,
      type: formData.type,
      currency: 'TWD',
      account: '現金',
      member: '自己',
      note: formData.note,
      includeInBudget: formData.includeInBudget
    };

    await saveToFirestore(transactionData);
    setIsModalOpen(false);
  };

  const handleSaveCategory = () => {
      if(!categoryForm.major) return;
      const setSettings = categoryForm.type === 'expense' ? setExpenseCategories : setIncomeCategories;
      setSettings(prev => ({
          ...prev,
          [categoryForm.major]: {
              includeInBudget: categoryForm.includeInBudget,
              subs: categoryForm.subs,
              icon: categoryForm.icon 
          }
      }));
      setIsCategoryModalOpen(false);
  };

  const handleAddSubCategory = () => {
      if (categoryForm.newSub && !categoryForm.subs.includes(categoryForm.newSub)) {
          setCategoryForm(prev => ({ ...prev, subs: [...prev.subs, prev.newSub], newSub: '' }));
      }
  };

  const handleRemoveSubCategory = (sub) => {
      setCategoryForm(prev => ({ ...prev, subs: prev.subs.filter(s => s !== sub) }));
  };

  const handleDeleteCategory = (major, type) => {
      if(window.confirm(`確定要刪除「${major}」這個類別嗎？`)) {
          const setSettings = type === 'expense' ? setExpenseCategories : setIncomeCategories;
          setSettings(prev => {
              const newState = { ...prev };
              delete newState[major];
              return newState;
          });
      }
  };

  const handleDeleteClick = async () => {
      if (!isDeleteConfirming) {
          setIsDeleteConfirming(true);
      } else {
          await deleteFromFirestore(editingId);
          setIsModalOpen(false);
          setIsDeleteConfirming(false);
      }
  };

  const handleOpenAdd = () => {
    if (!user) { alert("請先登入 (設定頁面)"); return; }
    setEditingId(null);
    setFormData({ amount: '', majorCategory: '飲食', subCategory: '', type: 'expense', date: formatDateForInput(new Date()), note: '', includeInBudget: true });
    setIsCategorySelectorOpen(false); setIsSubCategorySelectorOpen(false); setIsDeleteConfirming(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t) => {
    setEditingId(t.id);
    const isSub = t.hasSub && t.category !== t.majorCategory;
    setFormData({ 
        amount: t.amount, majorCategory: t.majorCategory, subCategory: isSub ? t.category : '', type: t.type, 
        date: formatDateForInput(t.date), note: t.note, includeInBudget: t.includeInBudget
    });
    setIsCategorySelectorOpen(false); setIsSubCategorySelectorOpen(false); setIsDeleteConfirming(false);
    setIsModalOpen(true);
  };

  const handleSelectMajorCategory = (cat) => {
      const settings = formData.type === 'expense' ? expenseCategories : incomeCategories;
      const defaultInclude = settings[cat]?.includeInBudget ?? true;
      setFormData(prev => ({ ...prev, majorCategory: cat, subCategory: '', includeInBudget: defaultInclude }));
      setIsCategorySelectorOpen(false);
      if (settings[cat]?.subs?.length > 0) setIsSubCategorySelectorOpen(true);
      else setIsSubCategorySelectorOpen(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!user) { alert("請先登入"); return; }
    const reader = new FileReader();
    reader.onload = async (evt) => {
        const text = evt.target.result;
        const newData = parseCSV(text);
        let count = 0;
        
        let updatedExpenseCats = { ...expenseCategories };
        let updatedIncomeCats = { ...incomeCategories };
        let hasCategoryUpdates = false;

        for (const item of newData) {
            const { id, ...data } = item; 
            
            const isExpense = data.type === 'expense';
            const targetCats = isExpense ? updatedExpenseCats : updatedIncomeCats;
            
            // Update logic: Add missing categories
            if (!targetCats[data.majorCategory]) {
                targetCats[data.majorCategory] = { 
                    includeInBudget: isExpense ? data.includeInBudget : false, 
                    subs: [],
                    icon: 'Circle' 
                };
                hasCategoryUpdates = true;
            }

            if (data.hasSub && data.category !== data.majorCategory) {
                if (!targetCats[data.majorCategory].subs.includes(data.category)) {
                    targetCats[data.majorCategory].subs.push(data.category);
                    hasCategoryUpdates = true;
                }
            }
            
            await saveToFirestore({ ...data, date: new Date(data.date) });
            count++;
        }

        if (hasCategoryUpdates) {
            setExpenseCategories(updatedExpenseCats);
            setIncomeCategories(updatedIncomeCats);
        }

        alert(`成功匯入 ${count} 筆資料至雲端，並同步相關類別！`);
    };
    reader.readAsText(file);
  };

  const handleGoToDetail = (category, type) => {
      let range = 'month';
      if (currentView === 'stats') range = statsRange;
      setDetailConfig({ category, type, parentView: currentView, range });
      setCurrentView('categoryDetail');
  };

  const getCurrentCategorySettings = () => formData.type === 'expense' ? expenseCategories : incomeCategories;

  const shouldShowSubCategory = useMemo(() => {
      if (!formData.majorCategory) return false;
      if (formData.subCategory) return true;
      const settings = getCurrentCategorySettings()[formData.majorCategory];
      return settings && settings.subs && settings.subs.length > 0;
  }, [formData.majorCategory, formData.subCategory, formData.type, expenseCategories, incomeCategories]);

  const renderCategorySettings = (categories, type) => (
      <div className="space-y-3">
          {Object.keys(categories).map(cat => (
              <div key={cat} className="flex items-center justify-between bg-white border border-gray-100 p-3 rounded-2xl shadow-sm">
                  <div className="flex items-center">
                      {type === 'expense' && (
                          <button 
                            onClick={() => handleToggleCategoryBudgetRule(cat)}
                            className={`mr-3 transition-colors ${categories[cat].includeInBudget ? 'text-orange-500' : 'text-gray-300'}`}
                          >
                            {categories[cat].includeInBudget ? <ToggleRight size={28}/> : <ToggleLeft size={28}/>}
                          </button>
                      )}
                      {type === 'income' && <div className="mr-3 text-teal-500"><TrendingUp size={24}/></div>}
                      
                      <div 
                        className="cursor-pointer flex items-center" 
                        onClick={() => {
                            setCategoryForm({ 
                                major: cat, 
                                subs: [...categories[cat].subs], 
                                includeInBudget: categories[cat].includeInBudget,
                                newSub: '',
                                type: type,
                                icon: categories[cat].icon || 'Circle'
                            });
                            setIsCategoryModalOpen(true);
                        }}
                      >
                          <div className="flex items-center">
                              <div className="scale-75 -ml-1">{getIcon(cat, categories)}</div>
                              <span className={`font-bold ${categories[cat].includeInBudget || type==='income' ? 'text-gray-700' : 'text-gray-400'}`}>{cat}</span>
                          </div>
                          {categories[cat].subs.length > 0 && (
                              <div className="text-xs text-gray-400 ml-8 -mt-1 truncate max-w-[150px]">
                                  {categories[cat].subs.join(', ')}
                              </div>
                          )}
                      </div>
                  </div>
                  <div className="flex items-center space-x-1">
                      <button className="p-2 text-gray-300 hover:text-gray-500" onClick={() => {
                          setCategoryForm({ 
                              major: cat, 
                              subs: [...categories[cat].subs], 
                              includeInBudget: categories[cat].includeInBudget,
                              newSub: '',
                              type: type,
                              icon: categories[cat].icon || 'Circle'
                          });
                          setIsCategoryModalOpen(true);
                      }}>
                          <Edit3 size={16}/>
                      </button>
                      <button className="p-2 text-rose-300 hover:text-rose-500" onClick={() => handleDeleteCategory(cat, type)}>
                          <Trash2 size={16}/>
                      </button>
                  </div>
              </div>
          ))}
          <button 
            onClick={() => { 
                setCategoryForm({ major: '', subs: [], includeInBudget: true, newSub: '', type: type, icon: 'Circle' }); 
                setIsCategoryModalOpen(true); 
            }}
            className="w-full py-3 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-bold flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
              <Plus size={20} className="mr-1"/> 新增類別
          </button>
      </div>
  );

  return (
    <div className="relative w-full h-dvh max-w-md mx-auto bg-orange-50 overflow-hidden flex flex-col font-sans text-gray-700">
      
      {/* 1. 明細頁 (Fixed Header) */}
      {currentView === 'daily' && (
        <div className="flex flex-col h-full">
          <div className="flex-none px-6 pt-6 pb-2 bg-white rounded-b-3xl shadow-sm z-20">
             <div className="flex justify-between items-center mb-4">
               <button onClick={() => changeMonth(-1)} className="p-2 bg-orange-100 rounded-full text-orange-600 hover:bg-orange-200"><ChevronLeft size={20}/></button>
               <div className="flex flex-col items-center">
                 <span className="text-2xl font-bold text-gray-800">{currentDate.getFullYear()}</span>
                 <span className="text-sm font-bold text-orange-500 bg-orange-100 px-3 py-1 rounded-full mt-1">{currentDate.getMonth() + 1} 月</span>
               </div>
               <button onClick={() => changeMonth(1)} className="p-2 bg-orange-100 rounded-full text-orange-600 hover:bg-orange-200"><ChevronRight size={20}/></button>
             </div>
             <div className="bg-orange-50 p-4 rounded-2xl flex justify-between shadow-inner">
               <div className="flex flex-col items-center flex-1 border-r border-orange-200">
                 <span className="text-xs text-gray-400">收入</span>
                 <span className="text-lg font-bold text-teal-500">{formatMoney(dailySummary.income)}</span>
               </div>
               <div className="flex flex-col items-center flex-1 border-r border-orange-200">
                 <span className="text-xs text-gray-400">支出</span>
                 <span className="text-lg font-bold text-rose-500">{formatMoney(dailySummary.expense)}</span>
               </div>
               <div className="flex flex-col items-center flex-1">
                 <span className="text-xs text-gray-400">結餘</span>
                 <span className="text-lg font-bold text-gray-700">{formatMoney(dailySummary.total)}</span>
               </div>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-24">
             {(!user) && <div className="text-center text-gray-400 mt-10">請先至「設定」頁面登入</div>}
             {user && Object.keys(groupedByDate).length === 0 && <div className="text-center text-gray-400 mt-10">本月沒有記錄 (´• ω •`)</div>}
             {Object.keys(groupedByDate).map(dateStr => (
               <div key={dateStr} className="animate-in slide-in-from-bottom-2 duration-500">
                 <div className="flex items-center space-x-2 mb-2 px-2">
                    <span className="font-bold text-gray-600 text-lg">{new Date(dateStr).getDate()}</span>
                    <span className="text-xs text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-100">
                        {['週日','週一','週二','週三','週四','週五','週六'][new Date(dateStr).getDay()]}
                    </span>
                 </div>
                 <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
                   {groupedByDate[dateStr].map((t, idx) => (
                     <div key={t.id} onClick={() => handleOpenEdit(t)} className={`flex items-center p-3 hover:bg-orange-50 cursor-pointer ${idx !== groupedByDate[dateStr].length -1 ? 'border-b border-gray-50' : ''}`}>
                       <div className="mr-3">{getIcon(t.majorCategory, t.type === 'expense' ? expenseCategories : incomeCategories)}</div>
                       <div className="flex-1">
                         <div className="flex items-center">
                            <span className="font-bold text-gray-700">{t.majorCategory}</span>
                            {t.hasSub && t.category !== t.majorCategory && (
                                <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">{t.category}</span>
                            )}
                            {t.type === 'expense' && !t.includeInBudget && (
                                <span className="ml-2 text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded">不計預算</span>
                            )}
                         </div>
                         <div className="text-xs text-gray-400">{t.note}</div>
                       </div>
                       <div className={`font-bold ${t.type === 'income' ? 'text-teal-500' : 'text-rose-500'}`}>
                         {t.type === 'income' ? '+' : ''}{formatMoney(t.amount)}
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             ))}
          </div>
        </div>
      )}

      {/* 2. 預算頁 */}
      {currentView === 'budget' && (
        <div className="flex flex-col h-full">
          <div className="flex-none px-6 pt-6 pb-4 bg-white rounded-b-3xl shadow-sm z-10">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => changeMonth(-1)} className="p-2 text-gray-400"><ChevronLeft/></button>
                <div className="text-center">
                    <span className="text-gray-800 font-bold text-lg">{currentDate.getFullYear()}年 {currentDate.getMonth()+1}月</span>
                </div>
                <button onClick={() => changeMonth(1)} className="p-2 text-gray-400"><ChevronRight/></button>
            </div>
            
            <div className="relative h-56 flex items-center justify-center">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={[{value: budgetStatus.totalActual}, {value: Math.max(0, budgetStatus.totalBudget - budgetStatus.totalActual)}]}
                            cx="50%" cy="50%" innerRadius={70} outerRadius={90} startAngle={90} endAngle={-270}
                            dataKey="value" stroke="none"
                        >
                            <Cell fill={budgetStatus.percent > 100 ? '#F43F5E' : '#34D399'} />
                            <Cell fill="#F3F4F6" />
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center pointer-events-none">
                    <div className="flex items-center text-sm text-gray-400 cursor-pointer pointer-events-auto" onClick={openBudgetEditModal}>
                        <span>每月預算 {formatMoney(budgetStatus.totalBudget)}</span>
                        <Edit3 size={12} className="ml-1"/>
                    </div>
                    <div className="flex flex-col items-center my-1">
                        <span className={`text-4xl font-bold ${budgetStatus.percent > 100 ? 'text-rose-500' : 'text-gray-800'}`}>
                            {formatMoney(Math.max(0, budgetStatus.remaining))}
                        </span>
                        <span className="text-xs text-gray-400">剩餘額度</span>
                    </div>
                </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 pb-24">
             <div className="grid grid-cols-2 gap-4 mb-6">
                 <div className="bg-white p-4 rounded-2xl shadow-sm flex flex-col items-center">
                     <span className="text-gray-400 text-xs mb-1">已支出</span>
                     <span className="text-rose-500 text-xl font-bold">{formatMoney(budgetStatus.totalActual)}</span>
                 </div>
                 <div className="bg-white p-4 rounded-2xl shadow-sm flex flex-col items-center">
                     <span className="text-gray-400 text-xs mb-1">平均每日可用</span>
                     <span className={`text-xl font-bold ${budgetStatus.dailyAverage < 200 ? 'text-rose-500' : 'text-teal-500'}`}>
                         {formatMoney(budgetStatus.dailyAverage)}
                     </span>
                 </div>
             </div>

             <div className="flex justify-between items-end mb-3">
                 <h3 className="font-bold text-gray-700">預算內消費排行</h3>
                 <button onClick={() => setCurrentView('settings')} className="text-xs text-orange-500 underline">設定</button>
             </div>
             
             <div className="space-y-3">
                 {budgetStatus.includedList.map((item, idx) => (
                     <div key={idx} className="bg-white p-3 rounded-2xl shadow-sm cursor-pointer hover:bg-orange-50 transition-colors" onClick={() => handleGoToDetail(item.name, 'expense')}>
                         <div className="flex items-center mb-1">
                             <div className="w-2 h-8 rounded-full mr-3" style={{ backgroundColor: PASTEL_COLORS[idx % PASTEL_COLORS.length] }}></div>
                             <div className="flex-1">
                                 <div className="flex justify-between items-center">
                                     <span className="font-bold text-gray-700">{item.name}</span>
                                     <div className="flex items-center">
                                         <span className="text-xs text-gray-400 mr-2">{(item.ratio * 100).toFixed(1)}%</span>
                                         <span className="font-bold text-gray-800">{formatMoney(item.value)}</span>
                                     </div>
                                 </div>
                                 <div className="w-full bg-gray-100 h-1.5 rounded-full mt-1 overflow-hidden">
                                     <div className="h-full" style={{ width: `${item.ratio * 100}%`, backgroundColor: PASTEL_COLORS[idx % PASTEL_COLORS.length] }}></div>
                                 </div>
                             </div>
                         </div>
                         {item.subs.length > 0 && (
                             <div className="pl-5 mt-2 space-y-1">
                                 {item.subs.map((sub, sIdx) => (
                                     <div key={sIdx} className="flex justify-between text-sm text-gray-500">
                                         <span>• {sub.name}</span>
                                         <div className="flex items-center">
                                             <span className="text-[10px] text-gray-300 mr-2">
                                                 {item.value > 0 ? Math.round((sub.value / item.value) * 100) : 0}%
                                             </span>
                                             <span>{formatMoney(sub.value)}</span>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                         )}
                     </div>
                 ))}
             </div>
          </div>
        </div>
      )}

      {/* 3. 設定頁 (Settings) */}
      {currentView === 'settings' && (
        <div className="flex flex-col h-full bg-white">
          <div className="flex-none px-6 pt-8 pb-4 border-b border-gray-100">
              <h1 className="text-2xl font-bold text-gray-800">設定</h1>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-24">
              {/* 帳號管理 */}
              <section>
                  <h2 className="text-lg font-bold text-gray-700 mb-3 flex items-center"><User size={20} className="mr-2 text-purple-400"/> 帳號</h2>
                  <div className="bg-purple-50 p-4 rounded-3xl border border-purple-100">
                      {user ? (
                          <div className="flex flex-col items-center">
                              <p className="text-purple-600 font-bold mb-3">已登入：{user.email || '匿名使用者'}</p>
                              <button onClick={handleLogout} className="flex items-center bg-purple-200 text-purple-700 px-4 py-2 rounded-xl hover:bg-purple-300 transition-colors">
                                  <LogOut size={18} className="mr-2"/> 登出
                              </button>
                          </div>
                      ) : (
                          <div className="flex flex-col items-center">
                              <p className="text-gray-500 mb-3 text-sm text-center">登入以啟用雲端同步與跨裝置存取</p>
                              <button onClick={handleGoogleLogin} className="flex items-center bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl shadow-sm hover:bg-gray-50 transition-colors">
                                  <LogIn size={18} className="mr-2"/> Google 登入
                              </button>
                          </div>
                      )}
                  </div>
              </section>

              {/* 匯入功能 */}
              <section>
                  <h2 className="text-lg font-bold text-gray-700 mb-3 flex items-center"><FileText size={20} className="mr-2 text-blue-400"/> 資料匯入</h2>
                  <div className="bg-blue-50 p-4 rounded-3xl border border-blue-100">
                      <label className="flex flex-col items-center justify-center h-24 border-2 border-blue-200 border-dashed rounded-2xl cursor-pointer hover:bg-blue-100 transition-colors">
                          <Upload className="text-blue-400 mb-1"/>
                          <span className="text-sm text-blue-500 font-bold">點此選擇 CSV 檔案</span>
                          <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                      </label>
                      <p className="text-xs text-blue-300 mt-2 text-center">將資料匯入雲端資料庫</p>
                  </div>
              </section>

              {/* 每月預算設定 */}
              <section>
                  <h2 className="text-lg font-bold text-gray-700 mb-3 flex items-center"><Coins size={20} className="mr-2 text-yellow-400"/> 通用每月預算</h2>
                  <div className="bg-yellow-50 p-4 rounded-3xl border border-yellow-100 flex items-center justify-between">
                      <div className="text-yellow-600 font-bold">預設目標</div>
                      <div className="flex items-center bg-white px-3 py-2 rounded-xl border border-yellow-200">
                          <span className="text-yellow-400 mr-2">$</span>
                          <input 
                            type="number" 
                            inputMode="decimal"
                            pattern="[0-9]*"
                            className="bg-transparent text-right font-bold text-gray-700 outline-none w-24"
                            value={defaultBudget}
                            onChange={(e) => updateDefaultBudget(e.target.value)}
                          />
                      </div>
                  </div>
              </section>

              {/* 支出類別 */}
              <section>
                  <h2 className="text-lg font-bold text-gray-700 mb-3 flex items-center"><CheckCircle2 size={20} className="mr-2 text-orange-400"/> 支出類別</h2>
                  <p className="text-xs text-gray-400 mb-2">可開關是否預設計入預算</p>
                  {renderCategorySettings(expenseCategories, 'expense')}
              </section>

              {/* 收入類別 */}
              <section>
                  <h2 className="text-lg font-bold text-gray-700 mb-3 flex items-center"><TrendingUp size={20} className="mr-2 text-teal-400"/> 收入類別</h2>
                  {renderCategorySettings(incomeCategories, 'income')}
              </section>

              {/* 版本號 (設定頁最下方) */}
              <div className="text-center text-gray-300 text-xs pt-8 pb-4 font-mono">v2.6</div>
          </div>
        </div>
      )}

      {/* 4. 統計頁 (Stats) */}
      {currentView === 'stats' && (
        <div className="flex flex-col h-full">
          <div className="flex-none px-6 pt-6 pb-2 bg-white rounded-b-3xl shadow-sm z-10">
            <div className="flex items-center justify-between mb-4">
                <button onClick={() => statsRange === 'month' ? changeMonth(-1) : (statsRange === 'year' ? changeYear(-1) : null)} className={`text-gray-400 ${statsRange === 'all' && 'opacity-0 pointer-events-none'}`}><ChevronLeft/></button>
                <div className="flex flex-col items-center">
                    <div className="flex bg-gray-100 rounded-full p-1 mb-2">
                        <button onClick={() => setStatsType('expense')} className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${statsType === 'expense' ? 'bg-white text-rose-500 shadow' : 'text-gray-400'}`}>支出</button>
                        <button onClick={() => setStatsType('income')} className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${statsType === 'income' ? 'bg-white text-teal-500 shadow' : 'text-gray-400'}`}>收入</button>
                    </div>
                    <div className="flex space-x-2">
                        <button onClick={() => setStatsRange('year')} className={`px-3 py-0.5 rounded-full text-xs font-bold transition-all ${statsRange === 'year' ? 'text-gray-800 bg-gray-100' : 'text-gray-400'}`}>年</button>
                        <button onClick={() => setStatsRange('month')} className={`px-3 py-0.5 rounded-full text-xs font-bold transition-all ${statsRange === 'month' ? 'text-gray-800 bg-gray-100' : 'text-gray-400'}`}>月</button>
                        <button onClick={() => setStatsRange('all')} className={`px-3 py-0.5 rounded-full text-xs font-bold transition-all ${statsRange === 'all' ? 'text-gray-800 bg-gray-100' : 'text-gray-400'}`}>全部</button>
                    </div>
                </div>
                <button onClick={() => statsRange === 'month' ? changeMonth(1) : (statsRange === 'year' ? changeYear(1) : null)} className={`text-gray-400 ${statsRange === 'all' && 'opacity-0 pointer-events-none'}`}><ChevronRight/></button>
            </div>
            
            <div className="text-center mb-2 font-bold text-gray-700 text-lg">
                {statsRange === 'all' ? '全部期間' : `${currentDate.getFullYear()}年 ${statsRange === 'month' ? `${currentDate.getMonth()+1}月` : ''}`} 總{statsType === 'expense' ? '支出' : '收入'}: {formatMoney(statsData.total)}
            </div>
            
            <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={statsData.chartData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value">
                            {statsData.chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={PASTEL_COLORS[index % PASTEL_COLORS.length]} stroke="none" />)}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-24">
             {statsData.chartData.map((item, idx) => (
                 <div key={idx} className="bg-white p-3 rounded-2xl shadow-sm cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => handleGoToDetail(item.name, statsType)}>
                     <div className="flex items-center mb-1">
                         <div className="w-2 h-8 rounded-full mr-3" style={{ backgroundColor: PASTEL_COLORS[idx % PASTEL_COLORS.length] }}></div>
                         <div className="flex-1">
                             <div className="flex justify-between items-center">
                                 <span className="font-bold text-gray-700 text-lg">{item.name}</span>
                                 <div className="flex items-center">
                                     <span className="text-xs text-gray-400 mr-2">{(item.ratio * 100).toFixed(1)}%</span>
                                     <span className="font-bold text-gray-800">{formatMoney(item.value)}</span>
                                 </div>
                             </div>
                             <div className="w-full bg-gray-100 h-1.5 rounded-full mt-1 overflow-hidden">
                                 <div className="h-full" style={{ width: `${item.ratio * 100}%`, backgroundColor: PASTEL_COLORS[idx % PASTEL_COLORS.length] }}></div>
                             </div>
                         </div>
                     </div>
                     {item.subs.length > 0 && item.subs[0].name !== '其他' && (
                         <div className="pl-5 mt-2 space-y-1">
                             {item.subs.map((sub, sIdx) => (
                                 <div key={sIdx} className="flex justify-between text-sm text-gray-500">
                                     <span>• {sub.name}</span>
                                     <span>{formatMoney(sub.value)}</span>
                                 </div>
                             ))}
                         </div>
                     )}
                 </div>
             ))}
          </div>
        </div>
      )}

      {/* 5. 類別詳細頁面 (Category Detail) */}
      {currentView === 'categoryDetail' && (
          <div className="flex flex-col h-full animate-in slide-in-from-right duration-300 bg-gray-50">
              <div className="flex-none px-6 pt-6 pb-4 bg-white rounded-b-3xl shadow-sm z-10 flex items-center">
                  <button onClick={() => setCurrentView(detailConfig.parentView)} className="p-2 mr-4 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200">
                      <ArrowLeft size={20}/>
                  </button>
                  <div>
                      <h2 className="text-xl font-bold text-gray-800">{detailConfig.category}</h2>
                      <p className="text-xs text-gray-400">
                          {detailConfig.range === 'all' ? '全部期間' : (
                              detailConfig.range === 'year' ? `${currentDate.getFullYear()}年 全年` : `${currentDate.getFullYear()}年 ${currentDate.getMonth()+1}月`
                          )} 
                          明細
                      </p>
                  </div>
              </div>
              
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-24">
                  {Object.keys(groupedByDate).map(dateStr => {
                      const dayTrans = groupedByDate[dateStr].filter(t => {
                          const sameYear = t.date.getFullYear() === currentDate.getFullYear();
                          const sameMonth = t.date.getMonth() === currentDate.getMonth();
                          
                          let dateMatch = false;
                          if (detailConfig.range === 'all') dateMatch = true;
                          else if (detailConfig.range === 'year') dateMatch = sameYear;
                          else dateMatch = (sameYear && sameMonth);

                          return dateMatch && t.majorCategory === detailConfig.category && t.type === detailConfig.type;
                      });
                      
                      if (dayTrans.length === 0) return null;
                      
                      return (
                          <div key={dateStr}>
                              <div className="px-2 mb-2 text-xs text-gray-400">{dateStr}</div>
                              <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
                                  {dayTrans.map((t, idx) => (
                                      <div key={t.id} onClick={() => handleOpenEdit(t)} className={`flex items-center p-3 hover:bg-orange-50 cursor-pointer ${idx !== dayTrans.length -1 ? 'border-b border-gray-50' : ''}`}>
                                          <div className="mr-3">{getIcon(t.majorCategory)}</div>
                                          <div className="flex-1">
                                              <div className="flex items-center">
                                                  <span className="font-bold text-gray-700">{t.majorCategory}</span>
                                                  {t.hasSub && t.category !== t.majorCategory && (
                                                      <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">{t.category}</span>
                                                  )}
                                              </div>
                                              <div className="text-xs text-gray-400">{t.note}</div>
                                          </div>
                                          <div className={`font-bold ${t.type === 'income' ? 'text-teal-500' : 'text-rose-500'}`}>
                                              {formatMoney(t.amount)}
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      )
                  })}
                  {filteredTransactions.length === 0 && (
                      <div className="text-center text-gray-400 mt-10">無相關記錄</div>
                  )}
              </div>
          </div>
      )}

      {/* FAB */}
      {currentView !== 'categoryDetail' && (
          <button onClick={handleOpenAdd} className="absolute bottom-24 right-6 z-50 bg-gray-800 text-white rounded-[2rem] p-4 shadow-xl hover:scale-105 transition-transform border-4 border-orange-50">
              <Plus size={32} />
          </button>
      )}

      {/* 底部導航 */}
      {currentView !== 'categoryDetail' && (
          <div className="absolute bottom-6 left-6 right-6 h-16 bg-white rounded-[2rem] shadow-2xl flex justify-around items-center z-40 border border-gray-50">
              {['daily', 'budget', 'stats', 'settings'].map(view => (
                  <button key={view} onClick={() => setCurrentView(view)} className={`flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all ${currentView === view ? 'bg-orange-100 text-orange-500' : 'text-gray-300'}`}>
                      {view === 'daily' && <Calendar size={24} />}
                      {view === 'budget' && <CreditCard size={24} />}
                      {view === 'stats' && <PieChartIcon size={24} />}
                      {view === 'settings' && <Settings size={24} />}
                  </button>
              ))}
          </div>
      )}

      {/* 預算編輯 Modal */}
      {isBudgetEditOpen && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">設定本月預算</h3>
                  <p className="text-sm text-gray-400 mb-6">{currentDate.getFullYear()}年 {currentDate.getMonth()+1}月</p>
                  
                  <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 mb-6 flex items-center">
                      <span className="text-orange-400 mr-2 text-xl font-bold">$</span>
                      <input 
                        type="number" 
                        inputMode="decimal"
                        pattern="[0-9]*"
                        className="bg-transparent text-2xl font-bold text-gray-800 w-full outline-none"
                        value={tempBudget}
                        onChange={(e) => setTempBudget(e.target.value)}
                        autoFocus
                      />
                  </div>

                  <div className="flex space-x-3">
                      <button onClick={() => setIsBudgetEditOpen(false)} className="flex-1 py-3 text-gray-500 font-bold bg-gray-100 rounded-xl">取消</button>
                      <button onClick={saveSpecificMonthBudget} className="flex-1 py-3 text-white font-bold bg-orange-500 rounded-xl shadow-lg shadow-orange-200">確認</button>
                  </div>
              </div>
          </div>
      )}

      {/* 記帳 Modal */}
      {isModalOpen && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-[100] flex justify-end flex-col">
            <div className="bg-white rounded-t-[2.5rem] h-[85vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300 overflow-hidden">
                {/* Modal Header - Fixed */}
                <div className="flex-none flex justify-between items-center mb-4 p-6 pb-2">
                    <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-500"><X size={20}/></button>
                    {/* 收入/支出切換 Toggle */}
                    <div className="flex bg-gray-100 p-1 rounded-full">
                        <button 
                            onClick={() => { setFormData({...formData, type: 'expense', majorCategory: '飲食', subCategory: '', includeInBudget: true}); setIsCategorySelectorOpen(false); }}
                            className={`px-6 py-1.5 rounded-full text-sm font-bold transition-all ${formData.type === 'expense' ? 'bg-white shadow text-rose-500' : 'text-gray-400'}`}
                        >
                            支出
                        </button>
                        <button 
                            onClick={() => { setFormData({...formData, type: 'income', majorCategory: '', subCategory: ''}); setIsCategorySelectorOpen(false); }}
                            className={`px-6 py-1.5 rounded-full text-sm font-bold transition-all ${formData.type === 'income' ? 'bg-white shadow text-teal-500' : 'text-gray-400'}`}
                        >
                            收入
                        </button>
                    </div>
                    {/* 儲存按鈕 */}
                    <button 
                        onClick={handleSaveTransaction} 
                        disabled={!formData.amount}
                        className={`px-6 py-2 text-white rounded-full font-bold transition-all ${formData.amount ? 'bg-gray-800' : 'bg-gray-300 cursor-not-allowed'}`}
                    >
                        儲存
                    </button>
                </div>

                {/* Input Area - Scrollable */}
                <div className="flex-1 overflow-y-auto space-y-4 px-6 pb-10">
                    <div className="bg-orange-50 rounded-3xl p-6 mb-2 flex flex-col items-center justify-center border border-orange-100">
                        <span className="text-gray-400 text-sm font-bold mb-1">金額</span>
                        <div className="flex items-center">
                            <span className="text-3xl text-orange-300 mr-2 font-bold">$</span>
                            <input 
                                type="number" 
                                inputMode="decimal"
                                pattern="[0-9]*"
                                className="bg-transparent text-5xl font-bold text-gray-800 w-48 text-center outline-none" 
                                placeholder="0" 
                                value={formData.amount} 
                                onChange={(e) => setFormData({...formData, amount: e.target.value})} 
                            />
                        </div>
                    </div>

                    <div className="bg-white border border-gray-100 rounded-2xl p-2 flex items-center">
                        <div className="p-3 bg-blue-50 text-blue-400 rounded-xl mr-3"><Calendar size={20}/></div>
                        <input type="date" className="flex-1 outline-none text-gray-700 font-bold bg-transparent" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                    </div>

                    {/* 大分類選擇器 */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-2 flex items-center relative cursor-pointer" onClick={() => setIsCategorySelectorOpen(!isCategorySelectorOpen)}>
                        <div className="p-3 bg-purple-50 text-purple-400 rounded-xl mr-3"><CheckCircle2 size={20}/></div>
                        <div className="flex-1 font-bold text-gray-700">{formData.majorCategory || (formData.type === 'expense' ? "選擇支出分類" : "選擇收入分類")}</div>
                        <ChevronDown className="text-gray-400 mr-2" size={16}/>
                    </div>
                    
                    {/* 自定義類別選擇面板 */}
                    {isCategorySelectorOpen && (
                        <div className="bg-gray-50 rounded-2xl p-4 grid grid-cols-4 gap-3 animate-in fade-in zoom-in-95 duration-200">
                            {Object.keys(getCurrentCategorySettings()).map(cat => (
                                <button 
                                    key={cat}
                                    onClick={() => handleSelectMajorCategory(cat)}
                                    className={`flex flex-col items-center p-2 rounded-xl transition-colors ${formData.majorCategory === cat ? 'bg-orange-100 ring-2 ring-orange-200' : 'bg-white'}`}
                                >
                                    <div className="scale-75 mb-1">{getIcon(cat, getCurrentCategorySettings())}</div>
                                    <span className="text-[10px] font-bold text-gray-600 truncate w-full text-center">{cat}</span>
                                </button>
                            ))}
                            <button onClick={() => { setIsModalOpen(false); setCurrentView('settings'); }} className="flex flex-col items-center p-2 rounded-xl bg-white border border-dashed border-gray-300">
                                <PlusCircle className="text-gray-400 mb-1" size={24} />
                                <span className="text-[10px] font-bold text-gray-400">新增</span>
                            </button>
                        </div>
                    )}

                    {/* 子分類選擇器 (條件顯示) */}
                    {shouldShowSubCategory && (
                        <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                            <div className="bg-white border border-gray-100 rounded-2xl p-2 flex items-center cursor-pointer mb-2" onClick={() => setIsSubCategorySelectorOpen(!isSubCategorySelectorOpen)}>
                                <div className="p-3 bg-pink-50 text-pink-400 rounded-xl mr-3"><GripVertical size={20}/></div>
                                <div className="flex-1 font-bold text-gray-700">{formData.subCategory || "選擇子項目"}</div>
                                <ChevronDown className="text-gray-400 mr-2" size={16}/>
                            </div>
                            
                            {isSubCategorySelectorOpen && (
                                <div className="bg-gray-50 rounded-2xl p-4 grid grid-cols-3 gap-2 mb-2">
                                    {getCurrentCategorySettings()[formData.majorCategory]?.subs.map((s, i) => (
                                        <button 
                                            key={i} 
                                            onClick={() => {
                                                setFormData({...formData, subCategory: s});
                                                setIsSubCategorySelectorOpen(false);
                                            }}
                                            className={`p-2 rounded-xl text-xs font-bold text-center transition-colors ${formData.subCategory === s ? 'bg-orange-200 text-orange-800' : 'bg-white text-gray-600 border border-gray-100'}`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* 單筆列入預算開關 (僅支出) */}
                    {formData.type === 'expense' && (
                        <div className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl p-3 px-4">
                            <span className="font-bold text-gray-600 text-sm">此筆列入預算</span>
                            <button 
                                onClick={() => setFormData({...formData, includeInBudget: !formData.includeInBudget})}
                                className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 flex items-center ${formData.includeInBudget ? 'bg-orange-400 justify-end' : 'bg-gray-200 justify-start'}`}
                            >
                                <div className="bg-white w-5 h-5 rounded-full shadow-sm"></div>
                            </button>
                        </div>
                    )}

                    <div className="bg-white border border-gray-100 rounded-2xl p-2 flex items-center">
                        <div className="p-3 bg-yellow-50 text-yellow-400 rounded-xl mr-3"><Edit3 size={20}/></div>
                        <input type="text" placeholder="備註..." className="flex-1 outline-none text-gray-700 font-bold bg-transparent" value={formData.note} onChange={(e) => setFormData({...formData, note: e.target.value})} />
                    </div>
                </div>
                
                {/* 刪除按鈕 */}
                {editingId && (
                    <button 
                        onClick={handleDeleteClick} 
                        className={`mt-4 w-full py-4 font-bold rounded-2xl flex items-center justify-center border transition-all ${isDeleteConfirming ? 'bg-rose-500 text-white border-rose-600' : 'text-rose-500 bg-rose-50 border-rose-100 hover:bg-rose-100'}`}
                    >
                        <Trash2 size={20} className="mr-2"/> 
                        {isDeleteConfirming ? "再次點擊以確認刪除" : "刪除這筆記錄"}
                    </button>
                )}
            </div>
        </div>
      )}

      {/* 類別設定 Modal */}
      {isCategoryModalOpen && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[80vh]">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex-none">{categoryForm.major ? '編輯類別' : '新增類別'}</h3>
                  
                  <div className="space-y-4 mb-6 flex-1 overflow-y-auto">
                      {!categoryForm.major && (
                          <div className="flex bg-gray-100 p-1 rounded-xl mb-2">
                              <button onClick={() => setCategoryForm({...categoryForm, type: 'expense'})} className={`flex-1 py-2 rounded-lg text-sm font-bold ${categoryForm.type === 'expense' ? 'bg-white shadow text-rose-500' : 'text-gray-400'}`}>支出</button>
                              <button onClick={() => setCategoryForm({...categoryForm, type: 'income'})} className={`flex-1 py-2 rounded-lg text-sm font-bold ${categoryForm.type === 'income' ? 'bg-white shadow text-teal-500' : 'text-gray-400'}`}>收入</button>
                          </div>
                      )}

                      <div>
                          <label className="text-xs text-gray-400 block mb-1">大類別名稱</label>
                          <input 
                            type="text" 
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 outline-none font-bold text-gray-700"
                            value={categoryForm.major}
                            onChange={(e) => setCategoryForm({...categoryForm, major: e.target.value})}
                            placeholder="例如: 飲食"
                            disabled={!!(categoryForm.type === 'expense' ? expenseCategories[categoryForm.major] : incomeCategories[categoryForm.major])} 
                          />
                      </div>

                      {/* 圖示選擇器 */}
                      <div>
                          <label className="text-xs text-gray-400 block mb-2">選擇圖示</label>
                          <div className="flex items-center justify-between bg-gray-50 p-2 rounded-xl border border-gray-100 mb-2 cursor-pointer" onClick={() => setIsIconSelectorOpen(!isIconSelectorOpen)}>
                              <div className="flex items-center">
                                  <div className="scale-75 mr-2">{getIconComponent(categoryForm.icon)}</div>
                                  <span className="text-sm font-bold text-gray-600">當前圖示</span>
                              </div>
                              <ChevronDown size={16} className="text-gray-400"/>
                          </div>
                          
                          {isIconSelectorOpen && (
                              <div className="grid grid-cols-5 gap-2 bg-gray-50 p-2 rounded-xl border border-gray-100 max-h-32 overflow-y-auto">
                                  {Object.keys(AVAILABLE_ICONS).map(iconName => (
                                      <div 
                                        key={iconName} 
                                        onClick={() => { setCategoryForm({...categoryForm, icon: iconName}); setIsIconSelectorOpen(false); }}
                                        className={`p-1 rounded-lg cursor-pointer flex justify-center ${categoryForm.icon === iconName ? 'bg-orange-100 ring-1 ring-orange-300' : ''}`}
                                      >
                                          <div className="scale-75">{getIconComponent(iconName)}</div>
                                      </div>
                                  ))}
                              </div>
                          )}
                      </div>
                      
                      <div>
                          <label className="text-xs text-gray-400 block mb-2">子項目管理</label>
                          <div className="flex flex-wrap gap-2 mb-2">
                              {categoryForm.subs.map((sub, idx) => (
                                  <span key={idx} className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600 flex items-center">
                                      {sub}
                                      <button onClick={() => handleRemoveSubCategory(sub)} className="ml-2 text-gray-400 hover:text-rose-500"><X size={14}/></button>
                                  </span>
                              ))}
                          </div>
                          <div className="flex space-x-2">
                              <input 
                                type="text" 
                                className="flex-1 bg-gray-50 border border-gray-100 rounded-xl p-2 px-3 outline-none text-sm"
                                value={categoryForm.newSub}
                                onChange={(e) => setCategoryForm({...categoryForm, newSub: e.target.value})}
                                placeholder="輸入子項目名稱"
                              />
                              <button onClick={handleAddSubCategory} className="bg-orange-400 text-white rounded-xl p-2"><Plus size={20}/></button>
                          </div>
                      </div>

                      {categoryForm.type === 'expense' && (
                          <div className="flex items-center justify-between bg-orange-50 p-3 rounded-xl">
                              <span className="text-sm font-bold text-orange-600">列入預算計算 (預設)</span>
                              <button 
                                onClick={() => setCategoryForm({...categoryForm, includeInBudget: !categoryForm.includeInBudget})}
                                className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 flex items-center ${categoryForm.includeInBudget ? 'bg-orange-400 justify-end' : 'bg-gray-200 justify-start'}`}
                              >
                                 <div className="bg-white w-5 h-5 rounded-full shadow-sm"></div>
                              </button>
                          </div>
                      )}
                  </div>

                  <div className="flex space-x-3 flex-none">
                      <button onClick={() => setIsCategoryModalOpen(false)} className="flex-1 py-3 text-gray-500 font-bold bg-gray-100 rounded-xl">取消</button>
                      <button onClick={handleSaveCategory} className="flex-1 py-3 text-white font-bold bg-gray-800 rounded-xl">確認</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}