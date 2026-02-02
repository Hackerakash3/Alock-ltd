import React from 'react';
import { 
  Home, 
  ShoppingCart, 
  Utensils, 
  Car, 
  Smartphone, 
  Zap, 
  HeartPulse, 
  GraduationCap, 
  DollarSign, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Wallet,
  Settings,
  PieChart,
  History,
  ShieldCheck,
  User,
  Sparkles,
  Shirt,
  Briefcase,
  Gift,
  Coffee
} from 'lucide-react';

export const APP_NAME = "ALOCK LTD";
export const CURRENCY = "৳";
export const CONTACT_PHONE = "01913809897";
export const CONTACT_EMAIL = "alockltd@gmail.com";

export const COLORS = {
  primary: '#2563eb', // Blue 600
  secondary: '#7c3aed', // Violet 600
  success: '#10b981', // Emerald 500
  danger: '#ef4444', // Red 500
  warning: '#f59e0b', // Amber 500
  gold: '#D4AF37',   // Classic Gold
  goldLight: '#F3E5AB',
  dark: '#0f172a',
  slate: {
    900: '#0f172a',
    950: '#020617',
  }
};

export const DEFAULT_CATEGORIES = [
  { id: 'cat1', name: 'Food', nameBn: 'খাবার', icon: 'Utensils', createdBy: 'system' },
  { id: 'cat2', name: 'Shopping', nameBn: 'কেনাকাটা', icon: 'ShoppingCart', createdBy: 'system' },
  { id: 'cat3', name: 'Transport', nameBn: 'যাতায়াত', icon: 'Car', createdBy: 'system' },
  { id: 'cat4', name: 'Rent', nameBn: 'ভাড়া', icon: 'Home', createdBy: 'system' },
  { id: 'cat5', name: 'Utilities', nameBn: 'ইউটিলিটি', icon: 'Zap', createdBy: 'system' },
  { id: 'cat6', name: 'Health', nameBn: 'স্বাস্থ্য', icon: 'HeartPulse', createdBy: 'system' },
  { id: 'cat7', name: 'Education', nameBn: 'শিক্ষা', icon: 'GraduationCap', createdBy: 'system' },
  { id: 'cat8', name: 'Mobile', nameBn: 'মোবাইল বিল', icon: 'Smartphone', createdBy: 'system' },
  { id: 'cat9', name: 'Salary', nameBn: 'বেতন', icon: 'Briefcase', createdBy: 'system' },
  { id: 'cat10', name: 'Business', nameBn: 'ব্যবসা', icon: 'DollarSign', createdBy: 'system' },
];

export const WALLETS = ['Cash', 'Bank', 'bKash', 'Nagad'];

export const TRANSLATIONS = {
  EN: {
    dashboard: "Dashboard",
    history: "History",
    add: "Add Entry",
    admin: "Admin Console",
    profile: "Account",
    aiAdvice: "AI Insights",
    balance: "Balance",
    income: "Income",
    expense: "Expense",
    category: "Category",
    wallet: "Wallet",
    note: "Transaction Details",
    date: "Date",
    amount: "Amount (BDT)",
    save: "Confirm Transaction",
    transactions: "Recent Transactions",
    allCategories: "All Categories",
    totalBalance: "Net Worth",
    monthlySummary: "Monthly Growth",
    recentActivity: "Recent Ledger",
    getPremium: "Unlock Executive Pro",
    bKashPayment: "Checkout with bKash",
    nagadPayment: "Checkout with Nagad",
    bKashNote: "Send payment to 01913809897",
    aiGreeting: "Describe your spend: 'Spent 1500 for grocery at Unimart'",
    aiCategorize: "AI Smart Processing",
    premiumFeature: "Executive Pro Feature",
  },
  BN: {
    dashboard: "ড্যাশবোর্ড",
    history: "ইতিহাস",
    add: "হিসাব যোগ",
    admin: "এডমিন কন্ট্রোল",
    profile: "প্রোফাইল",
    aiAdvice: "এআই রিপোর্ট",
    balance: "ব্যালেন্স",
    income: "আয়",
    expense: "ব্যয়",
    category: "ক্যাটাগরি",
    wallet: "ওয়ালেট",
    note: "লেনদেনের বর্ণনা",
    date: "তারিখ",
    amount: "টাকার পরিমাণ",
    save: "লেনদেন নিশ্চিত করুন",
    transactions: "লেনদেনসমূহ",
    allCategories: "সব ক্যাটাগরি",
    totalBalance: "মোট সম্পদ",
    monthlySummary: "মাসিক গ্রোথ",
    recentActivity: "সাম্প্রতিক হিসাব",
    getPremium: "প্রো এক্সেস নিন",
    bKashPayment: "বিকাশ পেমেন্ট",
    nagadPayment: "নগদ পেমেন্ট",
    bKashNote: "০১৯১৩৮০৯৮৯৭ নম্বরে পেমেন্ট করুন",
    aiGreeting: "লিখুন: 'বাজারে ১৫০০ টাকা খরচ করেছি'",
    aiCategorize: "এআই প্রসেসিং",
    premiumFeature: "প্রো ফিচার",
  }
};

export const getIcon = (iconName: string, className?: string) => {
  const IconComponent = {
    Utensils, ShoppingCart, Car, Home, Zap, HeartPulse, GraduationCap, Smartphone,
    DollarSign, ArrowUpCircle, ArrowDownCircle, Wallet, Settings, PieChart, History,
    ShieldCheck, User, Sparkles, Shirt, Briefcase, Gift, Coffee
  }[iconName] || DollarSign;
  return <IconComponent className={className} />;
};