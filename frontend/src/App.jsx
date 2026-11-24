import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  GraduationCap,
  Users,
  Award,
  CheckCircle2,
  Clock,
  Calendar,
  Phone,
  MapPin,
  Search,
  Filter,
  ChevronRight,
  ChevronLeft,
  Star,
  Sparkles,
  ShieldCheck,
  FileText,
  CreditCard,
  MessageSquare,
  LogOut,
  LogIn,
  Menu,
  X,
  Bell,
  TrendingUp,
  BarChart3,
  Check,
  AlertCircle,
  PlayCircle,
  Download,
  Plus,
  UserCheck,
  Layers,
  Briefcase,
  DollarSign,
  ClipboardList,
  HelpCircle,
  Home,
  ArrowRight,
  Eye,
  Send,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import api from './api';

// ============================================================================
// 1. MOCK DATA & DOMAIN MODELS (Aligned with sufal6785/biddyangon Django Apps)
// ============================================================================

const HERO_SLIDES = [
  {
    id: 1,
    badge: 'ADMISSION SUCCESS 2026',
    title: 'BUET & Engineering Admission: 1,240+ Merit Selections from Biddyangon',
    subtitle:
      'Including 46 students in the Top 50! Structured parallel texts, daily live exams, and 24/7 Q&A doubt solving.',
    ctaPrimary: 'Explore Admission Batches',
    ctaSecondary: 'View Merit List',
    gradient: 'from-rose-700 via-red-700 to-indigo-950',
    accentColor: 'bg-amber-400 text-slate-950',
    statHighlight: 'Top 50 → 46 Students',
  },
  {
    id: 2,
    badge: 'MEDICAL & DU KA UNIT',
    title: 'Medical & Varsity "Ka" Final Model Test Package 2026',
    subtitle:
      'Paper finals, subject finals, central OMR evaluation, automated SMS results, and nationwide merit ranking.',
    ctaPrimary: 'Enroll in Model Test',
    ctaSecondary: 'Try Free Exam',
    gradient: 'from-indigo-900 via-blue-900 to-slate-950',
    accentColor: 'bg-emerald-400 text-slate-950',
    statHighlight: 'DMC 185+ | DU Ka 1,720+',
  },
  {
    id: 3,
    badge: 'NATIONWIDE SCHOLARSHIP',
    title: 'Biddyangon Merit Scholarship Exam 2026 — ৳6 Lakh Prize Pool',
    subtitle:
      'Open for SSC & HSC 27/28 batches. Free online & offline registration across all branches with instant analysis report.',
    ctaPrimary: 'Free Register Now',
    ctaSecondary: 'Exam Syllabus',
    gradient: 'from-emerald-800 via-teal-900 to-slate-950',
    accentColor: 'bg-amber-300 text-slate-950',
    statHighlight: '100 MCQ • 1 Hour • Free',
  },
];

const CLASS_FILTERS = [
  'All Class',
  'Six-Eight',
  'Nine-Ten (SSC)',
  'HSC 27/28',
  'Model Test',
  'Admission',
];

const MODE_FILTERS = ['All Mode', 'Offline', 'Combo/Online'];
const TYPE_FILTERS = ['All Type', 'Paid Program', 'Scholarship', 'Free Trial'];

const PROGRAMS_DATA = [
  {
    id: 'prog-1',
    title: 'Medical Admission Model Test Package 2026',
    category: 'Model Test',
    mode: 'Offline',
    modeLabel: 'Offline / Online',
    type: 'Paid Program',
    headerGradient: 'from-rose-600 to-red-700',
    startDate: '5 Nov, 2026',
    fee: '৳ 4,500',
    originalFee: '৳ 5,500',
    tag: 'Most Popular',
    highlights: [
      'Paper Final Exams: 6 | Subject Final: 5',
      'Final Model Tests: 15 + Home Practice Sets',
      'Printed Master Study Materials & Question Bank',
      '24/7 Q&A Doubt Solving & Auto SMS Result',
    ],
    routine: 'Sat, Mon, Wed — 8:30 AM & 3:00 PM',
    branchAvailability: 'All 42 Branches + Online Live',
  },
  {
    id: 'prog-2',
    title: 'Engineering & BUET Model Test Package 2026',
    category: 'Admission',
    mode: 'Combo/Online',
    modeLabel: 'Combo / Online',
    type: 'Paid Program',
    headerGradient: 'from-indigo-700 to-blue-800',
    startDate: '18 Nov, 2026',
    fee: '৳ 5,200',
    originalFee: '৳ 6,000',
    tag: 'BUET Standard',
    highlights: [
      'Written + MCQ Combined Paper Finals: 8',
      'Special BUET/CKRUET Standard Model Tests: 12',
      'Central Script Evaluation by BUET Mentors',
      'Detailed Performance & Weakness Analytics',
    ],
    routine: 'Sun, Tue, Thu — 9:00 AM & 4:00 PM',
    branchAvailability: 'Dhaka, Chattogram, Rajshahi + Online',
  },
  {
    id: 'prog-3',
    title: 'Grammar Champ & Merit Scholarship Exam',
    category: 'HSC 27/28',
    mode: 'Offline',
    modeLabel: 'Offline / Online',
    type: 'Scholarship',
    headerGradient: 'from-amber-500 to-orange-600',
    startDate: '27 Nov, 2026',
    fee: 'FREE',
    originalFee: null,
    tag: '৳6 Lakh Prize',
    highlights: [
      'For HSC / Alim 27 & 28 Batch Students',
      '100 MCQ • 100 Marks • 1 Hour Nationwide Exam',
      'Up to 100% Tuition Waiver & Cash Scholarship',
      'Instant Merit Position & Solution Sheet',
    ],
    routine: 'Friday — 10:00 AM (Single Slot)',
    branchAvailability: 'Nationwide All Branches + Online',
  },
  {
    id: 'prog-4',
    title: 'HSC 27 Academic Full Program (Science)',
    category: 'HSC 27/28',
    mode: 'Combo/Online',
    modeLabel: 'Combo / Online',
    type: 'Paid Program',
    headerGradient: 'from-violet-700 to-purple-800',
    startDate: '10 Dec, 2026',
    fee: '৳ 3,000 / mo',
    originalFee: '৳ 3,500',
    tag: 'Pioneer Batch',
    highlights: [
      'Physics, Chemistry, Higher Math, Biology + ICT',
      '250+ Interactive Live & Smartboard Classes',
      'Printed Parallel Text Books (8 Volumes)',
      'Daily MCQ + Weekly CQ Exams with SMS Alert',
    ],
    routine: '6 Days/Week — Morning & Afternoon Shifts',
    branchAvailability: 'All Branches + Online Portal',
  },
  {
    id: 'prog-5',
    title: 'SSC 27 Academic & Model Test Care',
    category: 'Nine-Ten (SSC)',
    mode: 'Offline',
    modeLabel: 'Offline / Online',
    type: 'Paid Program',
    headerGradient: 'from-emerald-600 to-teal-700',
    startDate: '1 Dec, 2026',
    fee: '৳ 2,500 / mo',
    originalFee: '৳ 3,000',
    tag: 'Board Focused',
    highlights: [
      'Bangla & English Version Separate Batches',
      'Chapter-wise 36 Exams + 12 Full Model Tests',
      'Board Question Analysis & Creative Writing Guide',
      'Monthly Guardian Progress Report Card',
    ],
    routine: 'Sat–Thu — 3:30 PM Shift',
    branchAvailability: 'All Branches',
  },
  {
    id: 'prog-6',
    title: 'Class 6–8 Academic Free Trial Course',
    category: 'Six-Eight',
    mode: 'Combo/Online',
    modeLabel: 'Online Trial',
    type: 'Free Trial',
    headerGradient: 'from-sky-600 to-cyan-700',
    startDate: 'Start Anytime',
    fee: 'FREE',
    originalFee: null,
    tag: '7-Day Free Trial',
    highlights: [
      '6 Subject-wise Interactive Smart Classes',
      '6 Practice MCQ Exams with Auto Evaluation',
      'Live Q&A Doubt Solving Access',
      'Detailed Performance & Readiness Report',
    ],
    routine: 'Flexible Self-Paced + Live Doubt Hour',
    branchAvailability: 'Online Portal',
  },
];

const UNIQUE_SERVICES = [
  {
    icon: GraduationCap,
    title: 'BUET, DMC & DU Mentors',
    desc: 'Learn directly from top merit holders and experienced subject specialists with smartboard delivery.',
    color: 'bg-rose-50 text-rose-600 border-rose-100',
  },
  {
    icon: BookOpen,
    title: 'Parallel Text & Study Sheets',
    desc: 'Scientifically structured printed books, concept maps, and board/admission question banks.',
    color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  },
  {
    icon: ClipboardList,
    title: 'Offline + Online Exam System',
    desc: 'Central OMR evaluation for offline tests and instant anti-cheat online MCQ exams from home.',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  },
  {
    icon: BarChart3,
    title: 'Performance & SMS Analytics',
    desc: 'Automated guardian SMS after every exam with nationwide merit rank and weak-topic diagnostics.',
    color: 'bg-amber-50 text-amber-600 border-amber-100',
  },
  {
    icon: HelpCircle,
    title: '24/7 Q&A Doubt Solving',
    desc: 'Post any tricky math, physics, or chemistry problem anytime and get step-by-step mentor solutions.',
    color: 'bg-sky-50 text-sky-600 border-sky-100',
  },
  {
    icon: ShieldCheck,
    title: 'Unified Student & Guardian Portal',
    desc: 'Track daily attendance, fee receipts, exam schedules, and approved report cards in one place.',
    color: 'bg-purple-50 text-purple-600 border-purple-100',
  },
];

const NOTICES = [
  {
    id: 1,
    date: '24 Nov 2026',
    tag: 'Exam',
    title: 'Grammar Champ Merit Scholarship Admit Card is now available in Student Portal.',
  },
  {
    id: 2,
    date: '22 Nov 2026',
    tag: 'Result',
    title: 'HSC 27 Physics Chapter-4 Combined Merit List has been published.',
  },
  {
    id: 3,
    date: '19 Nov 2026',
    tag: 'Routine',
    title: 'Winter Shift Timing Update: Morning batches will start at 8:00 AM from 1 Dec.',
  },
  {
    id: 4,
    date: '15 Nov 2026',
    tag: 'Admission',
    title: 'Engineering & Medical Model Test 2026 — Last date for early-bird discount is 30 Nov.',
  },
];

const TOPPERS = [
  {
    name: 'Tahmid Hasan',
    achievement: '1st Merit • BUET Admission',
    batch: 'Engineering Batch 25',
    quote: 'Biddyangon’s daily written exams and central merit list pushed me to stay consistent every single day.',
    initials: 'TH',
    color: 'from-rose-600 to-red-700',
  },
  {
    name: 'Nusrat Jahan',
    achievement: '3rd Merit • DMC Medical',
    batch: 'Medical Batch 25',
    quote: 'The parallel text books and 24/7 Q&A service saved me hundreds of hours during final revision.',
    initials: 'NJ',
    color: 'from-indigo-600 to-blue-700',
  },
  {
    name: 'Farhan Sadik',
    achievement: '2nd Merit • DU Ka Unit',
    batch: 'Varsity Ka Batch 25',
    quote: 'Analyzing my weak chapters from the student portal analytics was the real game changer.',
    initials: 'FS',
    color: 'from-emerald-600 to-teal-700',
  },
];

// Portal Charts Data
const STUDENT_PERF_CHART = [
  { exam: 'Quiz 1', score: 74, avg: 65 },
  { exam: 'Phy Ch-2', score: 82, avg: 68 },
  { exam: 'Chem Ch-3', score: 79, avg: 70 },
  { exam: 'Math Mid', score: 88, avg: 71 },
  { exam: 'Model 1', score: 91, avg: 73 },
  { exam: 'Model 2', score: 94, avg: 75 },
];

const ADMIN_FINANCE_CHART = [
  { month: 'Jun', revenue: 420, expense: 210 },
  { month: 'Jul', revenue: 480, expense: 230 },
  { month: 'Aug', revenue: 510, expense: 245 },
  { month: 'Sep', revenue: 590, expense: 260 },
  { month: 'Oct', revenue: 640, expense: 275 },
  { month: 'Nov', revenue: 720, expense: 290 },
];

const LIVE_EXAM_QUESTIONS = [
  {
    id: 1,
    question: 'A projectile is launched at 45° with initial velocity 20 m/s. What is its maximum horizontal range? (g = 10 m/s²)',
    options: ['20 m', '40 m', '60 m', '80 m'],
    correct: 1,
    explanation: 'R = u² sin(2θ) / g = (400 × sin 90°) / 10 = 40 m.',
  },
  {
    id: 2,
    question: 'Which hybridisation is present in the central carbon atom of ethyne (C₂H₂)?',
    options: ['sp³', 'sp²', 'sp', 'dsp²'],
    correct: 2,
    explanation: 'Each carbon in C₂H₂ forms two sigma bonds and two pi bonds, giving linear sp hybridisation.',
  },
  {
    id: 3,
    question: 'If f(x) = x³ - 3x + 2, what is the value of f\'(2)?',
    options: ['6', '9', '12', '15'],
    correct: 1,
    explanation: 'f\'(x) = 3x² - 3. At x = 2, f\'(2) = 3(4) - 3 = 9.',
  },
  {
    id: 4,
    question: 'Which organelle is primarily responsible for ATP synthesis via oxidative phosphorylation?',
    options: ['Ribosome', 'Golgi Apparatus', 'Mitochondria', 'Lysosome'],
    correct: 2,
    explanation: 'Mitochondria generate most of the cell’s ATP through oxidative phosphorylation.',
  },
];

const INITIAL_APPROVAL_QUEUE = [
  {
    id: 'APP-101',
    exam: 'HSC 27 Physics Paper-1 Model Test',
    teacher: 'Engr. Mahmudul Hasan',
    batch: 'HSC Science Pioneer',
    studentsCount: 48,
    avgScore: '81.4%',
    submittedAt: '24 Nov, 4:15 PM',
    status: 'Pending',
  },
  {
    id: 'APP-102',
    exam: 'Medical Biology Botany Chapter-5',
    teacher: 'Dr. Nusrat Fatima',
    batch: 'Medical Morning-A',
    studentsCount: 62,
    avgScore: '76.8%',
    submittedAt: '24 Nov, 2:30 PM',
    status: 'Pending',
  },
  {
    id: 'APP-103',
    exam: 'SSC Higher Math Weekly Quiz #7',
    teacher: 'Rakibul Islam',
    batch: 'SSC-27 Evening',
    studentsCount: 35,
    avgScore: '84.0%',
    submittedAt: '23 Nov, 6:00 PM',
    status: 'Approved',
  },
];

const INITIAL_ROSTER = [
  { id: 'STD-2026-01', name: 'Arafat Rahman', roll: '101', status: 'Present' },
  { id: 'STD-2026-02', name: 'Sadia Afrin', roll: '102', status: 'Present' },
  { id: 'STD-2026-03', name: 'Mehedi Hasan', roll: '103', status: 'Late' },
  { id: 'STD-2026-04', name: 'Tasnim Tabassum', roll: '104', status: 'Present' },
  { id: 'STD-2026-05', name: 'Nafis Iqbal', roll: '105', status: 'Absent' },
  { id: 'STD-2026-06', name: 'Maliha Chowdhury', roll: '106', status: 'Present' },
];

const INITIAL_COMPLAINTS = [
  {
    id: 'CMP-401',
    student: 'Arafat Rahman',
    category: 'Study Material',
    subject: 'Physics Ch-4 Parallel Text PDF missing page 18',
    date: '23 Nov 2026',
    status: 'Resolved',
    reply: 'Updated PDF uploaded in portal resources. Thank you!',
  },
  {
    id: 'CMP-402',
    student: 'Arafat Rahman',
    category: 'Routine',
    subject: 'Request to shift Wednesday lab class by 15 minutes',
    date: '24 Nov 2026',
    status: 'In Review',
    reply: 'Forwarded to academic coordinator.',
  },
];

// ============================================================================
// 2. REUSABLE UI COMPONENTS
// ============================================================================

function ToastBanner({ toast, onClose }) {
  if (!toast) return null;
  const styles = {
    success: 'bg-emerald-600 text-white',
    info: 'bg-slate-900 text-white',
    warning: 'bg-amber-500 text-slate-950',
  };
  return (
    <div className="fixed bottom-5 right-5 z-50 animate-bounce-once max-w-sm w-full px-4 sm:px-0">
      <div
        className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-2xl ${
          styles[toast.type] || styles.info
        }`}
      >
        <div className="flex items-center gap-2.5 text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toast.message}</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/20 transition"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function BrandLogo({ dark = false, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2.5 text-left group focus:outline-none"
    >
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-red-700 flex items-center justify-center shadow-md shadow-rose-600/25 group-hover:scale-105 transition-transform">
        <GraduationCap className="w-6 h-6 text-white" />
      </div>
      <div>
        <div
          className={`text-xl font-extrabold tracking-tight leading-none ${
            dark ? 'text-white' : 'text-slate-900'
          }`}
        >
          BIDDYANGON
        </div>
        <div
          className={`text-[10px] font-semibold tracking-widest uppercase mt-0.5 ${
            dark ? 'text-rose-300' : 'text-rose-600'
          }`}
        >
          Academic & Admission Care
        </div>
      </div>
    </button>
  );
}

// ============================================================================
// 3. PUBLIC HOMEPAGE (Udvash-Inspired Familiar & Modern Coaching Experience)
// ============================================================================

function PublicHomePage({ onOpenLogin, onEnrollProgram, showToast }) {
  const [slideIdx, setSlideIdx] = useState(0);
  const [classFilter, setClassFilter] = useState('All Class');
  const [modeFilter, setModeFilter] = useState('All Mode');
  const [typeFilter, setTypeFilter] = useState('All Type');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auto-advance hero banner every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const filteredPrograms = useMemo(() => {
    return PROGRAMS_DATA.filter((p) => {
      const matchClass = classFilter === 'All Class' || p.category === classFilter;
      const matchMode = modeFilter === 'All Mode' || p.mode === modeFilter;
      const matchType = typeFilter === 'All Type' || p.type === typeFilter;
      const matchSearch =
        !searchQuery.trim() ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchClass && matchMode && matchType && matchSearch;
    });
  }, [classFilter, modeFilter, typeFilter, searchQuery]);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const currentSlide = HERO_SLIDES[slideIdx];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Top Utility Bar (Familiar Udvash-style Hotline + Quick Links) */}
      <div className="bg-slate-950 text-slate-200 text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-amber-400 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Admission 2026 & HSC 27 Batches Open!
            </span>
            <span className="hidden md:inline text-slate-400">|</span>
            <span className="hidden md:inline-flex items-center gap-1 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              42 Branches Nationwide + Online Portal
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="#branches"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('notices');
              }}
              className="hover:text-white transition"
            >
              Notice Board
            </a>
            <span className="inline-flex items-center gap-1.5 font-bold text-white bg-rose-600/20 border border-rose-500/30 px-2.5 py-0.5 rounded-full">
              <Phone className="w-3 h-3 text-rose-400" />
              09666-775566
            </span>
          </div>
        </div>
      </div>

      {/* Main Sticky Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3 flex items-center justify-between gap-4">
          <BrandLogo onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 font-semibold text-sm text-slate-700">
            <button
              onClick={() => scrollToSection('programs')}
              className="px-3.5 py-2 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition"
            >
              Programs
            </button>
            <button
              onClick={() => {
                setTypeFilter('Free Trial');
                scrollToSection('programs');
              }}
              className="px-3.5 py-2 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition"
            >
              Free Trial
            </button>
            <button
              onClick={() => {
                setTypeFilter('Scholarship');
                scrollToSection('programs');
              }}
              className="px-3.5 py-2 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition"
            >
              Scholarship Exam
            </button>
            <button
              onClick={() => scrollToSection('services')}
              className="px-3.5 py-2 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition"
            >
              Why Us
            </button>
            <button
              onClick={() => scrollToSection('success')}
              className="px-3.5 py-2 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition"
            >
              Success 2026
            </button>
          </nav>

          {/* Right CTA Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onOpenLogin('student')}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
            >
              <LogIn className="w-4 h-4 text-rose-600" />
              Portal Login
            </button>
            <button
              onClick={() => onOpenLogin('student')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 shadow-md shadow-rose-600/25 transition active:scale-95"
            >
              Join Now
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2 shadow-lg">
            {[
              { label: 'All Programs', action: () => scrollToSection('programs') },
              {
                label: 'Free Trial Courses',
                action: () => {
                  setTypeFilter('Free Trial');
                  scrollToSection('programs');
                },
              },
              {
                label: 'Merit Scholarship Exam',
                action: () => {
                  setTypeFilter('Scholarship');
                  scrollToSection('programs');
                },
              },
              { label: 'Why Biddyangon', action: () => scrollToSection('services') },
              { label: 'Success Stories 2026', action: () => scrollToSection('success') },
              { label: 'Notice Board', action: () => scrollToSection('notices') },
            ].map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className="block w-full text-left px-4 py-2.5 rounded-xl font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-600"
              >
                {item.label}
              </button>
            ))}
            <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-2">
              <button
                onClick={() => onOpenLogin('student')}
                className="py-2 rounded-lg bg-rose-50 text-rose-700 text-xs font-bold"
              >
                Student Demo
              </button>
              <button
                onClick={() => onOpenLogin('teacher')}
                className="py-2 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold"
              >
                Teacher Demo
              </button>
              <button
                onClick={() => onOpenLogin('admin')}
                className="py-2 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold"
              >
                Admin Demo
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Achievement Carousel (Udvash Signature Bold Banner) */}
      <section className="relative overflow-hidden">
        <div
          className={`bg-gradient-to-br ${currentSlide.gradient} text-white transition-all duration-700`}
        >
          {/* Decorative Pattern */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '28px 28px',
            }}
          />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
            <div className="grid lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-xs font-bold tracking-wider uppercase">
                  <Award className="w-4 h-4 text-amber-300" />
                  {currentSlide.badge}
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight">
                  {currentSlide.title}
                </h1>

                <p className="text-base sm:text-lg text-white/85 max-w-2xl leading-relaxed">
                  {currentSlide.subtitle}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => scrollToSection('programs')}
                    className="px-6 py-3.5 rounded-xl bg-white text-rose-700 font-extrabold text-sm shadow-xl hover:bg-rose-50 transition flex items-center gap-2"
                  >
                    {currentSlide.ctaPrimary}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onOpenLogin('student')}
                    className="px-6 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold text-sm backdrop-blur-sm transition flex items-center gap-2"
                  >
                    <PlayCircle className="w-4 h-4" />
                    Try Live Student Portal
                  </button>
                </div>
              </div>

              {/* Right Interactive Quick-Portal & Highlight Card */}
              <div className="lg:col-span-5">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl space-y-5">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-extrabold ${currentSlide.accentColor}`}
                    >
                      {currentSlide.statHighlight}
                    </span>
                    <span className="text-xs text-white/75 font-medium">
                      Live Portal Access
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/10 rounded-xl p-3.5 border border-white/10">
                      <div className="text-2xl font-extrabold">48,500+</div>
                      <div className="text-xs text-white/75 mt-0.5">Active Students</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3.5 border border-white/10">
                      <div className="text-2xl font-extrabold">96.4%</div>
                      <div className="text-xs text-white/75 mt-0.5">GPA-5 & Merit Rate</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/15">
                    <div className="text-xs font-semibold text-white/80 mb-2.5 uppercase tracking-wider">
                      Instant Role-Based Portal Preview:
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => onOpenLogin('student')}
                        className="py-2.5 px-2 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-amber-300 transition text-center shadow"
                      >
                        Student
                      </button>
                      <button
                        onClick={() => onOpenLogin('teacher')}
                        className="py-2.5 px-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-white font-bold text-xs transition text-center"
                      >
                        Teacher
                      </button>
                      <button
                        onClick={() => onOpenLogin('admin')}
                        className="py-2.5 px-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-white font-bold text-xs transition text-center"
                      >
                        Admin
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Carousel Controls */}
            <div className="flex items-center justify-between mt-8 pt-4 border-t border-white/15">
              <div className="flex items-center gap-2">
                {HERO_SLIDES.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => setSlideIdx(idx)}
                    className={`h-2.5 rounded-full transition-all ${
                      idx === slideIdx ? 'w-10 bg-amber-400' : 'w-2.5 bg-white/35 hover:bg-white/60'
                    }`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setSlideIdx((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
                  }
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSlideIdx((prev) => (prev + 1) % HERO_SLIDES.length)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition"
                  aria-label="Next Slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timely Programs Explorer */}
      <section id="programs" className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-14">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="inline-block px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-extrabold uppercase tracking-wider mb-2">
            Academic & Admission Programs
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Timely Programs for Every Goal
          </h2>
          <p className="text-slate-600 mt-2 text-sm sm:text-base">
            Filter by class, mode, or scholarship type to find the right batch for your preparation.
          </p>
        </div>

        {/* Filter Bar Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 mb-8 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {CLASS_FILTERS.map((cls) => (
              <button
                key={cls}
                onClick={() => setClassFilter(cls)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                  classFilter === cls
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cls}
              </button>
            ))}
          </div>

          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mr-1">
                <Filter className="w-3.5 h-3.5" />
                Mode:
              </div>
              {MODE_FILTERS.map((m) => (
                <button
                  key={m}
                  onClick={() => setModeFilter(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                    modeFilter === m
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  {m}
                </button>
              ))}

              <span className="hidden sm:inline text-slate-300 mx-1">|</span>

              {TYPE_FILTERS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                    typeFilter === t
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="relative min-w-[230px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search course or batch..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
              />
            </div>
          </div>
        </div>

        {/* Programs Grid */}
        {filteredPrograms.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No matching programs found</h3>
            <p className="text-sm text-slate-500 mt-1">
              Try resetting your filters to explore all available batches.
            </p>
            <button
              onClick={() => {
                setClassFilter('All Class');
                setModeFilter('All Mode');
                setTypeFilter('All Type');
                setSearchQuery('');
              }}
              className="mt-4 px-5 py-2 rounded-xl bg-rose-600 text-white text-sm font-bold hover:bg-rose-700"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrograms.map((program) => (
              <div
                key={program.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
              >
                <div
                  className={`bg-gradient-to-br ${program.headerGradient} p-5 text-white relative`}
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-md bg-white/20 backdrop-blur-sm text-[11px] font-bold tracking-wide">
                      {program.modeLabel}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-amber-300 text-slate-950 text-[11px] font-extrabold">
                      {program.tag}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold leading-snug">{program.title}</h3>
                  <div className="flex items-center gap-2 mt-3 text-xs text-white/85 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    Starts: {program.startDate}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <ul className="space-y-2.5 mb-5">
                    {program.highlights.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-4 border-t border-slate-100 space-y-4">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-xs font-semibold text-slate-500 block">
                          Program Fee
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-extrabold text-slate-900">
                            {program.fee}
                          </span>
                          {program.originalFee && (
                            <span className="text-xs text-slate-400 line-through">
                              {program.originalFee}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
                        {program.category}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        onClick={() => setSelectedProgram(program)}
                        className="py-2.5 px-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 transition"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => onEnrollProgram(program)}
                        className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-sm transition"
                      >
                        {program.fee === 'FREE' ? 'Free Register' : 'Enroll Now'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Why Biddyangon / Unique Services Grid */}
      <section id="services" className="bg-white border-y border-slate-200/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-extrabold uppercase tracking-wider mb-2">
              Unique Ecosystem
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Why Students & Guardians Trust Biddyangon
            </h2>
            <p className="text-slate-600 mt-2">
              A complete hybrid coaching experience blending offline discipline with modern digital analytics.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {UNIQUE_SERVICES.map((srv) => {
              const Icon = srv.icon;
              return (
                <div
                  key={srv.title}
                  className="p-6 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-lg transition-all"
                >
                  <div
                    className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 ${srv.color}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 mb-2">{srv.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{srv.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Success Stories + Notice Board Split Section */}
      <section id="success" className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold uppercase tracking-wider mb-2">
                Hall of Excellence
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Voices of Our Top Merit Holders
              </h2>
            </div>

            <div className="space-y-4">
              {TOPPERS.map((t) => (
                <div
                  key={t.name}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row gap-4 items-start"
                >
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${t.color} text-white font-extrabold text-lg flex items-center justify-center shrink-0 shadow-md`}
                  >
                    {t.initials}
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-extrabold text-slate-900">{t.name}</h4>
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
                        {t.achievement}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 italic">"{t.quote}"</p>
                    <div className="text-xs font-semibold text-slate-400">{t.batch}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div id="notices" className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
              <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Bell className="w-5 h-5 text-amber-400" />
                  <h3 className="font-extrabold text-lg">Official Notice Board</h3>
                </div>
                <span className="text-xs bg-rose-600 px-2.5 py-0.5 rounded-full font-bold">
                  Live
                </span>
              </div>

              <div className="p-5 divide-y divide-slate-100 flex-1">
                {NOTICES.map((n) => (
                  <div key={n.id} className="py-3.5 first:pt-0 last:pb-0 group">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[11px] font-bold">
                        {n.tag}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">{n.date}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800 group-hover:text-rose-600 transition cursor-pointer">
                      {n.title}
                    </p>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100">
                <button
                  onClick={() =>
                    showToast('All official circulars are synced with your Student Portal.', 'info')
                  }
                  className="w-full py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-100 transition"
                >
                  View All Notices
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="bg-slate-950 text-slate-300 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <BrandLogo dark onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering Bangladeshi students from Class 6 to University Admission with structured
              mentorship, scientific exams, and smart digital tracking.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold text-sm mb-3">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => scrollToSection('programs')}
                  className="hover:text-rose-400 transition"
                >
                  All Academic Programs
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLogin('student')}
                  className="hover:text-rose-400 transition"
                >
                  Student Portal Login
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLogin('teacher')}
                  className="hover:text-rose-400 transition"
                >
                  Teacher Faculty Portal
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLogin('admin')}
                  className="hover:text-rose-400 transition"
                >
                  Admin Management Console
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-sm mb-3">Major Branches</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Farmgate Central Campus, Dhaka</li>
              <li>Mirpur-10 & Uttara Sector-7, Dhaka</li>
              <li>Chawkbazar, Chattogram</li>
              <li>Saheb Bazar, Rajshahi</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-sm mb-3">24/7 Helpline</h4>
            <div className="text-lg font-extrabold text-white mb-1">09666-775566</div>
            <p className="text-xs text-slate-400">support@biddyangon.edu.bd</p>
            <p className="text-xs text-slate-500 mt-3">Sat–Thu: 8:00 AM – 10:00 PM</p>
          </div>
        </div>
        <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Biddyangon Academic & Admission Care. All rights reserved.
        </div>
      </footer>

      {/* Program Details Modal */}
      {selectedProgram && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div
              className={`bg-gradient-to-br ${selectedProgram.headerGradient} p-6 text-white flex items-start justify-between gap-4`}
            >
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-bold">
                  {selectedProgram.modeLabel} • {selectedProgram.category}
                </span>
                <h3 className="text-xl font-extrabold mt-2">{selectedProgram.title}</h3>
              </div>
              <button
                onClick={() => setSelectedProgram(null)}
                className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-slate-500 font-semibold">Class Routine</div>
                  <div className="text-slate-900 font-bold mt-0.5">{selectedProgram.routine}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-slate-500 font-semibold">Availability</div>
                  <div className="text-slate-900 font-bold mt-0.5">
                    {selectedProgram.branchAvailability}
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                  Included in this Package
                </h4>
                <ul className="space-y-2">
                  {selectedProgram.highlights.map((h, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500">Total Fee</div>
                  <div className="text-2xl font-extrabold text-slate-900">
                    {selectedProgram.fee}
                  </div>
                </div>
                <button
                  onClick={() => {
                    const prog = selectedProgram;
                    setSelectedProgram(null);
                    onEnrollProgram(prog);
                  }}
                  className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md"
                >
                  Proceed to Enrollment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 4. LOGIN MODAL / PAGE WITH 1-CLICK DEMO ROLE ACCESS
// ============================================================================

function LoginModal({ initialRole = 'student', onClose, onLoginSuccess }) {
  const [role, setRole] = useState(initialRole);
  const [username, setUsername] = useState(
    initialRole === 'student'
      ? 'ssc26-001'
      : initialRole === 'teacher'
      ? 'teacher1'
      : 'admin'
  );
  const [password, setPassword] = useState(
    initialRole === 'student'
      ? 'student123'
      : initialRole === 'teacher'
      ? 'teacher123'
      : 'admin123'
  );
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (newRole) => {
    setRole(newRole);
    if (newRole === 'student') {
      setUsername('ssc26-001');
      setPassword('student123');
    } else if (newRole === 'teacher') {
      setUsername('teacher1');
      setPassword('teacher123');
    } else {
      setUsername('admin');
      setPassword('admin123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Attempt real DRF backend login if accessible
      const res = await api.post('/api/auth/login/', { username, password });
      if (res.data?.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        const backendRole = res.data.user?.role?.toLowerCase() || role;
        onLoginSuccess(backendRole);
        return;
      }
    } catch (err) {
      // Fallback seamlessly to interactive demo mode
      console.log('Using interactive demo credentials session');
    } finally {
      setLoading(false);
    }
    onLoginSuccess(role);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
        <div className="bg-gradient-to-br from-rose-600 to-indigo-950 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5 mb-2">
            <GraduationCap className="w-7 h-7 text-amber-300" />
            <span className="font-extrabold tracking-tight text-xl">Biddyangon Portal</span>
          </div>
          <p className="text-xs text-white/80">
            Sign in to access classes, live MCQ exams, attendance, and financial records.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Select Account Role (Pre-Seeded 1-Click Access)
            </label>
            <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-xl">
              {[
                { id: 'student', label: 'Student' },
                { id: 'teacher', label: 'Teacher' },
                { id: 'admin', label: 'Admin' },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleRoleSelect(r.id)}
                  className={`py-2 rounded-lg text-xs font-extrabold transition ${
                    role === r.id
                      ? 'bg-white text-rose-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Registration ID / Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-extrabold text-sm shadow-lg shadow-rose-600/25 transition disabled:opacity-60"
          >
            {loading ? 'Authenticating...' : `Enter ${role.charAt(0).toUpperCase() + role.slice(1)} Dashboard`}
          </button>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// 5. INTERACTIVE LIVE MCQ EXAM ROOM (StudentExams / StudentExamTaking)
// ============================================================================

function StudentExamRoom({ onFinish, showToast }) {
  const [activeExam, setActiveExam] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(600);

  useEffect(() => {
    if (!activeExam || submitted) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setSubmitted(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [activeExam, submitted]);

  const score = useMemo(() => {
    return LIVE_EXAM_QUESTIONS.reduce(
      (acc, q) => acc + (answers[q.id] === q.correct ? 1 : 0),
      0
    );
  }, [answers]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  if (!activeExam) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Online MCQ Exams</h2>
            <p className="text-sm text-slate-500">
              Take scheduled daily tests and practice model exams with instant evaluation.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl border-2 border-rose-200 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-extrabold">
                  LIVE NOW
                </span>
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> 10 Minutes
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">
                HSC Science Combined Daily MCQ #14
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Physics, Chemistry, Higher Math & Biology — 4 Quick Demo Questions with Explanations.
              </p>
            </div>
            <button
              onClick={() => {
                setActiveExam(true);
                setSubmitted(false);
                setAnswers({});
                setCurrentQ(0);
                setSecondsLeft(600);
              }}
              className="mt-5 w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition"
            >
              <PlayCircle className="w-4 h-4" />
              Start Live Exam
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between opacity-90">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-extrabold">
                  UPCOMING
                </span>
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> 27 Nov, 10:00 AM
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Grammar Champ Nationwide Scholarship Exam
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                100 MCQ • 100 Marks • Negative Marking 0.25. Admit card verified.
              </p>
            </div>
            <button
              onClick={() => showToast('Reminder set! Exam unlocks on 27 Nov at 10:00 AM.', 'info')}
              className="mt-5 w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition"
            >
              Set Exam Reminder
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    const percentage = Math.round((score / LIVE_EXAM_QUESTIONS.length) * 100);
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <Award className="w-9 h-9" />
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900">Exam Submitted!</h3>
          <p className="text-sm text-slate-500 mt-1">
            Auto-evaluated instantly & synced to your Performance Report.
          </p>
          <div className="mt-4 inline-flex items-baseline gap-2 px-6 py-3 rounded-2xl bg-slate-900 text-white">
            <span className="text-3xl font-extrabold text-amber-400">
              {score}/{LIVE_EXAM_QUESTIONS.length}
            </span>
            <span className="text-sm font-bold text-slate-300">({percentage}%)</span>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-500">
            Answer Key & Explanations
          </h4>
          {LIVE_EXAM_QUESTIONS.map((q, i) => {
            const isCorrect = answers[q.id] === q.correct;
            return (
              <div
                key={q.id}
                className={`p-4 rounded-xl border ${
                  isCorrect ? 'bg-emerald-50/60 border-emerald-200' : 'bg-rose-50/60 border-rose-200'
                }`}
              >
                <div className="font-bold text-sm text-slate-900">
                  Q{i + 1}. {q.question}
                </div>
                <div className="text-xs mt-2 space-y-1">
                  <div>
                    Your Answer:{' '}
                    <span className="font-bold">
                      {answers[q.id] !== undefined ? q.options[answers[q.id]] : 'Not Answered'}
                    </span>
                  </div>
                  <div className="text-emerald-700 font-bold">
                    Correct Answer: {q.options[q.correct]}
                  </div>
                  <div className="text-slate-600 pt-1">{q.explanation}</div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => {
            setActiveExam(false);
            if (onFinish) onFinish();
          }}
          className="px-6 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800"
        >
          Back to Exam List
        </button>
      </div>
    );
  }

  const q = LIVE_EXAM_QUESTIONS[currentQ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs text-rose-400 font-bold uppercase">Live Assessment</div>
          <h3 className="font-extrabold">HSC Science Combined Daily MCQ #14</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-rose-600 font-mono font-bold text-sm flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {formatTime(secondsLeft)}
          </div>
          <button
            onClick={() => {
              setSubmitted(true);
              showToast('Exam submitted and evaluated!', 'success');
            }}
            className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs"
          >
            Submit Exam
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex flex-wrap gap-2">
          {LIVE_EXAM_QUESTIONS.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => setCurrentQ(idx)}
              className={`w-9 h-9 rounded-xl font-bold text-xs transition ${
                currentQ === idx
                  ? 'bg-rose-600 text-white shadow'
                  : answers[item.id] !== undefined
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-extrabold text-slate-900">
            Q{currentQ + 1}. {q.question}
          </h4>
          <div className="grid sm:grid-cols-2 gap-3">
            {q.options.map((opt, idx) => {
              const selected = answers[q.id] === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setAnswers({ ...answers, [q.id]: idx })}
                  className={`p-4 rounded-xl border-2 text-left text-sm font-semibold transition flex items-center gap-3 ${
                    selected
                      ? 'border-rose-600 bg-rose-50 text-rose-900'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold ${
                      selected ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            disabled={currentQ === 0}
            onClick={() => setCurrentQ((c) => c - 1)}
            className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-700 disabled:opacity-40"
          >
            Previous
          </button>
          {currentQ < LIVE_EXAM_QUESTIONS.length - 1 ? (
            <button
              onClick={() => setCurrentQ((c) => c + 1)}
              className="px-5 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800"
            >
              Next Question
            </button>
          ) : (
            <button
              onClick={() => {
                setSubmitted(true);
                showToast('Exam submitted and evaluated!', 'success');
              }}
              className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700"
            >
              Finish & See Score
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 6. ROLE-BASED PORTAL SHELL (Student / Teacher / Admin)
// ============================================================================

function CoachingPortal({ role, onSwitchRole, onLogout, showToast }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Interactive Portal States
  const [roster, setRoster] = useState(INITIAL_ROSTER);
  const [approvalQueue, setApprovalQueue] = useState(INITIAL_APPROVAL_QUEUE);
  const [complaints, setComplaints] = useState(INITIAL_COMPLAINTS);
  const [newComplaintSubject, setNewComplaintSubject] = useState('');
  const [newComplaintCategory, setNewComplaintCategory] = useState('Academic');

  const navConfig = {
    student: [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
      { id: 'exams', label: 'Online Exams', icon: PlayCircle },
      { id: 'results', label: 'My Results', icon: Award },
      { id: 'attendance', label: 'Attendance', icon: UserCheck },
      { id: 'fees', label: 'Fees & Receipts', icon: CreditCard },
      { id: 'complaints', label: 'Support & Q&A', icon: MessageSquare },
    ],
    teacher: [
      { id: 'dashboard', label: 'Faculty Overview', icon: Home },
      { id: 'attendance', label: 'Mark Attendance', icon: UserCheck },
      { id: 'marks', label: 'Marks & Questions', icon: ClipboardList },
      { id: 'salary', label: 'Salary & Payroll', icon: DollarSign },
    ],
    admin: [
      { id: 'dashboard', label: 'Admin Analytics', icon: BarChart3 },
      { id: 'approvals', label: 'Results Queue', icon: ShieldCheck },
      { id: 'academics', label: 'Courses & Batches', icon: Layers },
      { id: 'finance', label: 'Finance & Fees', icon: DollarSign },
    ],
  };

  const userProfile = {
    student: { name: 'Arafat Rahman', sub: 'ID: ssc26-001 • SSC 2026 Batch', initials: 'AR' },
    teacher: { name: 'Engr. Mahmudul Hasan', sub: 'Senior Physics Mentor • BUET', initials: 'MH' },
    admin: { name: 'Sufal Ahmed', sub: 'Chief Academic Director', initials: 'SA' },
  }[role];

  const handleRoleChange = (newRole) => {
    onSwitchRole(newRole);
    setActiveTab('dashboard');
    setSidebarOpen(false);
  };

  const updateAttendanceStatus = (studentId, status) => {
    setRoster((prev) => prev.map((s) => (s.id === studentId ? { ...s, status } : s)));
  };

  const handleApproveResult = (id) => {
    setApprovalQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'Approved' } : item))
    );
    showToast(`Result batch ${id} approved & published to students!`, 'success');
  };

  const handleAddComplaint = (e) => {
    e.preventDefault();
    if (!newComplaintSubject.trim()) return;
    const item = {
      id: `CMP-${Math.floor(410 + Math.random() * 500)}`,
      student: 'Arafat Rahman',
      category: newComplaintCategory,
      subject: newComplaintSubject,
      date: 'Just now',
      status: 'In Review',
      reply: 'Ticket received. Academic support will respond shortly.',
    };
    setComplaints([item, ...complaints]);
    setNewComplaintSubject('');
    showToast('Your support ticket has been submitted!', 'success');
  };

  const renderContent = () => {
    // ---------------- STUDENT VIEWS ----------------
    if (role === 'student') {
      switch (activeTab) {
        case 'exams':
          return <StudentExamRoom showToast={showToast} />;
        case 'results':
          return (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">Published Exam Results</h2>
                <p className="text-sm text-slate-500">
                  Admin-verified report cards and nationwide merit positions.
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-5 py-3.5">Exam Title</th>
                      <th className="px-5 py-3.5">Date</th>
                      <th className="px-5 py-3.5">Marks</th>
                      <th className="px-5 py-3.5">Merit Rank</th>
                      <th className="px-5 py-3.5">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { title: 'Physics Paper-1 Model Test', date: '20 Nov 2026', marks: '94 / 100', rank: '#4 of 1,420', grade: 'A+' },
                      { title: 'Chemistry Organic Quiz #5', date: '14 Nov 2026', marks: '45 / 50', rank: '#12 of 1,380', grade: 'A+' },
                      { title: 'Higher Math Calculus Mid', date: '08 Nov 2026', marks: '88 / 100', rank: '#19 of 1,410', grade: 'A+' },
                      { title: 'Biology Botany Chapter-3', date: '01 Nov 2026', marks: '41 / 50', rank: '#42 of 1,350', grade: 'A' },
                    ].map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-5 py-4 font-bold text-slate-900">{r.title}</td>
                        <td className="px-5 py-4 text-slate-500">{r.date}</td>
                        <td className="px-5 py-4 font-extrabold text-indigo-700">{r.marks}</td>
                        <td className="px-5 py-4 font-semibold text-rose-600">{r.rank}</td>
                        <td className="px-5 py-4">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold">
                            {r.grade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        case 'attendance':
          return (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900">Attendance History</h2>
                  <p className="text-sm text-slate-500">November 2026 — Overall Attendance: 92.5%</p>
                </div>
                <span className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-sm">
                  37 Present • 2 Late • 1 Absent
                </span>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-sm">
                {[
                  { date: '24 Nov 2026', subject: 'Physics — Vector & Dynamics', time: '08:30 AM', status: 'Present' },
                  { date: '23 Nov 2026', subject: 'Chemistry — Chemical Bonding', time: '08:30 AM', status: 'Present' },
                  { date: '21 Nov 2026', subject: 'Higher Math — Differentiation', time: '08:30 AM', status: 'Late' },
                  { date: '19 Nov 2026', subject: 'Biology — Cell Division', time: '08:30 AM', status: 'Present' },
                ].map((a, i) => (
                  <div key={i} className="p-4 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{a.subject}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {a.date} • {a.time}
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                        a.status === 'Present'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {a.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        case 'fees':
          return (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">Fees & Payment Receipts</h2>
                <p className="text-sm text-slate-500">View monthly tuition invoices and download receipts.</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <div className="text-xs font-bold text-slate-500 uppercase">Total Paid (2026)</div>
                  <div className="text-3xl font-extrabold text-emerald-600 mt-1">৳ 24,000</div>
                </div>
                <div className="bg-white rounded-2xl border border-rose-200 p-5 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-rose-500 uppercase">Current Due</div>
                    <div className="text-3xl font-extrabold text-slate-900 mt-1">৳ 3,000</div>
                  </div>
                  <button
                    onClick={() => showToast('Redirecting to bKash / Nagad payment gateway...', 'info')}
                    className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm"
                  >
                    Pay Now
                  </button>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-sm">
                {[
                  { id: 'RCP-8821', month: 'November 2026 Tuition', amount: '৳ 3,000', status: 'Due' },
                  { id: 'RCP-8410', month: 'October 2026 Tuition', amount: '৳ 3,000', status: 'Paid' },
                  { id: 'RCP-7992', month: 'September 2026 Tuition', amount: '৳ 3,000', status: 'Paid' },
                ].map((f) => (
                  <div key={f.id} className="p-4 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{f.month}</div>
                      <div className="text-xs text-slate-500">Invoice #{f.id}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-slate-900">{f.amount}</span>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          f.status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {f.status}
                      </span>
                      {f.status === 'Paid' && (
                        <button
                          onClick={() => showToast(`Receipt ${f.id} downloaded.`, 'success')}
                          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                          title="Download Receipt"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        case 'complaints':
          return (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">Support & Academic Q&A</h2>
                <p className="text-sm text-slate-500">Submit doubts, material requests, or administrative complaints.</p>
              </div>
              <form
                onSubmit={handleAddComplaint}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3"
              >
                <div className="grid sm:grid-cols-3 gap-3">
                  <select
                    value={newComplaintCategory}
                    onChange={(e) => setNewComplaintCategory(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
                  >
                    <option>Academic</option>
                    <option>Study Material</option>
                    <option>Routine</option>
                    <option>Exam / Result</option>
                  </select>
                  <input
                    type="text"
                    value={newComplaintSubject}
                    onChange={(e) => setNewComplaintSubject(e.target.value)}
                    placeholder="Describe your question or issue..."
                    className="sm:col-span-2 px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm inline-flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Submit Ticket
                </button>
              </form>

              <div className="space-y-3">
                {complaints.map((c) => (
                  <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-bold text-indigo-600">{c.category} • {c.id}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          c.status === 'Resolved'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">{c.subject}</h4>
                    <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-3 rounded-xl">
                      <strong>Admin Reply:</strong> {c.reply}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        default:
          return (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-rose-600 to-indigo-900 rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    SSC 2026 Batch • Section A
                  </span>
                  <h2 className="text-2xl font-extrabold mt-1">Welcome back, Arafat!</h2>
                  <p className="text-sm text-white/80 mt-1">
                    You have 1 Live MCQ Exam available today and 2 upcoming classes.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('exams')}
                  className="px-5 py-3 rounded-xl bg-white text-rose-700 font-extrabold text-sm shadow hover:bg-rose-50 transition shrink-0"
                >
                  Take Live Exam →
                </button>
              </div>

              {/* KPI Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Attendance', val: '92.5%', sub: '+2.1% this month', color: 'text-emerald-600' },
                  { label: 'Avg Exam Score', val: '86.4%', sub: 'Top 5% in Batch', color: 'text-indigo-600' },
                  { label: 'Enrolled Courses', val: '2 Active', sub: 'HSC Full + Model Test', color: 'text-slate-900' },
                  { label: 'Fee Balance', val: '৳ 3,000', sub: 'Due 30 Nov', color: 'text-rose-600' },
                ].map((k) => (
                  <div key={k.label} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                    <div className="text-xs font-bold text-slate-500 uppercase">{k.label}</div>
                    <div className={`text-2xl font-extrabold mt-1 ${k.color}`}>{k.val}</div>
                    <div className="text-xs text-slate-400 mt-1">{k.sub}</div>
                  </div>
                ))}
              </div>

              {/* Performance Analytics Chart + Today's Routine */}
              <div className="grid lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-extrabold text-slate-900">Exam Score Progression</h3>
                      <p className="text-xs text-slate-500">Your Score vs Batch Average (%)</p>
                    </div>
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="h-60 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={STUDENT_PERF_CHART}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="exam" tick={{ fontSize: 12 }} />
                        <YAxis domain={[50, 100]} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="score"
                          name="Your Score"
                          stroke="#e11d48"
                          fill="#ffe4e6"
                          strokeWidth={3}
                        />
                        <Area
                          type="monotone"
                          dataKey="avg"
                          name="Batch Avg"
                          stroke="#4f46e5"
                          fill="#e0e7ff"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-slate-900 mb-3">Today's Class Routine</h3>
                    <div className="space-y-3">
                      {[
                        { time: '03:30 PM', title: 'Physics: Rotational Mechanics', teacher: 'Engr. Mahmudul', room: 'Room 402 / Live' },
                        { time: '05:00 PM', title: 'Higher Math: Integration Tricks', teacher: 'Rakibul Islam', room: 'Room 402 / Live' },
                      ].map((cls, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                          <div className="text-xs font-extrabold text-rose-600">{cls.time}</div>
                          <div className="font-bold text-slate-900 text-sm mt-0.5">{cls.title}</div>
                          <div className="text-xs text-slate-500 mt-1">
                            {cls.teacher} • {cls.room}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => showToast('Weekly routine PDF downloaded.', 'info')}
                    className="mt-4 w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                  >
                    Download Full Weekly Routine
                  </button>
                </div>
              </div>
            </div>
          );
      }
    }

    // ---------------- TEACHER VIEWS ----------------
    if (role === 'teacher') {
      switch (activeTab) {
        case 'attendance':
          return (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900">Mark Class Attendance</h2>
                  <p className="text-sm text-slate-500">
                    HSC 27 Science Pioneer • Physics Lecture #18 (Today)
                  </p>
                </div>
                <button
                  onClick={() =>
                    showToast('Attendance saved! Automated SMS alerts sent to absent guardians.', 'success')
                  }
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm"
                >
                  Save Attendance
                </button>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-sm">
                {roster.map((student) => (
                  <div
                    key={student.id}
                    className="p-4 flex flex-wrap items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{student.name}</div>
                      <div className="text-xs text-slate-500">
                        Roll #{student.roll} • {student.id}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {['Present', 'Late', 'Absent'].map((st) => (
                        <button
                          key={st}
                          onClick={() => updateAttendanceStatus(student.id, st)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition ${
                            student.status === st
                              ? st === 'Present'
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : st === 'Late'
                                ? 'bg-amber-500 text-slate-950 border-amber-500'
                                : 'bg-rose-600 text-white border-rose-600'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        case 'marks':
          return (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900">Marks Entry & Question Bank</h2>
                  <p className="text-sm text-slate-500">
                    Submit marks to Admin Approval Queue or add MCQs to the central bank.
                  </p>
                </div>
                <button
                  onClick={() =>
                    showToast('Marks submitted to Admin Approval Queue!', 'success')
                  }
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm"
                >
                  Submit Batch Marks
                </button>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <h3 className="font-extrabold text-slate-900">Physics Paper-1 Model Test (Out of 100)</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {roster.map((s, i) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200"
                    >
                      <div>
                        <div className="font-bold text-sm text-slate-900">{s.name}</div>
                        <div className="text-xs text-slate-500">Roll #{s.roll}</div>
                      </div>
                      <input
                        type="number"
                        defaultValue={84 + (i % 12)}
                        max={100}
                        min={0}
                        className="w-20 px-3 py-1.5 rounded-lg border border-slate-300 text-center font-extrabold text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        case 'salary':
          return (
            <div className="space-y-6">
              <h2 className="text-2xl font-extrabold text-slate-900">Faculty Salary & Payroll</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <div className="text-xs font-bold text-slate-500 uppercase">Classes Taken (Nov)</div>
                  <div className="text-3xl font-extrabold text-slate-900 mt-1">32 Lectures</div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <div className="text-xs font-bold text-slate-500 uppercase">Rate / Lecture</div>
                  <div className="text-3xl font-extrabold text-indigo-600 mt-1">৳ 1,800</div>
                </div>
                <div className="bg-white rounded-2xl border border-emerald-200 p-5 shadow-sm">
                  <div className="text-xs font-bold text-emerald-600 uppercase">Net Payable</div>
                  <div className="text-3xl font-extrabold text-emerald-700 mt-1">৳ 57,600</div>
                </div>
              </div>
            </div>
          );
        default:
          return (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase text-amber-300">Faculty Portal</span>
                  <h2 className="text-2xl font-extrabold mt-1">Welcome, Engr. Mahmudul Hasan</h2>
                  <p className="text-sm text-white/80 mt-1">
                    You have 2 scheduled lectures today and 1 marks sheet ready for submission.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('attendance')}
                  className="px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm"
                >
                  Take Attendance Now
                </button>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <div className="text-xs font-bold text-slate-500 uppercase">Assigned Batches</div>
                  <div className="text-2xl font-extrabold text-slate-900 mt-1">4 Batches</div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <div className="text-xs font-bold text-slate-500 uppercase">MCQ Questions Added</div>
                  <div className="text-2xl font-extrabold text-indigo-600 mt-1">184 Questions</div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <div className="text-xs font-bold text-slate-500 uppercase">Nov Est. Salary</div>
                  <div className="text-2xl font-extrabold text-emerald-600 mt-1">৳ 57,600</div>
                </div>
              </div>
            </div>
          );
      }
    }

    // ---------------- ADMIN VIEWS ----------------
    switch (activeTab) {
      case 'approvals':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">Results Approval Queue</h2>
              <p className="text-sm text-slate-500">
                Verify teacher-submitted exam marks before publishing to students and triggering SMS alerts.
              </p>
            </div>
            <div className="space-y-3">
              {approvalQueue.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400">{item.id}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          item.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-slate-900 mt-1">{item.exam}</h4>
                    <div className="text-xs text-slate-500 mt-1">
                      By {item.teacher} • {item.batch} • {item.studentsCount} Students • Avg:{' '}
                      <strong>{item.avgScore}</strong>
                    </div>
                  </div>
                  {item.status === 'Pending' ? (
                    <button
                      onClick={() => handleApproveResult(item.id)}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shrink-0"
                    >
                      Approve & Publish
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                      <CheckCircle2 className="w-4 h-4" /> Published
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      case 'academics':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-extrabold text-slate-900">Active Courses & Batches</h2>
              <button
                onClick={() => showToast('New course creation wizard ready.', 'info')}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-sm inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Course
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {PROGRAMS_DATA.slice(0, 4).map((p) => (
                <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold">
                      {p.category}
                    </span>
                    <span className="text-xs font-bold text-slate-500">{p.modeLabel}</span>
                  </div>
                  <h4 className="font-extrabold text-slate-900">{p.title}</h4>
                  <div className="text-xs text-slate-500 mt-2">
                    Routine: {p.routine} • Fee: <strong>{p.fee}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'finance':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-extrabold text-slate-900">Finance & Revenue Overview</h2>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4">Revenue vs Expenditure (in Thousand ৳)</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ADMIN_FINANCE_CHART}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" name="Fee Revenue (k)" fill="#e11d48" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="expense" name="Expenses (k)" fill="#1e293b" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Students', val: '1,420', sub: '+84 this month', color: 'text-slate-900' },
                { label: 'Active Teachers', val: '46', sub: '12 BUET • 14 DMC • 20 DU', color: 'text-indigo-600' },
                { label: 'Nov Revenue', val: '৳ 7.20L', sub: '94% collection rate', color: 'text-emerald-600' },
                {
                  label: 'Pending Approvals',
                  val: approvalQueue.filter((a) => a.status === 'Pending').length,
                  sub: 'Result batches waiting',
                  color: 'text-rose-600',
                },
              ].map((k) => (
                <div key={k.label} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <div className="text-xs font-bold text-slate-500 uppercase">{k.label}</div>
                  <div className={`text-2xl font-extrabold mt-1 ${k.color}`}>{k.val}</div>
                  <div className="text-xs text-slate-400 mt-1">{k.sub}</div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-extrabold text-slate-900">Monthly Financial Growth (৳ in Thousands)</h3>
                  <p className="text-xs text-slate-500">Live summary across all Biddyangon batches</p>
                </div>
                <button
                  onClick={() => setActiveTab('approvals')}
                  className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 font-bold text-xs hover:bg-rose-100"
                >
                  Review Results Queue →
                </button>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ADMIN_FINANCE_CHART}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" name="Revenue (k)" fill="#e11d48" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="expense" name="Expenses (k)" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-68 bg-slate-950 text-slate-200 flex-col justify-between p-5 shrink-0">
        <div className="space-y-6">
          <BrandLogo dark onClick={onLogout} />

          {/* Quick Role Switcher for Demo */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1.5">
              Switch Portal Role
            </div>
            <div className="grid grid-cols-3 gap-1">
              {['student', 'teacher', 'admin'].map((r) => (
                <button
                  key={r}
                  onClick={() => handleRoleChange(r)}
                  className={`py-1.5 rounded-lg text-[11px] font-bold capitalize transition ${
                    role === r
                      ? 'bg-rose-600 text-white'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <nav className="space-y-1.5">
            {navConfig[role].map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${
                    active
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-rose-600/20 border border-rose-500/30 text-rose-400 font-extrabold text-xs flex items-center justify-center">
              {userProfile.initials}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">{userProfile.name}</div>
              <div className="text-[11px] text-slate-400 truncate">{userProfile.sub}</div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            <LogOut className="w-4 h-4" />
            Back to Public Homepage
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Portal Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-700"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 capitalize">
                {role} Portal
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                Biddyangon Unified Coaching Management System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onLogout}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              Homepage
            </button>
          </div>
        </header>

        {/* Mobile Portal Sidebar Drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div className="w-72 bg-slate-950 text-white p-5 flex flex-col justify-between shadow-2xl">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <BrandLogo dark onClick={onLogout} />
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-1.5 rounded-lg bg-slate-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-xl">
                  {['student', 'teacher', 'admin'].map((r) => (
                    <button
                      key={r}
                      onClick={() => handleRoleChange(r)}
                      className={`py-1.5 rounded-lg text-xs font-bold capitalize ${
                        role === r ? 'bg-rose-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <nav className="space-y-1.5">
                  {navConfig[role].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold ${
                          activeTab === item.id
                            ? 'bg-rose-600 text-white'
                            : 'text-slate-400 hover:bg-slate-900'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </button>
                    );
                  })}
                </nav>
              </div>
              <button
                onClick={onLogout}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-slate-300 text-xs font-bold"
              >
                Back to Homepage
              </button>
            </div>
            <div
              className="flex-1 bg-slate-950/60"
              onClick={() => setSidebarOpen(false)}
            />
          </div>
        )}

        <main className="p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

// ============================================================================
// 7. MAIN ROOT APP COMPONENT
// ============================================================================

export default function App() {
  const [view, setView] = useState('public'); // 'public' | 'portal'
  const [portalRole, setPortalRole] = useState('student');
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginInitialRole, setLoginInitialRole] = useState('student');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  };

  const handleOpenLogin = (role = 'student') => {
    setLoginInitialRole(role);
    setLoginModalOpen(true);
  };

  const handleLoginSuccess = (role) => {
    setPortalRole(role);
    setLoginModalOpen(false);
    setView('portal');
    showToast(`Signed in to Biddyangon ${role.toUpperCase()} Portal!`, 'success');
  };

  const handleEnrollProgram = (program) => {
    showToast(
      `Selected "${program.title}". Sign in to complete your enrollment!`,
      'success'
    );
    handleOpenLogin('student');
  };

  return (
    <div className="font-sans antialiased selection:bg-rose-600 selection:text-white">
      {view === 'public' ? (
        <PublicHomePage
          onOpenLogin={handleOpenLogin}
          onEnrollProgram={handleEnrollProgram}
          showToast={showToast}
        />
      ) : (
        <CoachingPortal
          role={portalRole}
          onSwitchRole={(r) => {
            setPortalRole(r);
            showToast(`Switched preview to ${r.toUpperCase()} Portal`, 'info');
          }}
          onLogout={() => setView('public')}
          showToast={showToast}
        />
      )}

      {loginModalOpen && (
        <LoginModal
          initialRole={loginInitialRole}
          onClose={() => setLoginModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      <ToastBanner toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
