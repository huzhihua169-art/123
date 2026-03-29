import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Menu,
  ChevronRight, 
  ChevronDown,
  ArrowRight, 
  Gem, 
  Palette, 
  Heart, 
  BookOpen, 
  Briefcase, 
  Smile,
  RefreshCw,
  Download,
  Share2,
  Trash2,
  ShoppingCart,
  Send,
  MessageSquare,
  ArrowLeft,
  ArrowUp,
  TreePine,
  Flame,
  Mountain,
  Droplets,
  Diamond,
  Star,
  ChevronLeft,
  Wind,
  ShoppingBag,
  History,
  CreditCard,
  CheckCircle2,
  LogOut,
  X
} from 'lucide-react';
import { cn } from './lib/utils';
import { generateBaziReport, chatWithMaster, ChatMessage } from './services/qwen';
import ReactMarkdown from 'react-markdown';

// --- Types ---
type Step = 'intro' | 'troubles' | 'birth-info' | 'generating' | 'report' | 'diy' | 'shop' | 'chat' | 'cart' | 'orders' | 'profile';

interface ReportHistoryItem {
  id: string;
  date: string;
  report: BaziReport;
  userData: UserData;
}

interface CartItem {
  id: string;
  name: string;
  customName?: string;
  price: number;
  image: string;
  type: 'artifact' | 'diy';
  element?: string;
  details?: string;
  quantity: number;
}

interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'shipped' | 'delivered';
}

interface UserData {
  name: string;
  email: string;
  gender: string;
  birthDate: string;
  birthTime: string;
  troubles: string;
}

interface BaziReport {
  summary: string;
  elements: {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
  };
  guidance: string;
  recommendations: {
    crystals: string[];
    crystalDetails: {
      name: string;
      properties: string;
      connection: string;
    }[];
    jewelry: string[];
    luckyColors: string[];
    wristbands: string[];
    reasoning: string;
  };
}

// --- Components ---

const Header = ({ onNav, currentStep, cartCount }: { onNav: (step: Step) => void, currentStep: Step, cartCount: number }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: 'troubles', label: 'Heal', activeSteps: ['troubles', 'chat'] },
    { id: 'intro', label: 'Bazi', activeSteps: ['intro'] },
    { id: 'shop', label: 'Crystals', activeSteps: ['shop', 'diy'] },
    { id: 'orders', label: 'Orders', activeSteps: ['orders'] },
  ];

  const handleNav = (id: string) => {
    onNav(id as Step);
    setIsMenuOpen(false);
  };

  return (
    <header className="w-full py-3 md:py-6 px-4 md:px-8 flex justify-between items-center bg-white/40 backdrop-blur-md sticky top-0 z-50 border-b border-moss/5">
      <div className="flex items-center gap-2 md:gap-3 cursor-pointer group" onClick={() => onNav('intro')}>
        <div className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-aura-gold/20 flex items-center justify-center group-hover:bg-aura-gold/30 transition-all">
          <Sparkles className="w-4 h-4 md:w-6 md:h-6 text-aura-gold" />
        </div>
        <div className="font-serif text-lg md:text-2xl font-bold tracking-tight text-ink-black">
          The Aura Lab
        </div>
      </div>

      {/* Desktop Nav */}
      <nav className="hidden md:flex gap-10 text-sm text-moss font-medium">
        {navItems.map((item) => (
          <button 
            key={item.id}
            onClick={() => onNav(item.id as Step)} 
            className={cn(
              "transition-all hover:text-aura-gold relative py-2", 
              item.activeSteps.includes(currentStep) && "text-ink-black"
            )}
          >
            {item.label}
            {item.activeSteps.includes(currentStep) && (
              <motion.div layoutId="nav-active" className="absolute bottom-0 left-0 w-full h-0.5 bg-aura-gold" />
            )}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-2 md:gap-4">
        <button 
          onClick={() => onNav('cart')}
          className="relative w-9 h-9 md:w-10 md:h-10 rounded-full bg-moss/5 border border-moss/10 flex items-center justify-center text-moss hover:bg-aura-gold hover:text-white hover:border-aura-gold transition-all shadow-sm group"
        >
          <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-aura-gold text-white text-[8px] font-bold rounded-full flex items-center justify-center border border-white shadow-sm">
              {cartCount}
            </span>
          )}
        </button>
        <button 
          onClick={() => onNav('profile')}
          className={cn(
            "w-9 h-9 md:w-10 md:h-10 rounded-full bg-moss/5 border border-moss/10 flex items-center justify-center text-moss hover:bg-aura-gold hover:text-white hover:border-aura-gold transition-all shadow-sm group",
            currentStep === 'profile' && "bg-aura-gold text-white border-aura-gold"
          )}
        >
          <User className="w-4 h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
        </button>
        
        {/* Mobile Menu Toggle */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden w-9 h-9 rounded-full bg-moss/5 border border-moss/10 flex items-center justify-center text-moss"
        >
          {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-ink-black/20 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 w-full bg-white/95 backdrop-blur-2xl border-b border-moss/10 py-8 px-6 flex flex-col gap-3 shadow-2xl z-50 md:hidden rounded-b-[2rem]"
            >
              <div className="text-[10px] text-moss/40 uppercase tracking-[0.3em] font-bold mb-2 px-4">Navigation</div>
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={cn(
                    "text-left py-4 px-6 rounded-2xl text-xs font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-between group",
                    item.activeSteps.includes(currentStep) 
                      ? "bg-aura-gold text-white shadow-lg shadow-aura-gold/20" 
                      : "text-moss hover:bg-moss/5"
                  )}
                >
                  {item.label}
                  {item.activeSteps.includes(currentStep) ? (
                    <Sparkles className="w-4 h-4 text-white/50" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-moss/20 group-hover:text-aura-gold/40 transition-colors" />
                  )}
                </button>
              ))}
              <div className="mt-4 pt-6 border-t border-moss/5 flex justify-center gap-8">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-full bg-moss/5 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4 text-moss/40" />
                  </div>
                  <span className="text-[8px] text-moss/40 uppercase tracking-widest font-bold">Shop</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-full bg-moss/5 flex items-center justify-center">
                    <User className="w-4 h-4 text-moss/40" />
                  </div>
                  <span className="text-[8px] text-moss/40 uppercase tracking-widest font-bold">Profile</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

const Footer = () => (
  <footer className="py-10 md:py-16 border-t border-moss/10 bg-white/50 backdrop-blur-sm relative z-10">
    <div className="max-w-7xl mx-auto px-4 md:px-6">
      <div className="flex flex-col items-center justify-center space-y-6 md:space-y-8">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-8 md:w-12 h-px bg-aura-gold/30" />
          <span className="text-aura-gold font-serif italic text-lg md:text-xl tracking-wide">Aura Lab</span>
          <div className="w-8 md:w-12 h-px bg-aura-gold/30" />
        </div>
        
        <p className="text-[8px] md:text-[9px] text-moss/40 uppercase tracking-[0.3em] md:tracking-[0.5em] font-bold text-center max-w-3xl leading-loose px-4">
          FOR ENTERTAINMENT AND PSYCHOLOGICAL COMFORT PURPOSES ONLY. YOUR DESTINY IS SHAPED BY YOUR ACTIONS AS MUCH AS THE STARS.
        </p>
        
        <div className="flex flex-col items-center gap-3 md:gap-2">
          <div className="text-[9px] md:text-[10px] text-moss/30 font-mono tracking-widest uppercase">
            © 2026 AURA LAB • CELESTIAL ALIGNMENT
          </div>
          <div className="flex gap-4 md:gap-6 text-[9px] md:text-[10px] text-moss/40 uppercase tracking-widest">
            <a href="#" className="hover:text-aura-gold transition-colors">Privacy</a>
            <a href="#" className="hover:text-aura-gold transition-colors">Terms</a>
            <a href="#" className="hover:text-aura-gold transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </div>
  </footer>
);

const DailyDraw = () => {
  const [drawn, setDrawn] = useState(false);
  const [card, setCard] = useState<{title: string, message: string, element: string} | null>(null);

  const drawCard = () => {
    const cards = [
      { title: "The Flowing Water", message: "Today, practice non-resistance. Let things slide off you like water over a smooth stone. Your power lies in adaptability.", element: "Water" },
      { title: "The Rooted Tree", message: "Ground yourself. Before making any big decisions today, take three deep breaths and feel your feet on the earth.", element: "Wood" },
      { title: "The Quiet Spark", message: "You don't need to roar to be heard. A small, consistent effort today will ignite a larger transformation tomorrow.", element: "Fire" },
      { title: "The Still Mountain", message: "Boundaries are your friend today. It is okay to say no and protect your peace. Be immovable in your values.", element: "Earth" },
      { title: "The Polished Mirror", message: "Clarity is coming. Take time to declutter your physical or mental space to make room for new insights.", element: "Metal" }
    ];
    setCard(cards[Math.floor(Math.random() * cards.length)]);
    setDrawn(true);
  };

  return (
    <div className="bg-white/90 backdrop-blur-2xl rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 shadow-2xl border border-white/60 text-center relative overflow-hidden max-w-md mx-auto w-full group transition-all duration-500 hover:shadow-[0_40px_80px_rgba(0,0,0,0.1)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(197,160,89,0.15),_transparent_70%)]" />
      <div className="absolute inset-0 concentric-circles group-hover:scale-110 transition-transform duration-1000 opacity-40" />
      <div className="absolute top-0 right-0 w-32 md:w-48 h-32 md:h-48 bg-aura-gold/15 rounded-full blur-2xl md:blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 md:w-48 h-32 md:h-48 bg-serene-blue/15 rounded-full blur-2xl md:blur-3xl pointer-events-none" />
      
      <div className="relative z-10 space-y-2 md:space-y-3 mb-8 md:mb-10">
        <div className="w-16 h-16 md:w-20 md:h-20 bg-aura-gold/15 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 aura-glow shadow-lg">
          <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-aura-gold animate-pulse" />
        </div>
        <h3 className="text-2xl md:text-3xl font-serif text-ink-black tracking-tight leading-tight">Daily Energy <span className="italic">Draw</span></h3>
        <p className="text-[9px] md:text-[10px] text-moss uppercase tracking-[0.3em] md:tracking-[0.4em] font-bold opacity-60">Tune into your resonance</p>
      </div>
      
      {!drawn ? (
        <button 
          onClick={drawCard}
          className="relative z-10 bg-aura-gold text-white px-10 md:px-14 py-4 md:py-6 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] hover:bg-ink-black hover:scale-105 transition-all rounded-full shadow-[0_20px_40px_rgba(197,160,89,0.4)] border border-white/30 active:scale-95"
        >
          Draw Your Card
        </button>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative z-10 bg-white/70 p-6 md:p-10 rounded-[1.5rem] md:rounded-[2rem] border border-white/60 backdrop-blur-md shadow-inner space-y-4 md:space-y-6"
        >
          <div className="flex items-center justify-center gap-3 md:gap-4">
            <div className="h-px w-8 md:w-10 bg-aura-gold/20" />
            <span className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em] text-aura-gold font-bold">{card?.element} Energy</span>
            <div className="h-px w-8 md:w-10 bg-aura-gold/20" />
          </div>
          <h4 className="text-xl md:text-2xl font-serif text-ink-black tracking-tight">{card?.title}</h4>
          <p className="text-sm md:text-base text-moss italic leading-relaxed font-light">"{card?.message}"</p>
          <div className="pt-6 md:pt-8 border-t border-moss/10">
            <button onClick={() => setDrawn(false)} className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] text-moss/40 hover:text-aura-gold transition-colors font-bold">Draw Again Tomorrow</button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

const CommunityStories = () => (
  <section className="py-16 md:py-24 border-t border-moss/10">
    <div className="text-center mb-12 md:mb-20 space-y-3 md:space-y-4 px-4">
      <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] md:tracking-[0.5em] text-aura-gold">The Collective</span>
      <h2 className="text-3xl md:text-5xl font-serif text-ink-black tracking-tight">Manifestation <span className="italic">Stories</span></h2>
      <p className="text-moss max-w-xl mx-auto text-sm md:text-base font-light">Real energy shifts from our global community.</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 px-4 md:px-0">
      {[
        { name: "Elena, 23", location: "London", story: "The AI master told me my fire element was overwhelming my water. I customized an Aquamarine bracelet and the anxiety has genuinely softened. It's my daily anchor.", image: "https://picsum.photos/seed/elena/400/400" },
        { name: "Marcus, 26", location: "New York", story: "I was super skeptical about Bazi, but the reading was scarily accurate about my career burnout. The 'Still Mountain' intention setting ritual changed my mornings.", image: "https://picsum.photos/seed/marcus/400/400" },
        { name: "Chloe, 21", location: "Sydney", story: "Obsessed with the aesthetic. It doesn't look like typical 'spiritual' jewelry. It's chic, and knowing it's balanced for my specific energy makes it feel so special.", image: "https://picsum.photos/seed/chloe/400/400" }
      ].map((review, i) => (
        <div key={i} className="bg-white/90 backdrop-blur-md p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-xl border border-white/60 hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-aura-gold/10 rounded-full blur-2xl md:blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50" />
          <div className="flex items-center gap-4 md:gap-6 mb-6 md:mb-8 relative z-10">
            <div className="relative">
              <img src={review.image} alt={review.name} className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 border-2 md:border-4 border-white shadow-lg" referrerPolicy="no-referrer" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-aura-gold rounded-full flex items-center justify-center border-2 border-white shadow-md">
                <Heart className="w-2.5 h-2.5 md:w-3 md:h-3 text-white fill-current" />
              </div>
            </div>
            <div>
              <h4 className="text-base md:text-lg font-bold text-ink-black tracking-tight">{review.name}</h4>
              <span className="text-[9px] md:text-[10px] text-moss uppercase tracking-[0.2em] md:tracking-[0.3em] font-bold opacity-60">{review.location}</span>
            </div>
          </div>
          <p className="text-sm md:text-base text-moss italic leading-relaxed relative z-10 font-light">"{review.story}"</p>
        </div>
      ))}
    </div>
  </section>
);

const UserProfile = ({ 
  userData, 
  orders, 
  sharedCreations, 
  reportHistory,
  onNav,
  onViewReport,
  onLogout
}: { 
  userData: UserData, 
  orders: Order[], 
  sharedCreations: any[], 
  reportHistory: ReportHistoryItem[],
  onNav: (step: Step) => void,
  onViewReport: (report: BaziReport, data: UserData) => void,
  onLogout: () => void
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'creations' | 'reports'>('overview');

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="glass-card p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] flex flex-col md:flex-row items-center gap-6 sm:gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-aura-gold/5 rounded-full blur-2xl sm:blur-3xl -mr-24 sm:-mr-32 -mt-24 sm:-mt-32" />
        
        <div className="relative">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-aura-gold/10 border-4 border-white flex items-center justify-center shadow-xl overflow-hidden group">
            <User className="w-12 h-12 sm:w-16 sm:h-16 text-aura-gold group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
              <span className="text-white text-[8px] sm:text-[10px] font-bold uppercase tracking-widest">Edit</span>
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full shadow-lg flex items-center justify-center border border-moss/5">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-aura-gold" />
          </div>
        </div>

        <div className="text-center md:text-left space-y-2 flex-grow">
          <h2 className="text-3xl sm:text-4xl font-serif text-ink-black tracking-tight">
            {userData.name || "Aura Seeker"}
          </h2>
          <p className="text-moss/60 text-xs sm:text-sm font-medium tracking-wide uppercase">
            {userData.email || "Connect your spirit"}
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-2 sm:gap-3 pt-2 sm:pt-4">
            <span className="px-3 sm:px-4 py-1 sm:py-1.5 bg-moss/5 rounded-full text-[8px] sm:text-[10px] font-bold text-moss uppercase tracking-widest border border-moss/10">
              {userData.gender || "Unknown"}
            </span>
            <span className="px-3 sm:px-4 py-1 sm:py-1.5 bg-moss/5 rounded-full text-[8px] sm:text-[10px] font-bold text-moss uppercase tracking-widest border border-moss/10">
              {userData.birthDate || "No Birth Date"}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:gap-3 w-full md:w-auto md:min-w-[160px]">
          <button 
            onClick={() => onNav('intro')}
            className="w-full py-3 bg-aura-gold text-white rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-aura-gold/20 hover:scale-105 transition-transform"
          >
            New Reading
          </button>
          <button 
            onClick={() => onNav('diy')}
            className="w-full py-3 bg-white border border-moss/10 text-moss rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-moss/5 transition-colors"
          >
            DIY Studio
          </button>
          <button 
            onClick={onLogout}
            className="w-full py-3 bg-white border border-moss/10 text-moss/40 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-3 h-3" /> Sign Out
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-start sm:justify-center gap-4 sm:gap-8 border-b border-moss/10 pb-2 sm:pb-4 overflow-x-auto scrollbar-hide">
        {[
          { id: 'overview', label: 'Overview', icon: User },
          { id: 'orders', label: 'Orders', icon: ShoppingBag },
          { id: 'creations', label: 'Creations', icon: Palette },
          { id: 'reports', label: 'Reports', icon: BookOpen }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest transition-all relative py-2 whitespace-nowrap",
              activeTab === tab.id ? "text-aura-gold" : "text-moss/40 hover:text-moss"
            )}
          >
            <tab.icon className="w-3 h-3 sm:w-4 sm:h-4" />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div layoutId="profile-tab" className="absolute bottom-0 left-0 w-full h-0.5 bg-aura-gold" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="glass-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-3 sm:space-y-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-aura-gold/10 rounded-lg sm:rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-aura-gold" />
              </div>
              <div>
                <p className="text-[8px] sm:text-[10px] text-moss/40 font-bold uppercase tracking-widest">Total Orders</p>
                <p className="text-xl sm:text-2xl font-serif text-ink-black">{orders.length}</p>
              </div>
            </div>
            <div className="glass-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-3 sm:space-y-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-aura-gold/10 rounded-lg sm:rounded-xl flex items-center justify-center">
                <Palette className="w-4 h-4 sm:w-5 sm:h-5 text-aura-gold" />
              </div>
              <div>
                <p className="text-[8px] sm:text-[10px] text-moss/40 font-bold uppercase tracking-widest">Creations</p>
                <p className="text-xl sm:text-2xl font-serif text-ink-black">{sharedCreations.length}</p>
              </div>
            </div>
            <div className="glass-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-3 sm:space-y-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-aura-gold/10 rounded-lg sm:rounded-xl flex items-center justify-center">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-aura-gold" />
              </div>
              <div>
                <p className="text-[8px] sm:text-[10px] text-moss/40 font-bold uppercase tracking-widest">Reports</p>
                <p className="text-xl sm:text-2xl font-serif text-ink-black">{reportHistory.length}</p>
              </div>
            </div>
            
            <div className="sm:col-span-2 md:col-span-3 glass-card p-6 sm:p-8 rounded-2xl sm:rounded-3xl space-y-4 sm:space-y-6">
              <h4 className="text-base sm:text-lg font-serif text-ink-black">Recent Energy Insights</h4>
              {reportHistory.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {reportHistory.slice(0, 2).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 sm:p-4 bg-moss/5 rounded-xl sm:rounded-2xl border border-moss/5">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg sm:rounded-xl flex items-center justify-center shadow-sm">
                          <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-aura-gold" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-ink-black">Reading from {item.date}</p>
                          <p className="text-[8px] sm:text-[10px] text-moss/40 font-bold uppercase tracking-widest">Focus: {item.userData.troubles}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => onViewReport(item.report, item.userData)}
                        className="p-2 hover:bg-white rounded-full transition-colors text-aura-gold"
                      >
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12 space-y-3 sm:space-y-4">
                  <p className="text-xs sm:text-sm text-moss/40 italic">No energy insights found yet.</p>
                  <button onClick={() => onNav('intro')} className="text-[8px] sm:text-[10px] font-bold text-aura-gold uppercase tracking-widest hover:underline">Start your first reading</button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            {orders.length > 0 ? (
              orders.map((order) => (
                <div key={order.id} className="glass-card p-6 rounded-3xl space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] text-moss/40 font-bold uppercase tracking-widest">Order ID</p>
                      <p className="text-sm font-medium text-ink-black">{order.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-moss/40 font-bold uppercase tracking-widest">Status</p>
                      <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-widest rounded-full border border-green-100">
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="min-w-[80px] space-y-2">
                        <div className="w-20 h-20 bg-moss/5 rounded-2xl flex items-center justify-center p-2">
                          <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                        </div>
                        <p className="text-[8px] font-bold text-moss uppercase tracking-widest truncate w-20">{item.name}</p>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-moss/5 flex justify-between items-center">
                    <p className="text-xs text-moss/60">{order.date}</p>
                    <p className="text-lg font-serif text-ink-black">¥{order.total}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 glass-card rounded-3xl">
                <ShoppingBag className="w-12 h-12 text-moss/10 mx-auto mb-4" />
                <p className="text-sm text-moss/40 italic">Your order history is empty.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'creations' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {sharedCreations.length > 0 ? (
              sharedCreations.map((creation, idx) => (
                <div key={idx} className="glass-card p-4 rounded-3xl space-y-3 group cursor-pointer hover:scale-[1.02] transition-transform">
                  <div className="aspect-square bg-moss/5 rounded-2xl flex items-center justify-center p-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-aura-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <img src={creation.image} alt={creation.name} className="w-full h-full object-contain relative z-10" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-ink-black uppercase tracking-widest truncate">{creation.name}</p>
                    <p className="text-[8px] text-moss/40 font-bold uppercase tracking-[0.2em]">{creation.author}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-20 glass-card rounded-3xl">
                <Palette className="w-12 h-12 text-moss/10 mx-auto mb-4" />
                <p className="text-sm text-moss/40 italic">No creations saved yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-4">
            {reportHistory.length > 0 ? (
              reportHistory.map((item) => (
                <div key={item.id} className="glass-card p-6 rounded-3xl flex items-center justify-between group hover:bg-white/60 transition-colors">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-aura-gold/10 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <BookOpen className="w-7 h-7 text-aura-gold" />
                    </div>
                    <div>
                      <h5 className="text-lg font-serif text-ink-black">Energy Reading</h5>
                      <div className="flex gap-4 items-center">
                        <p className="text-[10px] text-moss/40 font-bold uppercase tracking-widest">{item.date}</p>
                        <span className="w-1 h-1 bg-moss/20 rounded-full" />
                        <p className="text-[10px] text-moss/40 font-bold uppercase tracking-widest">{item.userData.troubles}</p>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => onViewReport(item.report, item.userData)}
                    className="px-6 py-2 bg-moss/5 hover:bg-aura-gold hover:text-white rounded-full text-[10px] font-bold uppercase tracking-widest transition-all"
                  >
                    View Full Report
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-20 glass-card rounded-3xl">
                <BookOpen className="w-12 h-12 text-moss/10 mx-auto mb-4" />
                <p className="text-sm text-moss/40 italic">No reports generated yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const CommunityGallery = ({ creations, onNav }: { creations: any[], onNav: (step: Step) => void }) => (
  <section className="py-16 md:py-24 border-t border-moss/10 px-4 md:px-0">
    <div className="text-center mb-12 md:mb-20 space-y-3 md:space-y-4">
      <span className="text-[10px] font-bold uppercase tracking-[0.4em] md:tracking-[0.5em] text-aura-gold">Community Creations</span>
      <h2 className="text-3xl md:text-5xl font-serif text-ink-black tracking-tight">The <span className="italic">Gallery</span> of Light</h2>
      <p className="text-moss max-w-xl mx-auto text-sm md:text-base font-light px-4">Explore unique energy conduits crafted by our global community.</p>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
      {creations.map((creation) => (
        <div key={creation.id} className="bg-white/80 backdrop-blur-md p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-lg border border-white/60 hover:shadow-2xl transition-all duration-500 group">
          <div className="aspect-square rounded-full bg-moss/5 mb-6 md:mb-8 relative overflow-hidden flex items-center justify-center border-4 border-white shadow-inner">
            <div className="absolute inset-0 bg-gradient-to-tr from-aura-gold/10 to-transparent" />
            <img 
              src={`https://picsum.photos/seed/${creation.id}/300/300`} 
              alt={creation.name} 
              className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" 
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-3 md:px-4 py-1 rounded-full text-[7px] md:text-[8px] font-bold uppercase tracking-widest text-aura-gold shadow-sm">
              {creation.element}
            </div>
          </div>
          <div className="text-center space-y-2">
            <h4 className="text-base md:text-lg font-serif text-ink-black tracking-tight">{creation.name}</h4>
            <button 
              onClick={() => onNav('diy')}
              className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-bold text-moss hover:text-aura-gold transition-colors flex items-center gap-2 mx-auto"
            >
              Remix Design <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      ))}
      <div 
        onClick={() => onNav('diy')}
        className="bg-aura-gold/5 border-2 border-dashed border-aura-gold/20 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 flex flex-col items-center justify-center text-center gap-3 md:gap-4 cursor-pointer hover:bg-aura-gold/10 transition-all group min-h-[250px] md:min-h-0"
      >
        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
          <Palette className="w-6 h-6 md:w-8 md:h-8 text-aura-gold" />
        </div>
        <div className="space-y-1">
          <p className="text-sm md:text-base font-serif italic text-ink-black">Create Your Own</p>
          <p className="text-[7px] md:text-[8px] uppercase tracking-widest text-moss font-bold opacity-60">Manifest your energy</p>
        </div>
      </div>
    </div>
  </section>
);

const ShareModal = ({ isOpen, onClose, creationName }: { isOpen: boolean, onClose: () => void, creationName: string }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-ink-black/60 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 shadow-2xl text-center space-y-6 md:space-y-8"
        >
          <button onClick={onClose} className="absolute top-6 md:top-8 right-6 md:right-8 text-moss/40 hover:text-ink-black transition-colors">
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <div className="w-20 h-20 bg-aura-gold/10 rounded-full flex items-center justify-center mx-auto">
            <Share2 className="w-10 h-10 text-aura-gold" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-serif text-ink-black">Share "{creationName}"</h3>
            <p className="text-xs text-moss uppercase tracking-widest font-bold opacity-60">Inspire others with your energy</p>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {[
              { name: 'Instagram', icon: '📸' },
              { name: 'TikTok', icon: '🎵' },
              { name: 'Pinterest', icon: '📌' },
              { name: 'WeChat', icon: '💬' },
              { name: 'Xiaohongshu', icon: '📕' },
              { name: 'Copy Link', icon: '🔗' }
            ].map((platform) => (
              <button key={platform.name} className="flex flex-col items-center gap-3 group">
                <div className="w-14 h-14 rounded-2xl bg-moss/5 flex items-center justify-center text-2xl group-hover:bg-aura-gold/10 group-hover:scale-110 transition-all">
                  {platform.icon}
                </div>
                <span className="text-[8px] font-bold uppercase tracking-widest text-moss group-hover:text-aura-gold transition-colors">{platform.name}</span>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-moss/40 italic font-serif">"Your light, when shared, illuminates the world."</p>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const BraceletBuilder = ({ recommendedElement, onAddToCart, onShare }: { recommendedElement?: string, onAddToCart: (item: Omit<CartItem, 'quantity'>) => void, onShare?: (creation: any) => void }) => {
  const [beads, setBeads] = useState<{ id: number; color: string; type: string; price: number, name: string }[]>([]);
  const [customName, setCustomName] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [showShareSuccess, setShowShareSuccess] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const beadOptions = [
    { color: '#2d5a27', name: 'Moss Agate', type: 'Wood', price: 10 },
    { color: '#8fb38d', name: 'Sage Jade', type: 'Wood', price: 8 },
    { color: '#f9f8f4', name: 'Rice Paper Pearl', type: 'Metal', price: 12 },
    { color: '#b22c29', name: 'Cinnabar Ink', type: 'Fire', price: 9 },
    { color: '#8B7355', name: 'Earth Ochre', type: 'Earth', price: 7 },
    { color: '#c5a059', name: 'Aura Gold', type: 'Metal', price: 15 },
    { color: '#1a1a1a', name: 'Charcoal Ink', type: 'Water', price: 8 },
    { color: '#4a7c44', name: 'Forest Shadow', type: 'Wood', price: 10 },
    { color: '#fce4ec', name: 'Healing Pink', type: 'Healing', price: 18 },
    { color: '#e1f5fe', name: 'Serene Blue', type: 'Healing', price: 18 },
  ];

  const TEMPLATES: Record<string, { primary: string, secondary: string, desc: string }> = {
    'wood': { primary: 'Moss Agate', secondary: 'Sage Jade', desc: 'Lush greens nourish the soul. This design uses Moss Agate to ground your Wood energy, supported by Sage Jade for continuous growth and vitality.' },
    'fire': { primary: 'Cinnabar Ink', secondary: 'Moss Agate', desc: 'Wood feeds Fire. Cinnabar Ink ignites your passion, while Moss Agate (Wood) provides the steady fuel for a balanced, healing flame.' },
    'earth': { primary: 'Earth Ochre', secondary: 'Cinnabar Ink', desc: 'Fire creates Earth. Earth Ochre grounds your spirit, accented with Cinnabar Ink (Fire) to bring warmth and stability to your foundation.' },
    'metal': { primary: 'Rice Paper Pearl', secondary: 'Earth Ochre', desc: 'Earth bears Metal. Rice Paper Pearl sharpens your focus and clarity, supported by Earth Ochre (Earth) for a solid, abundant foundation.' },
    'water': { primary: 'Charcoal Ink', secondary: 'Rice Paper Pearl', desc: 'Metal enriches Water. Charcoal Ink deepens your intuition and flow, while Rice Paper Pearl (Metal) ensures purity and continuous clarity.' },
  };

  const applyTemplate = (element: string) => {
    const template = TEMPLATES[element] || TEMPLATES['water'];
    const primaryBead = beadOptions.find(b => b.name === template.primary) || beadOptions[0];
    const secondaryBead = beadOptions.find(b => b.name === template.secondary) || beadOptions[1];
    
    // Pattern: 2 Primary, 1 Secondary repeating (18 beads total)
    const initialBeads = Array(18).fill(null).map((_, i) => {
      const isSecondary = (i + 1) % 3 === 0;
      return {
        id: Date.now() + i,
        ...(isSecondary ? secondaryBead : primaryBead)
      };
    });
    setBeads(initialBeads);
  };

  // Auto-fill some beads based on recommendation if empty
  useEffect(() => {
    if (beads.length === 0 && recommendedElement) {
      applyTemplate(recommendedElement.toLowerCase());
    }
  }, [recommendedElement]);

  const addBead = (option: typeof beadOptions[0]) => {
    if (beads.length < 18) {
      setBeads([...beads, { id: Date.now(), ...option }]);
    }
  };

  const removeBead = (id: number) => {
    setBeads(beads.filter(b => b.id !== id));
  };

  const [cleansing, setCleansing] = useState(false);
  const totalPrice = beads.reduce((sum, bead) => sum + bead.price, 0) + 20 + (cleansing ? 15 : 0); // Base price 20

  const handleAddToCart = () => {
    if (beads.length === 0) return;
    
    onAddToCart({
      id: `diy-${Date.now()}`,
      name: customName.trim() || `Custom ${recommendedElement || 'Aura'} Bracelet`,
      customName: customName.trim() || undefined,
      price: totalPrice,
      image: 'diy-bracelet',
      type: 'diy',
      element: recommendedElement?.toLowerCase() || 'balanced'
    });
  };

  const handleShare = () => {
    if (beads.length === 0) return;
    setIsSharing(true);
    
    const creation = {
      id: `shared-${Date.now()}`,
      name: customName.trim() || `Custom ${recommendedElement || 'Aura'} Bracelet`,
      element: recommendedElement?.toLowerCase() || 'balanced',
      beads: [...beads]
    };

    // Simulate sharing process
    setTimeout(() => {
      setIsSharing(false);
      setShowShareSuccess(true);
      if (onShare) onShare(creation);
      setIsShareModalOpen(true);
      setTimeout(() => setShowShareSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div id="diy-section" className="w-full max-w-6xl mx-auto p-6 md:p-16 bg-white/70 backdrop-blur-2xl rounded-[2rem] md:rounded-[3rem] shadow-2xl border border-white/60 relative overflow-hidden">
      <AnimatePresence>
        {cleansing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-white/40 backdrop-blur-sm flex items-center justify-center pointer-events-none"
          >
            <div className="relative">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 3, opacity: [0, 0.5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                  className="absolute inset-0 border-2 border-aura-gold rounded-full"
                />
              ))}
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="bg-white p-6 md:p-8 rounded-full shadow-2xl"
              >
                <Wind className="w-10 h-10 md:w-12 md:h-12 text-aura-gold animate-pulse" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-aura-gold/10 rounded-full blur-3xl pointer-events-none opacity-40" />
      <div className="absolute bottom-0 left-0 w-64 md:w-96 h-64 md:h-96 bg-serene-blue/10 rounded-full blur-3xl pointer-events-none opacity-40" />
      
      <div className="mb-10 md:mb-16 text-center space-y-3 md:space-y-4">
        <span className="text-[10px] font-bold uppercase tracking-[0.4em] md:tracking-[0.5em] text-aura-gold">The Aura Lab</span>
        <h2 className="text-3xl md:text-5xl font-serif text-ink-black tracking-tight">DIY <span className="italic">Studio</span></h2>
        <p className="text-moss text-sm md:text-base font-light max-w-xl mx-auto px-4">Craft your personal energy conduit with sacred geometry and intention.</p>
        
        {recommendedElement && TEMPLATES[recommendedElement] && (
          <div className="mt-8 md:mt-12 p-6 md:p-10 bg-white/50 border border-white/60 rounded-[2rem] md:rounded-[2.5rem] max-w-3xl mx-auto text-left flex flex-col md:flex-row gap-6 md:gap-8 items-start shadow-xl backdrop-blur-xl relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-aura-gold/20 to-serene-blue/20 rounded-[2rem] md:rounded-[2.5rem] blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
            <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-aura-gold/15 flex items-center justify-center flex-shrink-0 shadow-inner">
              <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-aura-gold animate-pulse" />
            </div>
            <div className="relative">
              <h4 className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] text-ink-black mb-2 md:mb-3">AI Master's Recommendation</h4>
              <p className="text-sm md:text-base text-moss leading-relaxed mb-4 md:mb-6 font-light italic">
                {TEMPLATES[recommendedElement].desc}
              </p>
              <div className="flex flex-wrap items-center gap-4 md:gap-6">
                <button 
                  onClick={() => applyTemplate(recommendedElement)}
                  className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] text-moss hover:text-aura-gold transition-all flex items-center gap-2 md:gap-3 bg-white/40 px-4 md:px-6 py-2.5 md:py-3 rounded-full shadow-sm border border-white/60 group"
                >
                  <RefreshCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-700" /> Re-apply AI Template
                </button>
                <span className="text-[9px] md:text-[10px] text-moss/40 uppercase tracking-widest font-bold">Customizable Base</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">
        <ShareModal 
          isOpen={isShareModalOpen} 
          onClose={() => setIsShareModalOpen(false)} 
          creationName={customName.trim() || `Custom ${recommendedElement || 'Aura'} Bracelet`} 
        />
        <div className="relative aspect-square flex flex-col items-center justify-center bg-white/50 rounded-full border border-white/60 shadow-[0_20px_40px_rgba(0,0,0,0.05)] md:shadow-[0_30px_60px_rgba(0,0,0,0.1)] backdrop-blur-xl group">
          {/* Bracelet Circle */}
          <div className="absolute w-[75%] h-[75%] border-2 border-aura-gold/10 rounded-full animate-pulse opacity-50" />
          <div className="absolute w-[80%] h-[80%] border border-moss/5 rounded-full opacity-30" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(197,160,89,0.05),_transparent_70%)]" />
          
          <div className="absolute top-8 md:top-12 left-1/2 -translate-x-1/2 w-full max-w-[120px] md:max-w-[200px] z-20">
            <input 
              type="text" 
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Name your creation..."
              className="w-full bg-transparent border-b border-aura-gold/30 text-center py-1.5 md:py-2 text-[10px] md:text-sm font-serif italic text-ink-black placeholder:text-moss/30 focus:outline-none focus:border-aura-gold transition-all"
            />
          </div>
          
          {beads.map((bead, index) => {
            const angle = (index / beads.length) * 2 * Math.PI;
            const radius = typeof window !== 'undefined' && window.innerWidth < 640 ? 100 : 180; // Responsive radius
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            const beadSize = typeof window !== 'undefined' && window.innerWidth < 640 ? 32 : 56; // Responsive bead size
            
            return (
              <motion.div
                key={bead.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.3, zIndex: 10 }}
                onClick={() => removeBead(bead.id)}
                className="absolute rounded-full shadow-xl md:shadow-2xl cursor-pointer border-2 md:border-4 border-white/60 ink-crystal flex items-center justify-center overflow-hidden group/bead"
                style={{ 
                  backgroundColor: bead.color,
                  width: beadSize,
                  height: beadSize,
                  left: `calc(50% + ${x}px - ${beadSize/2}px)`,
                  top: `calc(50% + ${y}px - ${beadSize/2}px)`,
                  boxShadow: `0 0 20px ${bead.color}33, inset 0 0 10px rgba(255,255,255,0.4)`
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent pointer-events-none opacity-50" />
                <div className="absolute inset-0 opacity-0 group-hover/bead:opacity-100 transition-opacity bg-black/10 flex items-center justify-center">
                  <Trash2 className="w-3 h-3 md:w-4 md:h-4 text-white" />
                </div>
              </motion.div>
            );
          })}
          
          {beads.length === 0 && (
            <div className="text-moss/40 text-center px-8 md:px-12 relative z-10 space-y-4 md:space-y-6">
              <div className="w-16 h-16 md:w-24 md:h-24 bg-aura-gold/10 rounded-full flex items-center justify-center mx-auto aura-glow shadow-lg">
                <Sparkles className="w-8 h-8 md:w-12 md:h-12 text-aura-gold animate-pulse" />
              </div>
              <div className="space-y-1 md:space-y-2">
                <p className="text-lg md:text-xl font-serif italic text-ink-black">Begin your journey</p>
                <p className="text-[8px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em] text-moss font-bold opacity-60">Select crystals to manifest balance</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-8 md:space-y-12">
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] mb-6 md:mb-8 flex items-center gap-3 text-ink-black">
              <div className="p-2 rounded-lg bg-aura-gold/10">
                <Palette className="w-4 h-4 text-aura-gold" />
              </div>
              Select Crystals
            </h3>
          <div className="grid grid-cols-5 gap-2 md:gap-6">
            {beadOptions.map((option) => (
              <button
                key={option.name}
                onClick={() => addBead(option)}
                className="group flex flex-col items-center gap-2 md:gap-4 p-1.5 md:p-3 rounded-xl md:rounded-2xl hover:bg-white/60 transition-all duration-500 hover:shadow-xl border border-transparent hover:border-white/60"
              >
                <div 
                  className="w-10 h-10 md:w-16 md:h-16 rounded-full shadow-lg group-hover:scale-110 transition-transform border-2 md:border-4 border-white relative overflow-hidden ink-crystal aura-glow"
                  style={{ backgroundColor: option.color }}
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/50 to-transparent opacity-40" />
                </div>
                <div className="text-center space-y-0.5 md:space-y-1">
                  <span className="block text-[7px] md:text-[9px] text-ink-black uppercase tracking-tight leading-tight font-bold group-hover:text-aura-gold transition-colors">
                    {option.name}
                  </span>
                  <span className="block text-[7px] md:text-[8px] text-moss font-bold opacity-40">${option.price}</span>
                </div>
              </button>
            ))}
          </div>
          </div>

          <div className="pt-8 md:pt-12 border-t border-white/60">
            <div className="flex justify-between items-end mb-6 md:mb-8">
              <div className="space-y-1">
                <span className="block text-[10px] font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] text-ink-black">Order Summary</span>
                <p className="text-moss text-[10px] md:text-xs font-light">Handcrafted with intention</p>
              </div>
              <div className="text-right">
                <span className="block text-[9px] md:text-[10px] text-moss uppercase tracking-widest font-bold opacity-40 mb-1">Total Investment</span>
                <span className="text-2xl md:text-3xl font-serif text-ink-black">${totalPrice}</span>
              </div>
            </div>
            
            <div className="space-y-4 md:space-y-6">
              <div className="flex items-center justify-between p-4 md:p-5 rounded-xl md:rounded-2xl bg-white/40 border border-white/60 group hover:bg-white/60 transition-colors cursor-pointer">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="p-2.5 md:p-3 rounded-lg md:rounded-xl bg-aura-gold/10 group-hover:bg-aura-gold/20 transition-colors">
                    <RefreshCw className="w-3.5 h-3.5 md:w-4 md:h-4 text-aura-gold" />
                  </div>
                  <div>
                    <span className="block text-[10px] md:text-xs font-bold text-ink-black">Sonic Cleansing</span>
                    <span className="block text-[8px] md:text-[10px] text-moss opacity-60 uppercase tracking-widest">432Hz Frequency Alignment</span>
                  </div>
                </div>
                <button 
                  onClick={() => setCleansing(!cleansing)}
                  className={`w-10 h-5 md:w-12 md:h-6 rounded-full transition-all relative ${cleansing ? 'bg-aura-gold' : 'bg-moss/20'}`}
                >
                  <div className={`absolute top-0.5 md:top-1 w-4 h-4 rounded-full bg-white transition-all ${cleansing ? 'left-5.5 md:left-7' : 'left-0.5 md:left-1'}`} />
                </button>
              </div>

              <div className="flex flex-wrap md:flex-nowrap gap-3 md:gap-4">
                <button 
                  onClick={() => setBeads([])}
                  className="flex-1 md:w-1/4 border border-white/60 text-moss py-4 md:py-6 text-[9px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em] font-bold hover:bg-white/60 transition-all flex items-center justify-center gap-2 md:gap-3 rounded-xl md:rounded-2xl"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleShare}
                  disabled={isSharing || beads.length === 0}
                  className="flex-1 md:w-1/4 border border-aura-gold/30 text-aura-gold py-4 md:py-6 text-[9px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em] font-bold hover:bg-aura-gold/5 transition-all flex items-center justify-center gap-2 md:gap-3 rounded-xl md:rounded-2xl disabled:opacity-50"
                >
                  {isSharing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                </button>
                <button 
                  onClick={handleAddToCart}
                  className="w-full md:flex-1 bg-ink-black text-white py-4 md:py-6 text-[9px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em] font-bold hover:bg-aura-gold transition-all shadow-xl hover:shadow-aura-gold/20 flex items-center justify-center gap-3 md:gap-4 group rounded-xl md:rounded-2xl"
                >
                  Manifest <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </button>
              </div>

              <AnimatePresence>
                {showShareSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-center text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-aura-gold"
                  >
                    Shared to Community Gallery ✨
                  </motion.div>
                )}
              </AnimatePresence>
              
              <p className="text-center text-[8px] md:text-[9px] text-moss/40 uppercase tracking-[0.2em] font-bold">
                Each piece is cleansed in a singing bowl before shipping
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RecommendationSection = ({ recommendations, elements, onNav }: { recommendations: BaziReport['recommendations'], elements: BaziReport['elements'], onNav: (step: Step) => void }) => {
  const weakestElement = Object.entries(elements).sort((a, b) => a[1] - b[1])[0][0];
  const [hoveredCrystal, setHoveredCrystal] = useState<string | null>(null);
  
  return (
    <div className="space-y-12 sm:space-y-24 pt-10 sm:pt-20 border-t border-moss/10">
      <div className="text-center space-y-4 sm:space-y-6">
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.5em] text-aura-gold">Your Elemental Path</span>
        <h2 className="text-3xl sm:text-4xl md:text-6xl font-serif text-ink-black tracking-tight leading-tight">Personalized <span className="italic text-aura-gold">Healing</span> Guide</h2>
        <p className="text-moss text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-light px-4 sm:px-0">Based on your Bazi chart, we've identified the specific frequencies needed to restore your inner harmony and amplify your natural resonance.</p>
        {recommendations.reasoning && (
          <div className="max-w-3xl mx-auto relative group px-4 sm:px-0">
            <div className="absolute -inset-1 bg-gradient-to-r from-aura-gold/30 via-serene-blue/30 to-healing-pink/30 rounded-[1.5rem] sm:rounded-[2.5rem] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <p className="relative text-sm sm:text-base italic text-moss leading-relaxed bg-white/90 backdrop-blur-2xl p-6 sm:p-12 rounded-[1.5rem] sm:rounded-[2.5rem] border border-white/60 shadow-2xl">
              "{recommendations.reasoning}"
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-16 px-4 sm:px-0">
        {/* Crystals */}
        <div className="space-y-10">
          <div className="flex items-center justify-between border-b border-moss/10 pb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-aura-gold/10">
                <Gem className="w-6 h-6 text-aura-gold" />
              </div>
              <h4 className="text-sm font-bold uppercase tracking-[0.3em] text-ink-black">Sacred Stones</h4>
            </div>
            <button onClick={() => onNav('shop')} className="text-[10px] uppercase tracking-[0.3em] text-moss hover:text-aura-gold flex items-center gap-3 transition-all font-bold group">
              Shop <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-8">
            {recommendations.crystals.map((crystal, idx) => {
              const details = recommendations.crystalDetails?.find(d => d.name === crystal);
              
              return (
                <div key={crystal} className="relative">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onMouseEnter={() => setHoveredCrystal(crystal)}
                    onMouseLeave={() => setHoveredCrystal(null)}
                    onClick={() => setHoveredCrystal(hoveredCrystal === crystal ? null : crystal)}
                    className="group relative overflow-hidden bg-white/70 backdrop-blur-md p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border border-white/60 shadow-xl hover:shadow-2xl transition-all duration-500 cursor-help flex items-center gap-6 sm:gap-8"
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 overflow-hidden rounded-2xl border-4 border-white shadow-xl group-hover:scale-110 transition-transform duration-700">
                      <img 
                        src={`https://picsum.photos/seed/${crystal.replace(/\s/g, '')}/200/200`} 
                        alt={crystal} 
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-1000"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <p className="text-sm sm:text-base font-bold uppercase tracking-[0.2em] text-ink-black group-hover:text-aura-gold transition-colors">{crystal}</p>
                      <p className="text-[9px] sm:text-[10px] opacity-60 uppercase tracking-[0.3em] text-moss font-bold mt-1">Energy Amplifier</p>
                    </div>
                  </motion.div>

                  <AnimatePresence>
                    {hoveredCrystal === crystal && details && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="absolute z-50 left-0 lg:left-full lg:ml-6 top-full lg:top-0 mt-4 lg:mt-0 w-full lg:w-80 bg-white/95 backdrop-blur-2xl p-6 sm:p-8 space-y-4 sm:space-y-6 shadow-[0_30px_60px_rgba(0,0,0,0.15)] border border-white/50 rounded-[1.5rem] sm:rounded-[2rem]"
                      >
                        <div className="space-y-2">
                          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.4em] text-aura-gold">Properties</p>
                          <p className="text-xs sm:text-sm leading-relaxed text-moss font-light">{details.properties}</p>
                        </div>
                        <div className="space-y-2 pt-4 border-t border-moss/10">
                          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.4em] text-moss/40">Element Connection</p>
                          <p className="text-xs sm:text-sm leading-relaxed text-moss italic font-medium">{details.connection}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* Jewelry & Wristbands */}
        <div className="space-y-10">
          <div className="flex items-center justify-between border-b border-moss/10 pb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-serene-blue/10">
                <Palette className="w-6 h-6 text-serene-blue" />
              </div>
              <h4 className="text-sm font-bold uppercase tracking-[0.3em] text-ink-black">Aesthetic Wear</h4>
            </div>
            <button onClick={() => onNav('shop')} className="text-[10px] uppercase tracking-[0.3em] text-moss hover:text-aura-gold flex items-center gap-3 transition-all font-bold group">
              Shop <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="space-y-8">
            <div className="bg-white/70 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/60 shadow-xl space-y-6 hover:shadow-2xl transition-all duration-500">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-aura-gold">Lucky Jewelry</p>
              <div className="flex flex-wrap gap-3">
                {recommendations.jewelry.map(item => (
                  <span key={item} className="px-5 py-2 bg-white/80 text-moss text-[10px] uppercase tracking-[0.2em] rounded-full border border-moss/10 font-bold shadow-sm hover:border-aura-gold transition-colors cursor-default">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/60 shadow-xl space-y-8 hover:shadow-2xl transition-all duration-500">
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-aura-gold">Energy Wristbands</p>
                <button 
                  onClick={() => onNav('diy')}
                  className="text-[10px] font-bold uppercase tracking-[0.3em] text-serene-blue hover:text-aura-gold transition-colors font-bold"
                >
                  Craft This
                </button>
              </div>
              <div className="space-y-5">
                {recommendations.wristbands.map(band => (
                  <div key={band} className="flex items-center gap-5 text-sm font-medium text-moss group">
                    <div className="w-2.5 h-2.5 bg-aura-gold rounded-full shadow-[0_0_15px_rgba(197,160,89,0.5)] group-hover:scale-125 transition-transform" />
                    {band}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Color Palette */}
        <div className="space-y-10">
          <div className="flex items-center gap-4 border-b border-moss/10 pb-6">
            <div className="p-3 rounded-full bg-healing-pink/10">
              <Palette className="w-6 h-6 text-healing-pink" />
            </div>
            <h4 className="text-sm font-bold uppercase tracking-[0.3em] text-ink-black">Tonal Resonance</h4>
          </div>
          <div className="bg-white/70 backdrop-blur-md p-12 rounded-[3rem] border border-white/60 shadow-xl flex flex-col items-center justify-center space-y-12 hover:shadow-2xl transition-all duration-500">
            <div className="flex -space-x-8">
              {recommendations.luckyColors.map((color, idx) => (
                <motion.div
                  key={color}
                  initial={{ scale: 0, x: 20 }}
                  animate={{ scale: 1, x: 0 }}
                  transition={{ delay: idx * 0.2, type: 'spring' }}
                  className="w-24 h-24 rounded-full border-8 border-white shadow-2xl relative group cursor-help"
                  style={{ backgroundColor: color.toLowerCase() }}
                >
                  <div className="absolute inset-0 rounded-full bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <span className="text-[10px] text-white font-bold uppercase tracking-widest">{color}</span>
                  </div>
                  <div className="absolute -inset-2 rounded-full border border-white/50 opacity-0 group-hover:opacity-100 transition-all group-hover:scale-110"></div>
                </motion.div>
              ))}
            </div>
            <div className="text-center space-y-3">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-ink-black">Your Power Palette</p>
              <p className="text-[10px] text-moss uppercase tracking-[0.2em] font-medium leading-relaxed">
                Incorporate these tones into your <br />daily environment and attire.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Cart = ({ items, onRemove, onUpdateQuantity, onCheckout, onNav }: { 
  items: CartItem[], 
  onRemove: (id: string) => void, 
  onUpdateQuantity: (id: string, quantity: number) => void,
  onCheckout: () => void,
  onNav: (step: Step) => void
}) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 0 ? 15 : 0;
  const total = subtotal + shipping;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto space-y-8 md:space-y-12"
    >
      <div className="text-center space-y-3 md:space-y-4">
        <h2 className="text-3xl md:text-4xl font-serif text-ink-black tracking-tight">Your <span className="italic text-aura-gold">Collection</span></h2>
        <p className="text-moss text-xs md:text-sm font-light px-6">Items awaiting their final alignment with your energy.</p>
      </div>

      {items.length === 0 ? (
        <div className="relative max-w-4xl mx-auto px-4">
          {/* Outer Glow/Shadow */}
          <div className="absolute inset-0 bg-white/20 blur-[60px] md:blur-[100px] rounded-[3rem] md:rounded-[5rem] -z-10" />
          
          {/* Main Container */}
          <div className="bg-transparent p-1.5 md:p-2 border border-moss/30 relative overflow-hidden">
            <div className="bg-white/50 backdrop-blur-sm p-12 md:p-24 border border-moss/20 text-center space-y-8 md:space-y-12 relative">
              <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent pointer-events-none" />
              
              <div className="w-16 h-16 md:w-24 md:h-24 bg-moss/5 flex items-center justify-center mx-auto border border-moss/20 relative z-10">
                <ShoppingBag className="w-8 h-8 md:w-10 md:h-10 text-moss/20" />
              </div>
              
              <div className="space-y-3 md:space-y-4 relative z-10">
                <p className="text-2xl md:text-3xl font-serif text-ink-black italic">Your cart is empty</p>
                <p className="text-[8px] md:text-[10px] text-moss/40 uppercase tracking-[0.3em] md:tracking-[0.5em] font-bold px-4">The universe is waiting for your first intention</p>
              </div>
              
              <button 
                onClick={() => onNav('shop')}
                className="bg-[#b08d57] hover:bg-[#a07d47] text-white px-10 md:px-14 py-4 md:py-5 rounded-full text-[10px] md:text-[11px] font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] transition-all shadow-xl hover:shadow-[#b08d57]/20 hover:-translate-y-1 active:translate-y-0 relative z-10"
              >
                Explore Artifacts
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 px-4 md:px-0">
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {items.map((item) => (
              <motion.div 
                key={item.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white/50 backdrop-blur-md p-4 md:p-8 border border-moss/30 shadow-sm flex flex-col sm:flex-row items-center gap-4 md:gap-8 group"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 overflow-hidden bg-moss/5 border border-moss/20 flex-shrink-0">
                  <img 
                    src={item.image === 'diy-bracelet' ? 'https://picsum.photos/seed/bracelet/200/200' : `https://picsum.photos/seed/${item.image}/200/200`} 
                    alt={item.name}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-grow space-y-2 w-full">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-base md:text-lg font-serif text-ink-black group-hover:text-aura-gold transition-colors">{item.name}</h4>
                      <p className="text-[9px] md:text-[10px] text-aura-gold uppercase tracking-[0.2em] font-bold">{item.type} • {item.element}</p>
                    </div>
                    <button 
                      onClick={() => onRemove(item.id)}
                      className="text-moss/40 hover:text-healing-pink transition-colors p-2"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex justify-between items-center pt-2 md:pt-4">
                    <div className="flex items-center gap-4 bg-moss/5 rounded-full px-4 py-2">
                      <button 
                        onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="text-moss hover:text-aura-gold transition-colors font-bold"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="text-moss hover:text-aura-gold transition-colors font-bold"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-lg md:text-xl font-serif text-ink-black">${item.price * item.quantity}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="space-y-8">
            <div className="bg-transparent border border-moss/30 p-8 md:p-10 space-y-6 md:space-y-8 lg:sticky lg:top-32">
              <h3 className="text-lg md:text-xl font-serif tracking-tight border-b border-moss/20 pb-4 md:pb-6 text-ink-black">Order Summary</h3>
              <div className="space-y-4 text-ink-black">
                <div className="flex justify-between text-[10px] md:text-xs uppercase tracking-widest opacity-60">
                  <span>Subtotal</span>
                  <span>${subtotal}</span>
                </div>
                <div className="flex justify-between text-[10px] md:text-xs uppercase tracking-widest opacity-60">
                  <span>Shipping</span>
                  <span>${shipping}</span>
                </div>
                <div className="pt-4 md:pt-6 border-t border-moss/20 flex justify-between items-end">
                  <span className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold">Total</span>
                  <span className="text-3xl md:text-4xl font-serif text-aura-gold">${total}</span>
                </div>
              </div>
              <button 
                onClick={onCheckout}
                className="w-full bg-aura-gold text-white py-4 md:py-6 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] hover:bg-ink-black transition-all flex items-center justify-center gap-3 md:gap-4 group shadow-sm"
              >
                Complete Manifestation <CreditCard className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
              <p className="text-[8px] md:text-[9px] text-center opacity-40 uppercase tracking-widest font-bold text-ink-black">Secure spiritual transaction</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

const Orders = ({ orders, onNav }: { orders: Order[], onNav: (step: Step) => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto space-y-8 md:space-y-12 px-4 md:px-0"
    >
      <div className="text-center space-y-3 md:space-y-4">
        <h2 className="text-3xl md:text-4xl font-serif text-ink-black tracking-tight">Order <span className="italic text-aura-gold">History</span></h2>
        <p className="text-moss text-xs md:text-sm font-light px-6">The timeline of your spiritual acquisitions.</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white/60 backdrop-blur-xl p-12 md:p-20 rounded-[2rem] md:rounded-[3rem] border border-white/60 text-center space-y-6 md:space-y-8 shadow-xl">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-moss/5 rounded-full flex items-center justify-center mx-auto">
            <History className="w-8 h-8 md:w-10 md:h-10 text-moss/20" />
          </div>
          <div className="space-y-2">
            <p className="text-lg md:text-xl font-serif text-ink-black italic">No orders yet</p>
            <p className="text-[10px] md:text-xs text-moss/60 uppercase tracking-widest font-bold">Your journey is just beginning</p>
          </div>
          <button 
            onClick={() => onNav('shop')}
            className="bg-aura-gold text-white px-8 md:px-10 py-3.5 md:py-4 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] hover:bg-ink-black transition-all shadow-lg"
          >
            Start Your Collection
          </button>
        </div>
      ) : (
        <div className="space-y-6 md:space-y-8">
          {orders.map((order) => (
            <div key={order.id} className="bg-white/80 backdrop-blur-xl rounded-[2rem] md:rounded-[2.5rem] border border-white/60 shadow-xl overflow-hidden group">
              <div className="bg-moss/5 px-6 md:px-10 py-4 md:py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/60">
                <div className="flex flex-wrap gap-6 md:gap-10">
                  <div className="space-y-1">
                    <p className="text-[8px] md:text-[9px] text-moss/40 uppercase tracking-widest font-bold">Order ID</p>
                    <p className="text-[10px] md:text-xs font-bold text-ink-black">#{order.id.slice(-8).toUpperCase()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] md:text-[9px] text-moss/40 uppercase tracking-widest font-bold">Date</p>
                    <p className="text-[10px] md:text-xs font-bold text-ink-black">{new Date(order.date).toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] md:text-[9px] text-moss/40 uppercase tracking-widest font-bold">Total</p>
                    <p className="text-[10px] md:text-xs font-bold text-aura-gold">${order.total}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-3 bg-white/80 px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-white/60 shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-aura-gold" />
                  <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-ink-black">{order.status}</span>
                </div>
              </div>
              <div className="p-6 md:p-10 space-y-4 md:space-y-6">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 md:gap-6">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-moss/5 border-2 border-white shadow-sm flex-shrink-0">
                      <img 
                        src={item.image === 'diy-bracelet' ? 'https://picsum.photos/seed/bracelet/200/200' : `https://picsum.photos/seed/${item.image}/200/200`} 
                        alt={item.name}
                        className="w-full h-full object-cover opacity-80"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-grow">
                      <h5 className="text-sm font-bold text-ink-black">{item.name}</h5>
                      <p className="text-[9px] text-aura-gold uppercase tracking-widest font-bold">{item.type} • Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-serif text-moss">${item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

const Shop = ({ onNav, report, onAddToCart }: { onNav: (step: Step) => void, report: BaziReport | null, onAddToCart: (item: Omit<CartItem, 'quantity'>) => void }) => {
  const [filter, setFilter] = useState<string>('All');
  const weakestElement = report ? Object.entries(report.elements).sort((a, b) => a[1] - b[1])[0][0] : null;

  const products = [
    { 
      id: 'prod-1', 
      name: 'Clear Quartz Point', 
      category: 'Crystal', 
      price: 22, 
      element: 'metal', 
      image: 'clearquartz',
      rating: 4.8,
      reviews: ['Gives me such clarity during work.', 'Beautiful piece, very high quality.']
    },
    { 
      id: 'prod-2', 
      name: 'Jade Harmony Bangle', 
      category: 'Jewelry', 
      price: 120, 
      element: 'wood', 
      image: 'jade',
      rating: 5.0,
      reviews: ['The wood energy is palpable. I feel so grounded.', 'Elegant and spiritual.']
    },
    { 
      id: 'prod-3', 
      name: 'Citrine Wealth Cluster', 
      category: 'Crystal', 
      price: 45, 
      element: 'earth', 
      image: 'citrine',
      rating: 4.7,
      reviews: ['My desk feels much more abundant now.', 'Love the golden hue.']
    },
    { 
      id: 'prod-4', 
      name: 'Rose Quartz Pendant', 
      category: 'Jewelry', 
      price: 35, 
      element: 'fire', 
      image: 'rosequartz',
      rating: 4.9,
      reviews: ['A beautiful reminder to practice self-love.', 'Perfect gift for my sister.']
    },
    { 
      id: 'prod-5', 
      name: 'Obsidian Shield Bracelet', 
      category: 'Wristband', 
      price: 38, 
      element: 'water', 
      image: 'obsidian',
      rating: 4.6,
      reviews: ['I wear this every day for protection.', 'Strong, masculine energy.']
    },
    { 
      id: 'prod-6', 
      name: 'Amethyst Dream Geode', 
      category: 'Crystal', 
      price: 65, 
      element: 'water', 
      image: 'amethyst',
      rating: 4.9,
      reviews: ['Helps me sleep so much better.', 'Stunning deep purple color.']
    },
    { 
      id: 'prod-7', 
      name: 'Carnelian Vitality Ring', 
      category: 'Jewelry', 
      price: 42, 
      element: 'fire', 
      image: 'carnelian',
      rating: 4.5,
      reviews: ['Boosts my confidence during presentations.', 'Very unique design.']
    },
    { 
      id: 'prod-8', 
      name: 'Lapis Lazuli Mala', 
      category: 'Wristband', 
      price: 55, 
      element: 'water', 
      image: 'lapislazuli',
      rating: 4.8,
      reviews: ['Great for my meditation practice.', 'The blue is so blue.']
    },
  ];

  const filteredProducts = filter === 'All' 
    ? products 
    : products.filter(p => p.category === filter || p.element === filter.toLowerCase());

  const handleAddToCart = (product: typeof products[0]) => {
    onAddToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      type: 'artifact',
      element: product.element
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-24 relative"
    >
      <div className="text-center space-y-3 md:space-y-6">
        <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] md:tracking-[0.5em] text-aura-gold">The Aura Lab Boutique</span>
        <h2 className="text-3xl md:text-5xl lg:text-7xl font-serif text-ink-black tracking-tight leading-tight px-4">Sacred <span className="italic text-aura-gold">Artifacts</span></h2>
        <p className="text-moss text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-light px-6 md:px-0">Curated tools and adornments designed to harmonize your personal energy field and amplify your natural resonance.</p>
      </div>

      {/* DIY Promo Banner */}
      <div className="bg-white/80 backdrop-blur-2xl border border-white/50 text-ink-black rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 lg:p-20 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-16 shadow-2xl group mx-4 md:mx-0">
        <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-aura-gold/10 rounded-full blur-[80px] md:blur-[120px] pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
        <div className="absolute bottom-0 left-0 w-64 md:w-96 h-64 md:h-96 bg-serene-blue/5 rounded-full blur-[70px] md:blur-[100px] pointer-events-none" />
        <div className="relative z-10 lg:w-2/3 space-y-6 md:space-y-8 text-center lg:text-left">
          <div className="space-y-2 md:space-y-3">
            <span className="text-aura-gold text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] md:tracking-[0.4em]">Personalized Resonance</span>
            <h3 className="text-2xl md:text-4xl lg:text-5xl font-serif text-ink-black leading-tight tracking-tight">Craft Your Personal <br className="hidden md:block" /> <span className="italic text-aura-gold">Energy Conduit</span></h3>
          </div>
          <p className="text-moss text-sm md:text-lg leading-relaxed max-w-2xl font-light mx-auto lg:mx-0 px-2 md:px-0">
            Can't find the perfect piece? Enter our DIY Studio to design a custom crystal bracelet tailored exactly to your Bazi elemental needs.
          </p>
        </div>
        <div className="relative z-10 lg:w-1/3 flex justify-center lg:justify-end w-full md:w-auto">
          <button 
            onClick={() => onNav('diy')}
            className="w-full md:w-auto bg-aura-gold text-white px-8 md:px-12 py-4 md:py-6 rounded-full text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.3em] uppercase font-bold hover:bg-ink-black transition-all duration-500 flex items-center justify-center gap-3 md:gap-4 whitespace-nowrap shadow-[0_20px_40px_rgba(197,160,89,0.3)] active:scale-95 group"
          >
            <Palette className="w-4 h-4 md:w-5 md:h-5 group-hover:rotate-12 transition-transform" /> Open DIY Studio
          </button>
        </div>
      </div>
      
      <div className="flex justify-center gap-2 md:gap-4 flex-wrap px-4">
        {['All', 'Crystal', 'Jewelry', 'Wristband', 'Wood', 'Fire', 'Earth', 'Metal', 'Water'].map(f => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 md:px-8 py-2 md:py-3 text-[8px] md:text-[10px] uppercase tracking-[0.1em] md:tracking-[0.2em] rounded-full transition-all duration-500 border-2 font-bold",
              filter === f 
                ? "bg-aura-gold text-white border-aura-gold shadow-[0_10px_20px_rgba(197,160,89,0.2)]" 
                : "bg-white/50 text-moss border-moss/10 hover:border-aura-gold hover:text-aura-gold backdrop-blur-sm"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-12 px-4 md:px-0">
        {filteredProducts.map((product, idx) => {
          const isRecommended = product.element === weakestElement;
          
          return (
            <motion.div 
              key={product.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={cn(
                "bg-white/60 backdrop-blur-md group overflow-hidden flex flex-col border transition-all duration-500 rounded-[2rem] md:rounded-[2.5rem] shadow-xl hover:shadow-2xl relative",
                isRecommended ? "border-aura-gold ring-2 ring-aura-gold/20" : "border-white/50 hover:border-aura-gold/30"
              )}
            >
              {isRecommended && (
                <div className="absolute top-4 left-4 z-20 bg-aura-gold text-white px-3 md:px-4 py-1 rounded-full text-[7px] md:text-[8px] font-bold uppercase tracking-widest shadow-lg flex items-center gap-2">
                  <Sparkles className="w-3 h-3" /> Recommended
                </div>
              )}
              <div className="aspect-square overflow-hidden relative">
                <img 
                  src={`https://picsum.photos/seed/${product.image}/400/400`} 
                  alt={product.name}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 md:top-6 right-4 md:right-6 bg-white/90 backdrop-blur-md text-ink-black px-3 md:px-4 py-1 md:py-1.5 text-[7px] md:text-[8px] uppercase tracking-[0.3em] font-bold rounded-full shadow-lg border border-white/50">
                  {product.element}
                </div>
              </div>
              <div className="p-6 md:p-10 flex flex-col flex-grow justify-between space-y-6 md:space-y-8">
                <div className="space-y-3 md:space-y-4">
                  <div className="flex justify-between items-start">
                    <p className="text-[9px] md:text-[10px] text-aura-gold uppercase tracking-[0.3em] font-bold">{product.category}</p>
                    <div className="flex items-center gap-1.5 bg-aura-gold/10 px-2 md:px-3 py-1 rounded-full">
                      <Star className="w-3 h-3 text-aura-gold fill-aura-gold" />
                      <span className="text-[9px] md:text-[10px] font-bold text-aura-gold">{product.rating}</span>
                    </div>
                  </div>
                  <h3 className="text-lg md:text-xl font-serif leading-tight text-ink-black group-hover:text-aura-gold transition-colors tracking-tight">{product.name}</h3>
                  <div className="pt-1 md:pt-2">
                    <p className="text-[11px] md:text-xs text-moss italic line-clamp-2 leading-relaxed font-light">"{product.reviews[0]}"</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 md:pt-6 border-t border-moss/10">
                  <span className="text-xl md:text-2xl font-serif text-ink-black">${product.price}</span>
                  <button 
                    onClick={() => handleAddToCart(product)}
                    className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center text-moss hover:bg-aura-gold hover:text-white transition-all shadow-md active:scale-95 group"
                  >
                    <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

const MysticalBackground = () => {
  const [stars, setStars] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [lanterns, setLanterns] = useState<any[]>([]);
  const [auraOrbs, setAuraOrbs] = useState<any[]>([]);

  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    
    // Generate random stars/stardust (Celestial)
    const newStars = Array.from({ length: isMobile ? 15 : 30 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      duration: `${25 + Math.random() * 35}s`,
      delay: `${Math.random() * 25}s`,
      sway: `${(Math.random() - 0.5) * 200}px`,
      rotation: `${(Math.random() - 0.5) * 720}deg`,
      opacity: 0.05 + Math.random() * 0.15,
      isGold: Math.random() > 0.7,
      scale: 0.1 + Math.random() * 0.3,
    }));
    setStars(newStars);

    // Generate bamboo leaves (Ink Wash - Green)
    const newLeaves = Array.from({ length: isMobile ? 15 : 30 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      duration: `${15 + Math.random() * 20}s`,
      delay: `${Math.random() * 15}s`,
      sway: `${(Math.random() - 0.5) * 400}px`,
      scale: 0.5 + Math.random() * 0.5,
      opacity: 0.3 + Math.random() * 0.4,
      color: Math.random() > 0.5 ? 'text-moss/50' : 'text-sage/50',
    }));
    setLeaves(newLeaves);

    // Generate floating lanterns (Healing Energy)
    const newLanterns = Array.from({ length: isMobile ? 6 : 12 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      duration: `${20 + Math.random() * 30}s`,
      delay: `${Math.random() * 20}s`,
      sway: `${(Math.random() - 0.5) * 300}px`,
      rotation: `${(Math.random() - 0.5) * 45}deg`,
      scale: 0.6 + Math.random() * 0.8,
    }));
    setLanterns(newLanterns);

    // Generate Aura Orbs (Healing Energy)
    const newAuraOrbs = [
      { id: 1, color: 'bg-healing-pink', top: '15%', left: '5%', size: isMobile ? 'w-48 h-48' : 'w-96 h-96', delay: '0s' },
      { id: 2, color: 'bg-moss', top: '55%', left: '10%', size: isMobile ? 'w-40 h-40' : 'w-80 h-80', delay: '2s' },
      { id: 3, color: 'bg-aura-gold', top: '35%', left: '45%', size: isMobile ? 'w-32 h-32' : 'w-64 h-64', delay: '4s' },
      { id: 4, color: 'bg-serene-blue', top: '10%', left: '80%', size: isMobile ? 'w-36 h-36' : 'w-72 h-72', delay: '1s' },
    ];
    setAuraOrbs(newAuraOrbs);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-paper">
      {/* Vertical Framing Lines */}
      <div className="absolute inset-y-0 left-[10%] w-px bg-moss/10" />
      <div className="absolute inset-y-0 right-[10%] w-px bg-moss/10" />

      {/* Diamond Row (Celestial Alignment) */}
      <div className="absolute top-12 left-0 w-full flex justify-between px-12 opacity-20">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className={cn("w-1.5 h-1.5 rotate-45 border border-moss", i % 3 === 0 ? "bg-moss" : "bg-transparent")} />
        ))}
      </div>

      {/* Healing Aura Orbs */}
      {auraOrbs.map((orb) => (
        <div
          key={orb.id}
          className={`absolute rounded-full blur-[120px] opacity-15 aura-glow ${orb.color} ${orb.size}`}
          style={{
            top: orb.top,
            left: orb.left,
            animationDelay: orb.delay,
          }}
        />
      ))}

      {/* Misty Background Layers */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(143,179,141,0.15),_transparent_80%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(252,228,236,0.1),_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,_rgba(225,245,254,0.1),_transparent_50%)]" />
      <div className="absolute inset-0 opacity-20 animate-mist bg-[url('https://www.transparenttextures.com/patterns/foggy.png')] mix-blend-multiply grayscale brightness-110" />
      
      {/* Mountain Silhouettes (Layered Ink Wash - Brighter) */}
      <div className="absolute bottom-0 left-0 w-full h-[70vh] opacity-10 pointer-events-none mountain-silhouette">
        <svg viewBox="0 0 1000 400" className="w-full h-full text-moss fill-current">
          <path d="M0,400 L0,250 Q100,150 250,280 T500,180 T750,260 T1000,200 L1000,400 Z" />
          <path d="M-100,400 L-100,320 Q150,220 350,350 T650,240 T950,330 T1100,400 Z" opacity="0.6" />
          <path d="M-200,400 L-200,380 Q300,300 500,390 T900,320 T1200,400 Z" opacity="0.3" />
        </svg>
      </div>

      {/* Curved Path / Mossy Ground (Ink Wash) */}
      <div className="absolute bottom-[-10%] left-0 w-full h-[40vh] opacity-50 pointer-events-none">
        <svg viewBox="0 0 1000 200" className="w-full h-full text-moss fill-current">
          <path d="M0,200 Q250,100 500,180 T1000,150 L1000,200 L0,200 Z" />
          <path d="M0,180 Q300,80 600,160 T1000,130" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.4" />
        </svg>
      </div>

      {/* Floating Lanterns */}
      {lanterns.map((l) => (
        <div
          key={l.id}
          className="absolute bottom-[-10%] animate-lantern"
          style={{
            left: l.left,
            '--lantern-duration': l.duration,
            '--lantern-delay': l.delay,
            '--lantern-sway': l.sway,
            '--lantern-rotation': l.rotation,
            transform: `scale(${l.scale})`,
          } as any}
        >
          <div className="w-6 h-8 bg-aura-gold/40 rounded-sm relative shadow-[0_0_15px_rgba(197,160,89,0.6)]">
            <div className="absolute top-0 left-0 w-full h-full bg-aura-gold/20 animate-pulse rounded-sm" />
            <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-1 h-3 bg-aura-gold/60 rounded-full" />
          </div>
        </div>
      ))}

      {/* Vertical Waterfall Lines */}
      <div className="absolute inset-y-0 left-[12%] w-[3px] bg-gradient-to-b from-transparent via-moss/20 to-transparent animate-waterfall" style={{ animationDelay: '2s' }} />
      <div className="absolute inset-y-0 right-[20%] w-[3px] bg-gradient-to-b from-transparent via-moss/20 to-transparent animate-waterfall" style={{ animationDelay: '1s' }} />



      {/* Stars (Celestial - Subtle) */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute top-0 animate-star"
          style={{
            left: star.left,
            '--star-duration': star.duration,
            '--star-delay': star.delay,
            '--star-sway': star.sway,
            '--star-rotation': star.rotation,
            '--star-opacity': star.opacity,
          } as React.CSSProperties}
        >
          {star.isGold ? (
            <Sparkles 
              className="text-aura-gold/20" 
              style={{ transform: `scale(${star.scale})`, opacity: star.opacity }} 
            />
          ) : (
            <div 
              className="w-1 h-1 bg-moss/20 rounded-full blur-[2px]" 
              style={{ transform: `scale(${star.scale})`, opacity: star.opacity }} 
            />
          )}
        </div>
      ))}

      {/* Bamboo Leaves (Ink Wash - Green) */}
      {leaves.map((leaf) => (
        <div
          key={leaf.id}
          className="absolute top-0 animate-bamboo"
          style={{
            left: leaf.left,
            '--leaf-duration': leaf.duration,
            '--leaf-delay': leaf.delay,
            '--leaf-sway': leaf.sway,
          } as React.CSSProperties}
        >
          <svg 
            viewBox="0 0 24 24" 
            className={`${leaf.color} fill-current`}
            style={{ width: `${24 * leaf.scale}px`, height: `${24 * leaf.scale}px`, opacity: leaf.opacity }}
          >
            <path d="M2,12 Q12,2 22,12 Q12,22 2,12 Z M12,2 Q14,12 12,22 Q10,12 12,2 Z" />
          </svg>
        </div>
      ))}

      {/* Decorative Concentric Circles */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] border border-moss/5 rounded-full" />
    </div>
  );
};

const YinYangIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="4"/>
    <path d="M50 2 A48 48 0 0 1 50 98 A24 24 0 0 0 50 50 A24 24 0 0 1 50 2 Z" fill="currentColor"/>
    <circle cx="50" cy="26" r="8" fill="currentColor" />
    <circle cx="50" cy="74" r="8" fill="black" />
  </svg>
);

const ChatInterface = ({ 
  messages, 
  onSendMessage, 
  isLoading, 
  onBack 
}: { 
  messages: ChatMessage[], 
  onSendMessage: (msg: string) => void, 
  isLoading: boolean, 
  onBack: () => void 
}) => {
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const prevMessagesLength = useRef(messages.length);

  const playSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      console.error("Audio play failed", e);
    }
  };

  useEffect(() => {
    if (messages.length > prevMessagesLength.current) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'model') {
        playSound();
      }
    }
    prevMessagesLength.current = messages.length;

    const timeoutId = setTimeout(() => {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [messages, isLoading]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-paper flex flex-col font-sans overflow-hidden">
      <MysticalBackground />
      
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] opacity-[0.1] pointer-events-none bg-[url('https://picsum.photos/seed/bamboo/800/800?grayscale')] bg-cover bg-no-repeat mix-blend-multiply" style={{ maskImage: 'radial-gradient(circle at top right, black, transparent)' }} />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] opacity-[0.1] pointer-events-none bg-[url('https://picsum.photos/seed/mountain/800/800?grayscale')] bg-cover bg-no-repeat mix-blend-multiply" style={{ maskImage: 'radial-gradient(circle at bottom left, black, transparent)' }} />
      
      {/* Large Bagua Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.05] pointer-events-none">
        <YinYangIcon className="w-[40rem] h-[40rem] text-aura-gold animate-[spin_120s_linear_infinite]" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-3 md:p-4 bg-white/40 backdrop-blur-xl border-b border-moss/10 shadow-sm">
        <div className="flex items-center gap-2 md:gap-3">
           <button onClick={onBack} className="p-1.5 md:p-2 hover:bg-moss/5 rounded-lg text-moss/60 transition-colors">
             <ArrowLeft className="w-5 h-5" />
           </button>
           <span className="font-serif font-medium text-ink-black tracking-wide flex items-center gap-2 text-sm md:text-base">
             <YinYangIcon className="w-4 h-4 text-aura-gold" /> Master Chat
           </span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="relative z-10 flex-grow overflow-y-auto">
        <div className="max-w-3xl mx-auto py-6 md:py-8 px-4 space-y-6 md:space-y-8">
          {messages.map((msg, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("flex gap-3 md:gap-4", msg.role === 'user' ? "justify-end" : "justify-start")}
            >
              {msg.role === 'model' && (
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/50 flex-shrink-0 flex items-center justify-center text-ink-black shadow-sm border border-aura-gold/30">
                  <YinYangIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-aura-gold" />
                </div>
              )}
              <div className={cn(
                "max-w-[85%] text-sm md:text-[15px] leading-relaxed", 
                msg.role === 'user' 
                  ? "bg-aura-gold/10 border border-aura-gold/20 rounded-2xl md:rounded-3xl px-4 md:px-5 py-2.5 md:py-3 text-ink-black shadow-sm" 
                  : "text-ink-black/90 prose prose-sm prose-ink max-w-none pt-1"
              )}>
                {msg.role === 'model' ? <ReactMarkdown>{msg.content}</ReactMarkdown> : msg.content}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 md:gap-4 justify-start">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/50 flex-shrink-0 flex items-center justify-center text-ink-black shadow-sm border border-aura-gold/30">
                <YinYangIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-aura-gold animate-[spin_3s_linear_infinite]" />
              </div>
              <div className="bg-white/50 border border-moss/10 rounded-2xl md:rounded-3xl rounded-tl-none px-4 md:px-5 py-3 md:py-4 shadow-sm flex items-center gap-1.5 md:gap-2">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-aura-gold/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-aura-gold/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-aura-gold/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}
          <div ref={endRef} className="h-4" />
        </div>
      </div>

      {/* Input Area */}
      <div className="relative z-10 p-3 md:p-4 bg-gradient-to-t from-paper via-paper to-transparent pt-6 md:pt-10">
        <div className="max-w-3xl mx-auto relative">
          <form onSubmit={handleSend} className="relative flex items-center bg-white/60 backdrop-blur-md rounded-[1.5rem] md:rounded-[2rem] border border-moss/10 focus-within:border-aura-gold focus-within:shadow-[0_0_20px_rgba(197,160,89,0.1)] transition-all shadow-xl">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Share your heart..."
              className="flex-grow bg-transparent px-4 md:px-6 py-3 md:py-4 text-ink-black placeholder:text-ink-gray/50 focus:outline-none text-sm"
            />
            <button 
              type="submit"
              disabled={!input.trim() || isLoading}
              className="mr-1.5 md:mr-2 p-2.5 md:p-3 bg-aura-gold text-white rounded-full hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-aura-gold/20"
            >
              <Send className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
          </form>
          <div className="text-center mt-2 md:mt-3 text-[10px] md:text-xs text-ink-black/40 font-serif italic">
            "The Master guides, but the path is yours to walk."
          </div>
        </div>
      </div>
    </div>
  );
};

const elementData: Record<string, { icon: any, title: string, quote: string, colors: string[], stones: string[] }> = {
  wood: { icon: TreePine, title: "The Gentle Willow", quote: "The heavy is the root of the light; the still is the master of the restless.", colors: ['#8FB38D', '#D3E0D7', '#5A6B5D'], stones: ['Green Fluorite', 'Malachite', 'Jade'] },
  fire: { icon: Flame, title: "The Radiant Flame", quote: "Knowing others is intelligence; knowing yourself is true wisdom.", colors: ['#F06292', '#FCE4EC', '#C2185B'], stones: ['Carnelian', 'Red Jasper', 'Sunstone'] },
  earth: { icon: Mountain, title: "The Grounded Mountain", quote: "Nature does not hurry, yet everything is accomplished.", colors: ['#C5A059', '#F9F5F0', '#8B7355'], stones: ['Tiger Eye', 'Smoky Quartz', 'Citrine'] },
  metal: { icon: Diamond, title: "The Refined Blade", quote: "To lead people, walk behind them.", colors: ['#B0BEC5', '#ECEFF1', '#546E7A'], stones: ['Clear Quartz', 'Hematite', 'Pyrite'] },
  water: { icon: Droplets, title: "The Deep Ocean", quote: "Nothing in the world is softer and more yielding than water.", colors: ['#64B5F6', '#E3F2FD', '#1976D2'], stones: ['Lapis Lazuli', 'Aquamarine', 'Black Tourmaline'] },
};

export default function App() {
  const [step, setStep] = useState<Step>('intro');
  const [userData, setUserData] = useState<UserData>({
    name: '',
    email: '',
    gender: '',
    birthDate: '',
    birthTime: '',
    troubles: ''
  });
  const [report, setReport] = useState<BaziReport | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatting, setIsChatting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Action completed');
  const [reportHistory, setReportHistory] = useState<ReportHistoryItem[]>([]);
  const [sharedCreations, setSharedCreations] = useState<{ id: string, name: string, element: string, beads: any[] }[]>([
    { id: '1', name: 'Ocean Whisper', element: 'water', beads: [] },
    { id: '2', name: 'Forest Spirit', element: 'wood', beads: [] },
    { id: '3', name: 'Golden Aura', element: 'metal', beads: [] }
  ]);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setSuccessMessage(`${item.name} added to your collection`);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        const newQty = Math.max(1, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }));
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      date: new Date().toLocaleDateString(),
      items: [...cart],
      total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
      status: 'pending'
    };
    setOrders(prev => [newOrder, ...prev]);
    setCart([]);
    setStep('orders');
    setSuccessMessage('Order placed successfully');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleLogout = () => {
    setUserData({
      name: '',
      email: '',
      gender: '',
      birthDate: '',
      birthTime: '',
      troubles: ''
    });
    setReport(null);
    setOrders([]);
    setCart([]);
    setStep('intro');
    setSuccessMessage('Signed out successfully');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleStart = () => setStep('troubles');

  const handleTroubleSelect = (trouble: string) => {
    setUserData({ ...userData, troubles: trouble });
    if (report) {
      setChatMessages([
        { role: 'model', content: `Ah, ${userData.name}, you wish to speak about ${trouble}. I am here to listen. How has this been affecting your energy lately?` }
      ]);
      setStep('chat');
    } else {
      setStep('birth-info');
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    const newMessages = [...chatMessages, { role: 'user' as const, content: text }];
    setChatMessages(newMessages);
    setIsChatting(true);

    try {
      const reply = await chatWithMaster(text, chatMessages, userData, report);
      setChatMessages([...newMessages, { role: 'model', content: reply }]);
    } catch (error) {
      console.error("Chat error:", error);
      setChatMessages([...newMessages, { role: 'model', content: "My apologies, the cosmic connection was briefly interrupted. Could you repeat that?" }]);
    } finally {
      setIsChatting(false);
    }
  };

  const handleSubmitInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('generating');
    
    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      setLoadingProgress(progress);
    }, 400);

    try {
      const result = await generateBaziReport(userData);
      clearInterval(interval);
      setLoadingProgress(100);
      setReport(result);
      
      // Add to history
      const historyItem: ReportHistoryItem = {
        id: `REP-${Date.now()}`,
        date: new Date().toLocaleDateString(),
        report: result,
        userData: { ...userData }
      };
      setReportHistory(prev => [historyItem, ...prev]);
      
      setStep('report');
    } catch (error) {
      clearInterval(interval);
      console.error("Failed to generate report:", error);
      setStep('birth-info');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-paper relative overflow-x-hidden">
      <MysticalBackground />
      {/* Ink Wash Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[1] opacity-[0.05] mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/handmade-paper.png')]" />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header onNav={setStep} currentStep={step} cartCount={cart.reduce((sum, i) => sum + i.quantity, 0)} />

        <main className="flex-grow pt-24 md:pt-32 pb-16 md:pb-24 px-4 md:px-12 max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {step === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <UserProfile 
                userData={userData}
                orders={orders}
                sharedCreations={sharedCreations}
                reportHistory={reportHistory}
                onNav={setStep}
                onViewReport={(rep, data) => {
                  setReport(rep);
                  setUserData(data);
                  setStep('report');
                }}
                onLogout={handleLogout}
              />
            </motion.div>
          )}

          {step === 'cart' && (
            <motion.div
              key="cart"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Cart 
                items={cart} 
                onRemove={removeFromCart} 
                onUpdateQuantity={updateQuantity} 
                onCheckout={handleCheckout}
                onNav={setStep}
              />
            </motion.div>
          )}

          {step === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Orders orders={orders} onNav={setStep} />
            </motion.div>
          )}

          {step === 'intro' && (
            <motion.div 
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-32 pb-24"
            >
              {/* 1. Hero: AI Fortune Telling */}
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center min-h-[70vh] lg:min-h-[80vh] relative">
                <div className="lg:col-span-6 space-y-6 md:space-y-8 relative z-10 text-center lg:text-left">
                  <div className="space-y-4">
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] text-aura-gold block">The Aura Lab • Ancient Wisdom × AI</span>
                    <h1 className="text-4xl sm:text-5xl md:text-8xl font-serif font-light tracking-tight leading-tight md:leading-none text-ink-black">
                      Decode Your <br className="hidden sm:block" />
                      <span className="italic font-normal text-aura-gold">Heavenly Stem</span>
                    </h1>
                    <p className="text-ink-black/60 font-light leading-relaxed max-w-md mx-auto lg:mx-0 text-base md:text-lg">
                      A modern, healing conversational experience. Discover your five-element destiny and find psychological comfort through AI-powered Bazi analysis.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center lg:justify-start">
                    <button 
                      onClick={handleStart}
                      className="group bg-[#b08d57] text-white px-8 md:px-12 py-4 md:py-5 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-ink-black transition-all duration-500 flex items-center justify-center gap-4 shadow-xl rounded-full active:scale-95"
                    >
                      Begin Your Journey <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                    </button>
                    <button 
                      onClick={() => setStep('troubles')}
                      className="group bg-white/30 backdrop-blur-xl border border-white/40 text-ink-black px-8 md:px-12 py-4 md:py-5 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-white/50 transition-all duration-500 flex items-center justify-center gap-4 rounded-full shadow-lg"
                    >
                      <MessageSquare className="w-4 h-4 text-moss/40 group-hover:scale-110 transition-transform" /> Consult Master
                    </button>
                  </div>
                </div>
                <div className="lg:col-span-6 relative lg:order-last">
                  <div className="absolute inset-0 bg-aura-gold/5 rounded-full blur-[60px] md:blur-[100px] animate-pulse" />
                  <div className="relative aspect-[4/5] w-full max-w-md mx-auto lg:max-w-none overflow-hidden shadow-2xl rounded-t-full border border-white/20">
                    <img 
                      src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=800&h=1000" 
                      alt="Aura Aesthetic" 
                      className="w-full h-full object-cover opacity-90 transition-transform duration-1000 hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-paper via-transparent to-transparent" />
                  </div>
                </div>
              </section>

              <DailyDraw />

              {/* 2. E-commerce & DIY: The Aura Lab Boutique */}
              <section className="py-12 md:py-16 border-t border-moss/10">
                <div className="text-center mb-10 md:mb-16 space-y-3 md:space-y-4 px-4">
                  <h2 className="text-3xl md:text-4xl font-serif italic text-ink-black">Sacred Artifacts & Conduits</h2>
                  <p className="text-ink-gray text-[10px] md:text-sm uppercase tracking-widest max-w-2xl mx-auto">
                    Manifest your elemental balance into the physical realm. Explore our curated boutique or craft your own destiny.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 px-4 md:px-0">
                  {/* Shop Promo */}
                  <div className="group cursor-pointer relative overflow-hidden rounded-[1.5rem] md:rounded-[2rem] aspect-[4/3] bg-white border border-moss/5 shadow-2xl" onClick={() => setStep('shop')}>
                    <img src="https://picsum.photos/seed/boutique/800/600" alt="Boutique" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-60 group-hover:scale-110 transition-all duration-1000" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent opacity-60" />
                    <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end">
                      <span className="text-aura-gold text-[9px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em] mb-2 md:mb-3 font-bold">Curated Collection</span>
                      <h3 className="text-2xl md:text-4xl font-serif text-ink-black mb-3 md:mb-4 tracking-tight">The Aura Lab Boutique</h3>
                      <p className="text-ink-black/70 text-xs md:text-sm mb-6 md:mb-8 max-w-sm leading-relaxed">Discover ethically sourced crystals, elemental jewelry, and spiritual tools.</p>
                      <div className="flex items-center gap-3 text-ink-black text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold group-hover:text-aura-gold transition-colors">
                        Shop Now <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  </div>

                  {/* DIY Promo */}
                  <div className="group cursor-pointer relative overflow-hidden rounded-[1.5rem] md:rounded-[2rem] aspect-[4/3] bg-white border border-moss/5 shadow-2xl" onClick={() => setStep('diy')}>
                    <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/diy/800/600')] opacity-40 mix-blend-multiply group-hover:scale-110 transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent opacity-60" />
                    <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end">
                      <span className="text-moss text-[9px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em] mb-2 md:mb-3 font-bold">Custom Creation</span>
                      <h3 className="text-2xl md:text-4xl font-serif text-ink-black mb-3 md:mb-4 tracking-tight">DIY Energy Studio</h3>
                      <p className="text-moss/80 text-xs md:text-sm mb-6 md:mb-8 max-w-sm leading-relaxed">Design a personalized crystal bracelet tailored to your unique Bazi elemental chart.</p>
                      <div className="flex items-center gap-3 text-ink-black text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold group-hover:text-aura-gold transition-colors">
                        Start Crafting <Palette className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <CommunityStories />
              <CommunityGallery creations={sharedCreations} onNav={setStep} />

              {/* 3. Brand Story & Community */}
              <section className="bg-white/80 backdrop-blur-2xl text-ink-black rounded-[2rem] md:rounded-[3rem] p-8 md:p-24 relative overflow-hidden border border-white/50 shadow-2xl">
                <div className="absolute top-0 right-0 w-[400px] md:w-[800px] h-[400px] md:h-[800px] bg-[radial-gradient(circle_at_center,_rgba(197,160,89,0.1),_transparent_70%)] pointer-events-none animate-pulse" />
                <div className="absolute -bottom-12 md:-bottom-24 -left-12 md:-left-24 w-48 md:w-96 h-48 md:h-96 bg-moss/5 rounded-full blur-2xl md:blur-3xl pointer-events-none" />
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">
                  <div className="space-y-6 md:space-y-10">
                    <div className="space-y-3 md:space-y-4">
                      <span className="text-aura-gold text-[9px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em] font-bold">Our Lineage</span>
                      <h2 className="text-3xl md:text-6xl font-serif leading-tight tracking-tight text-ink-black">
                        Bridging <span className="italic text-aura-gold">Millennia</span> <br /> of Wisdom
                      </h2>
                    </div>
                    <div className="space-y-4 md:space-y-8 text-ink-black/70 text-base md:text-lg leading-relaxed font-light">
                      <p>
                        The Aura Lab was born from a profound realization: the ancient arts of Bazi (Four Pillars of Destiny) and Feng Shui hold timeless psychological truths, yet they remain inaccessible to many in the modern world.
                      </p>
                      <p>
                        We collaborated with lineage-holding masters and leading AI researchers to digitize over 5,000 classical texts. Our mission is not just to predict the future, but to empower you to navigate it with clarity, intention, and elemental balance.
                      </p>
                    </div>
                    <div className="pt-6 md:pt-8 border-t border-moss/10 flex gap-8 md:gap-12">
                      <div>
                        <div className="text-2xl md:text-4xl font-serif text-aura-gold mb-1 md:mb-2">50k+</div>
                        <div className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] text-ink-black/40 font-bold">Community Members</div>
                      </div>
                      <div>
                        <div className="text-2xl md:text-4xl font-serif text-aura-gold mb-1 md:mb-2">100%</div>
                        <div className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] text-ink-black/40 font-bold">Ethically Sourced</div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 md:gap-6 relative">
                    <div className="absolute inset-0 bg-aura-gold/5 rounded-full blur-2xl md:blur-3xl animate-pulse" />
                    <div className="relative aspect-[4/5] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border-2 border-white">
                      <img src="https://picsum.photos/seed/community1/400/500" alt="Community" className="w-full h-full object-cover opacity-90 hover:scale-110 transition-transform duration-1000" referrerPolicy="no-referrer" />
                    </div>
                    <div className="relative aspect-[4/5] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border-2 border-white mt-8 md:mt-12">
                      <img src="https://picsum.photos/seed/community2/400/500" alt="Heritage" className="w-full h-full object-cover opacity-90 hover:scale-110 transition-transform duration-1000" referrerPolicy="no-referrer" />
                    </div>
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {step === 'troubles' && (
            <motion.div 
              key="troubles"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="max-w-4xl mx-auto text-center space-y-10 md:space-y-16"
            >
              <div className="space-y-4 md:space-y-6">
                <div className="w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full overflow-hidden border-4 border-white shadow-2xl mb-4 md:mb-8 relative group">
                  <div className="absolute inset-0 bg-aura-gold/20 group-hover:bg-transparent transition-colors z-10" />
                  <img src="https://picsum.photos/seed/master/200/200" alt="Master" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                </div>
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] text-aura-gold">The Master's Presence</span>
                <h2 className="text-2xl md:text-5xl font-serif text-ink-black tracking-tight leading-tight px-4">"Welcome, seeker. What <span className="italic text-aura-gold underline decoration-aura-gold/30 underline-offset-8">weighs</span> on your heart today?"</h2>
                <p className="text-moss text-[9px] md:text-sm uppercase tracking-[0.2em] md:tracking-[0.3em] font-bold">Choose a path to begin your healing journey</p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 px-4 md:px-0">
                {[
                  { id: 'love', icon: Heart, label: 'Love & Connection', color: 'bg-healing-pink/10 text-healing-pink border-healing-pink/20' },
                  { id: 'study', icon: BookOpen, label: 'Growth & Learning', color: 'bg-sage/10 text-moss border-sage/20' },
                  { id: 'work', icon: Briefcase, label: 'Career & Purpose', color: 'bg-aura-gold/10 text-aura-gold border-aura-gold/20' },
                  { id: 'emotional', icon: Smile, label: 'Inner Peace', color: 'bg-serene-blue/10 text-serene-blue border-serene-blue/20' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleTroubleSelect(item.label)}
                    className={cn(
                      "group p-6 md:p-10 bg-white/80 backdrop-blur-md hover:bg-white transition-all duration-500 flex flex-col items-center gap-4 md:gap-6 border rounded-[1.5rem] md:rounded-[2rem] shadow-lg hover:shadow-2xl hover:-translate-y-2",
                      item.color
                    )}
                  >
                    <div className="p-3 md:p-5 rounded-full bg-white shadow-inner group-hover:scale-110 transition-transform duration-500">
                      <item.icon className="w-6 h-6 md:w-10 md:h-10" />
                    </div>
                    <span className="text-[9px] md:text-xs font-bold uppercase tracking-[0.1em] md:tracking-[0.2em] text-ink-black group-hover:text-aura-gold transition-colors text-center">{item.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'birth-info' && (
            <motion.div 
              key="birth-info"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16 items-center px-4 md:px-0"
            >
              <div className="lg:col-span-5 space-y-6 md:space-y-8 text-center lg:text-left">
                <div className="space-y-3 md:space-y-4">
                  <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] text-aura-gold">Cosmic Blueprint</span>
                  <h2 className="text-3xl md:text-6xl font-serif text-ink-black leading-tight tracking-tight">The Stars <br className="hidden md:block" /><span className="italic text-aura-gold">Align</span> at Birth</h2>
                  <p className="text-moss text-base md:text-lg leading-relaxed font-light">
                    To decode your unique energy signature, I require the precise coordinates of your arrival in this physical realm.
                  </p>
                </div>
                <div className="pt-4 md:pt-8 space-y-4 md:space-y-6">
                  <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-white/40 rounded-xl md:rounded-2xl border border-white/50 shadow-sm text-left">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-aura-gold/10 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-aura-gold" />
                    </div>
                    <div>
                      <p className="text-[10px] md:text-xs font-bold text-ink-black uppercase tracking-widest">Privacy First</p>
                      <p className="text-[8px] md:text-[10px] text-moss uppercase tracking-widest">Your data is sacred and encrypted</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-white/40 rounded-xl md:rounded-2xl border border-white/50 shadow-sm text-left">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-serene-blue/10 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-serene-blue" />
                    </div>
                    <div>
                      <p className="text-[10px] md:text-xs font-bold text-ink-black uppercase tracking-widest">AI-Powered Wisdom</p>
                      <p className="text-[8px] md:text-[10px] text-moss uppercase tracking-widest">Synthesizing 5000+ classical texts</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 bg-white/80 backdrop-blur-2xl p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] border border-white/50 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-aura-gold/5 rounded-full blur-[60px] md:blur-[80px] -mr-24 md:-mr-32 -mt-24 md:-mt-32" />
                <form onSubmit={handleSubmitInfo} className="space-y-8 md:space-y-10 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                    <div className="space-y-2 md:space-y-3">
                      <label className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-ink-black">Full Name</label>
                      <div className="relative group">
                        <User className="absolute left-0 bottom-3 w-4 h-4 md:w-5 md:h-5 text-moss/40 group-focus-within:text-aura-gold transition-colors" />
                        <input 
                          required
                          type="text" 
                          placeholder="Your name"
                          className="w-full bg-transparent border-b-2 border-moss/10 py-2 md:py-3 pl-8 md:pl-10 focus:outline-none focus:border-aura-gold transition-all text-ink-black placeholder:text-moss/30 font-medium text-sm md:text-base"
                          value={userData.name}
                          onChange={e => setUserData({...userData, name: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2 md:space-y-3">
                      <label className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-ink-black">Email Address</label>
                      <div className="relative group">
                        <Mail className="absolute left-0 bottom-3 w-4 h-4 md:w-5 md:h-5 text-moss/40 group-focus-within:text-aura-gold transition-colors" />
                        <input 
                          required
                          type="email" 
                          placeholder="destiny@theauralab.com"
                          className="w-full bg-transparent border-b-2 border-moss/10 py-2 md:py-3 pl-8 md:pl-10 focus:outline-none focus:border-aura-gold transition-all text-ink-black placeholder:text-moss/30 font-medium text-sm md:text-base"
                          value={userData.email}
                          onChange={e => setUserData({...userData, email: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                    <div className="space-y-2 md:space-y-3">
                      <label className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-ink-black">Gender</label>
                      <div className="relative group">
                        <select 
                          required
                          className="w-full bg-transparent border-b-2 border-moss/10 py-2 md:py-3 focus:outline-none focus:border-aura-gold transition-all appearance-none text-ink-black font-medium cursor-pointer text-sm md:text-base"
                          value={userData.gender}
                          onChange={e => setUserData({...userData, gender: e.target.value})}
                        >
                          <option value="" className="bg-white">Select Gender</option>
                          <option value="male" className="bg-white">Male</option>
                          <option value="female" className="bg-white">Female</option>
                          <option value="non-binary" className="bg-white">Non-Binary</option>
                        </select>
                        <ChevronDown className="absolute right-0 bottom-3 w-4 h-4 md:w-5 md:h-5 text-moss/40 pointer-events-none" />
                      </div>
                    </div>
                    <div className="space-y-2 md:space-y-3">
                      <label className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-ink-black">Birth Date</label>
                      <div className="relative group">
                        <Calendar className="absolute left-0 bottom-3 w-4 h-4 md:w-5 md:h-5 text-moss/40 group-focus-within:text-aura-gold transition-colors" />
                        <input 
                          required
                          type="date" 
                          className="w-full bg-transparent border-b-2 border-moss/10 py-2 md:py-3 pl-8 md:pl-10 focus:outline-none focus:border-aura-gold transition-all text-ink-black font-medium cursor-pointer text-sm md:text-base"
                          value={userData.birthDate}
                          onChange={e => setUserData({...userData, birthDate: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 md:space-y-3">
                    <label className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-ink-black">Birth Time</label>
                    <div className="relative group">
                      <Clock className="absolute left-0 bottom-3 w-4 h-4 md:w-5 md:h-5 text-moss/40 group-focus-within:text-aura-gold transition-colors" />
                      <select 
                        required
                        className="w-full bg-transparent border-b-2 border-moss/10 py-2 md:py-3 pl-8 md:pl-10 focus:outline-none focus:border-aura-gold transition-all appearance-none text-ink-black font-medium cursor-pointer text-sm md:text-base"
                        value={userData.birthTime}
                        onChange={e => setUserData({...userData, birthTime: e.target.value})}
                      >
                        <option value="" className="bg-white">Select Hour</option>
                        <option value="unknown" className="bg-white">Unknown Time</option>
                        <option value="00-02" className="bg-white">23:00 - 01:00 (Zi Hour)</option>
                        <option value="01-03" className="bg-white">01:00 - 03:00 (Chou Hour)</option>
                        <option value="03-05" className="bg-white">03:00 - 05:00 (Yin Hour)</option>
                        <option value="05-07" className="bg-white">05:00 - 07:00 (Mao Hour)</option>
                        <option value="07-09" className="bg-white">07:00 - 09:00 (Chen Hour)</option>
                        <option value="09-11" className="bg-white">09:00 - 11:00 (Si Hour)</option>
                        <option value="11-13" className="bg-white">11:00 - 13:00 (Wu Hour)</option>
                        <option value="13-15" className="bg-white">13:00 - 15:00 (Wei Hour)</option>
                        <option value="15-17" className="bg-white">15:00 - 17:00 (Shen Hour)</option>
                        <option value="17-19" className="bg-white">17:00 - 19:00 (You Hour)</option>
                        <option value="19-21" className="bg-white">19:00 - 21:00 (Xu Hour)</option>
                        <option value="21-23" className="bg-white">21:00 - 23:00 (Hai Hour)</option>
                      </select>
                      <ChevronDown className="absolute right-0 bottom-3 w-4 h-4 md:w-5 md:h-5 text-moss/40 pointer-events-none" />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-aura-gold text-white py-4 md:py-6 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] hover:bg-ink-black transition-all duration-500 shadow-[0_20px_40px_rgba(197,160,89,0.3)] flex items-center justify-center gap-3 md:gap-4 group"
                  >
                    Generate My Report <ChevronRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-2 transition-transform" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {step === 'generating' && (
            <motion.div 
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-2xl mx-auto text-center space-y-10 md:space-y-16 py-16 md:py-32 px-4 md:px-0"
            >
              <div className="relative w-40 h-40 md:w-56 md:h-56 mx-auto">
                <div className="absolute inset-0 border-4 md:border-8 border-moss/5 rounded-full" />
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-t-4 md:border-t-8 border-aura-gold rounded-full shadow-[0_0_20px_rgba(197,160,89,0.2)] md:shadow-[0_0_30px_rgba(197,160,89,0.3)]"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <Sparkles className="w-12 h-12 md:w-20 md:h-20 text-aura-gold animate-pulse drop-shadow-[0_0_10px_rgba(197,160,89,0.4)] md:drop-shadow-[0_0_20px_rgba(197,160,89,0.6)]" />
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="absolute inset-0 bg-aura-gold/20 blur-xl md:blur-2xl rounded-full"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-4 md:space-y-6">
                <h2 className="text-2xl md:text-4xl font-serif italic text-ink-black tracking-tight leading-tight">Consulting the <br className="md:hidden" />Ancient Scripts...</h2>
                <div className="w-full h-2 bg-moss/10 overflow-hidden rounded-full shadow-inner">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-aura-gold to-healing-pink"
                    initial={{ width: 0 }}
                    animate={{ width: `${loadingProgress}%` }}
                  />
                </div>
                <div className="flex justify-between items-center px-2">
                  <span className="text-[8px] md:text-[10px] text-aura-gold uppercase tracking-[0.3em] md:tracking-[0.4em] font-bold">Aligning Elements</span>
                  <span className="text-[8px] md:text-[10px] text-ink-black uppercase tracking-[0.3em] md:tracking-[0.4em] font-bold">{Math.round(loadingProgress)}% Complete</span>
                </div>
              </div>
              <p className="text-base md:text-lg italic text-moss font-serif px-4">"The ink is flowing, your destiny is taking shape in the ethereal light."</p>
            </motion.div>
          )}

          {step === 'report' && report && (
            <motion.div 
              key="report"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-24"
            >
              {(() => {
                const sortedElements = Object.entries(report.elements).sort((a, b) => b[1] - a[1]);
                const dominantElement = sortedElements[0][0];
                const weakestElement = sortedElements[sortedElements.length - 1][0];
                const dominantData = elementData[dominantElement] || elementData['wood'];
                const DominantIcon = dominantData.icon;
                const otherElements = sortedElements.slice(1);

                return (
                  <>
                    {/* Hero Section */}
                    <div className="text-center space-y-4 md:space-y-6 mb-12 md:mb-16">
                      <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] text-aura-gold">Your Cosmic Blueprint</span>
                      <h2 className="text-3xl md:text-7xl font-serif text-ink-black tracking-tight leading-tight">Destiny <span className="italic text-aura-gold underline decoration-aura-gold/30 underline-offset-8">Revelation</span></h2>
                    </div>

                    <div className="max-w-5xl mx-auto bg-white/80 backdrop-blur-2xl rounded-[2rem] md:rounded-[3rem] shadow-2xl p-8 md:p-20 text-center relative overflow-hidden mb-16 md:mb-24 border border-white/50">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 md:w-96 h-64 md:h-96 bg-aura-gold/10 rounded-full blur-[80px] md:blur-[100px] pointer-events-none" />
                      <div className="absolute bottom-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-healing-pink/5 rounded-full blur-[60px] md:blur-[80px] pointer-events-none" />
                      <Sparkles className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-6 md:mb-8 text-aura-gold drop-shadow-[0_0_10px_rgba(197,160,89,0.4)]" />
                      <h3 className="text-2xl md:text-5xl font-serif text-ink-black mb-6 md:mb-8">{dominantData.title}</h3>
                      <p className="text-base md:text-xl italic leading-relaxed max-w-3xl mx-auto mb-8 md:mb-12 font-light px-4">
                        "{report.summary}"
                      </p>
                      <button className="bg-aura-gold text-white px-8 md:px-10 py-4 md:py-5 rounded-full text-[10px] md:text-xs tracking-[0.2em] uppercase font-bold hover:bg-ink-black transition-all duration-500 flex items-center gap-3 mx-auto shadow-[0_20px_40px_rgba(197,160,89,0.3)] active:scale-95">
                        <Share2 className="w-4 h-4" /> Share Your Aura
                      </button>
                    </div>

                    {/* Elemental Signature */}
                    <div className="mb-20 md:mb-32">
                      <div className="flex items-center gap-4 mb-8 md:mb-12">
                        <div className="h-px flex-grow bg-moss/10" />
                        <h3 className="text-xl md:text-2xl font-serif text-ink-black tracking-tight">Your Elemental <span className="italic text-aura-gold">Signature</span></h3>
                        <div className="h-px flex-grow bg-moss/10" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-8">
                        {/* Dominant Element Card */}
                        <div className="md:col-span-2 bg-white/80 backdrop-blur-md border border-white/50 rounded-[1.5rem] md:rounded-[2rem] p-8 md:p-10 relative overflow-hidden flex flex-col justify-between min-h-[250px] md:min-h-[300px] group shadow-xl hover:shadow-2xl transition-all">
                           <div className="relative z-10">
                             <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] text-aura-gold mb-2 block">Dominant Element</span>
                             <h4 className="text-4xl md:text-5xl font-serif text-ink-black">{dominantElement}</h4>
                           </div>
                           <div className="relative z-10 self-center mt-4">
                             <div className="p-6 md:p-8 rounded-full bg-white shadow-inner group-hover:scale-110 transition-transform duration-700">
                               <DominantIcon className="w-16 h-16 md:w-20 md:h-20 text-aura-gold" />
                             </div>
                           </div>
                           <div className="absolute inset-0 opacity-5 bg-[url('https://picsum.photos/seed/nebula/800/600')] bg-cover bg-center mix-blend-multiply pointer-events-none" />
                        </div>

                        {/* Other Elements */}
                        {otherElements.map((el, idx) => {
                          const ElIcon = elementData[el[0]]?.icon || Sparkles;
                          return (
                            <div key={el[0]} className="bg-white/60 backdrop-blur-sm border border-white/30 rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 flex flex-col items-center justify-center gap-4 md:gap-6 min-h-[250px] md:min-h-[300px] hover:bg-white transition-all shadow-lg hover:shadow-xl group">
                              <div className="p-3 md:p-4 rounded-full bg-white shadow-sm group-hover:scale-110 transition-transform">
                                <ElIcon className="w-6 h-6 md:w-8 md:h-8 text-moss/60" />
                              </div>
                              <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-ink-black">{el[0]}</span>
                              <div className="w-full space-y-2">
                                <div className="w-full h-2 bg-moss/5 rounded-full overflow-hidden shadow-inner">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(el[1] / 100) * 100}%` }}
                                    transition={{ delay: 0.5 + idx * 0.1, duration: 1 }}
                                    className="h-full bg-aura-gold/40" 
                                  />
                                </div>
                                <p className="text-[9px] md:text-[10px] text-center text-moss font-bold uppercase tracking-widest">{el[1]}%</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Celestial Insight */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center mb-20 md:mb-32">
                      <div className="space-y-8 md:space-y-10 text-center md:text-left">
                        <div className="space-y-3 md:space-y-4">
                          <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] text-aura-gold">Ethereal Wisdom</span>
                          <h3 className="text-3xl md:text-4xl font-serif text-ink-black tracking-tight leading-tight">Celestial <span className="italic text-aura-gold">Insight</span></h3>
                        </div>
                        <div className="space-y-4 md:space-y-6 text-sm md:text-base text-moss leading-relaxed font-light">
                          <p>Current celestial alignments suggest a temporary imbalance in your {dominantElement}-{weakestElement} cycle. This may manifest as a feeling of creative stagnation or indecisiveness in professional pursuits.</p>
                          <p>To restore harmony, focus on the "Void" — the space between thoughts. Your healing path involves surrendering the need for control and allowing the natural current of the universe to guide your next transition.</p>
                        </div>
                        <div className="border-l-4 border-aura-gold/30 pl-6 md:pl-8 py-3 md:py-4 bg-aura-gold/5 rounded-r-2xl">
                          <p className="text-aura-gold italic font-serif text-xl md:text-2xl leading-relaxed">"{dominantData.quote}"</p>
                        </div>
                      </div>
                      <div className="rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl border-4 md:border-8 border-white relative group">
                        <img src="https://picsum.photos/seed/meditate/800/1000?grayscale" alt="Meditation" className="w-full h-auto object-cover opacity-90 group-hover:scale-105 transition-transform duration-1000" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-aura-gold/10 mix-blend-overlay" />
                      </div>
                    </div>

                    {/* Healing Recommendations */}
                    <div className="mb-20 md:mb-32">
                      <div className="flex items-center gap-4 mb-8 md:mb-12">
                        <div className="h-px flex-grow bg-moss/10" />
                        <h3 className="text-xl md:text-2xl font-serif text-ink-black tracking-tight text-center md:text-left">Healing <span className="italic text-aura-gold">Recommendations</span></h3>
                        <div className="h-px flex-grow bg-moss/10" />
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16">
                        <div className="lg:col-span-7 group cursor-pointer" onClick={() => setStep('diy')}>
                          <div className="relative rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-white aspect-[16/9] mb-6 md:mb-8 border border-white/50 shadow-2xl group-hover:shadow-aura-gold/20 transition-all duration-500">
                            <img src="https://picsum.photos/seed/crystalbracelet/800/450" alt="Bracelet" className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-1000" referrerPolicy="no-referrer" />
                            <div className="absolute top-4 md:top-6 right-4 md:right-6 bg-aura-gold text-white text-[8px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] px-4 md:px-5 py-1.5 md:py-2 rounded-full font-bold shadow-xl">
                              Curated For You
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-ink-black/60 via-transparent to-transparent flex items-end p-6 md:p-10">
                              <button className="bg-white text-ink-black px-6 md:px-10 py-3 md:py-5 rounded-full text-[10px] md:text-xs tracking-[0.2em] uppercase font-bold hover:bg-aura-gold hover:text-white transition-all duration-500 flex items-center gap-2 md:gap-3 shadow-2xl active:scale-95">
                                Customize in DIY Studio <ArrowRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="flex justify-between items-center px-2 md:px-4">
                            <div>
                              <h4 className="text-xl md:text-2xl font-serif text-ink-black tracking-tight">The Aura Lab Custom Wristband</h4>
                              <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-moss mt-1 md:mt-2">Infused with {dominantElement} & {weakestElement} Energy</p>
                            </div>
                            <span className="text-xl md:text-2xl font-serif text-aura-gold">$88</span>
                          </div>
                        </div>
                        
                        <div className="lg:col-span-5 space-y-10 md:space-y-16 pt-0 md:pt-4">
                          <div className="bg-white/60 backdrop-blur-md p-8 md:p-10 rounded-[2rem] border border-white/50 shadow-xl">
                            <h5 className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] text-ink-black mb-6 md:mb-8 border-b border-moss/10 pb-4">Aura Colors</h5>
                            <div className="flex gap-4 md:gap-6">
                              {dominantData.colors.map(color => (
                                <div key={color} className="group relative">
                                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl shadow-lg border-2 md:border-4 border-white transition-transform group-hover:scale-110 duration-500" style={{ backgroundColor: color }} />
                                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[7px] md:text-[8px] font-bold uppercase tracking-widest text-moss whitespace-nowrap">{color}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="bg-white/60 backdrop-blur-md p-8 md:p-10 rounded-[2rem] border border-white/50 shadow-xl">
                            <h5 className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] text-ink-black mb-6 md:mb-8 border-b border-moss/10 pb-4">Healing Stones</h5>
                            <ul className="space-y-4 md:space-y-5">
                              {dominantData.stones.map(stone => (
                                <li key={stone} className="flex items-center gap-3 md:gap-4 text-xs md:text-sm text-moss font-medium group">
                                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-aura-gold group-hover:scale-150 transition-transform" /> {stone}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Email Report CTA */}
                    <div className="mb-20 md:mb-32 bg-white/80 backdrop-blur-2xl border border-white/50 text-ink-black rounded-[2rem] md:rounded-[3rem] p-8 md:p-20 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-10 md:gap-16 shadow-2xl">
                      <div className="absolute top-0 right-0 w-full h-full bg-[url('https://picsum.photos/seed/constellation/1000/500')] opacity-5 mix-blend-multiply pointer-events-none" />
                      <div className="relative z-10 lg:w-1/2 space-y-4 md:space-y-6 text-center lg:text-left">
                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] text-aura-gold">Premium Offering</span>
                        <h3 className="text-2xl md:text-4xl font-serif text-ink-black leading-tight">Unlock Your 2026 <br /><span className="italic text-aura-gold">Annual Destiny Book</span></h3>
                        <p className="text-moss text-sm md:text-base leading-relaxed font-light px-4 md:px-0">
                          Receive a comprehensive 20-page PDF detailing your monthly fortune, wealth directions, relationship compatibility, and advanced Feng Shui adjustments directly to your inbox.
                        </p>
                      </div>
                      <div className="relative z-10 lg:w-1/2 w-full">
                        <form 
                          onSubmit={(e) => {
                            e.preventDefault();
                            console.log(`Detailed report sent to ${userData.email}! Please check your inbox.`);
                            setShowSuccess(true);
                            setTimeout(() => setShowSuccess(false), 3000);
                          }}
                          className="flex flex-col gap-4 md:gap-6"
                        >
                          <div className="relative group">
                            <Mail className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-moss/40 group-focus-within:text-aura-gold transition-colors" />
                            <input 
                              type="email" 
                              required
                              value={userData.email}
                              onChange={(e) => setUserData({...userData, email: e.target.value})}
                              placeholder="Enter your email address"
                              className="w-full bg-white/50 border-2 border-moss/10 rounded-xl md:rounded-2xl px-12 md:px-16 py-4 md:py-5 text-sm text-ink-black placeholder:text-moss/30 focus:outline-none focus:border-aura-gold transition-all font-medium"
                            />
                          </div>
                          <button 
                            type="submit"
                            className="bg-aura-gold text-white px-8 md:px-10 py-4 md:py-6 rounded-xl md:rounded-2xl text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.3em] uppercase font-bold hover:bg-ink-black transition-all duration-500 flex items-center justify-center gap-3 md:gap-4 shadow-[0_20px_40px_rgba(197,160,89,0.3)] active:scale-95 group"
                          >
                            Send to My Email <Send className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                          </button>
                        </form>
                      </div>
                    </div>

                    {/* Consult Master CTA */}
                    <div className="mb-20 md:mb-32 bg-white/60 backdrop-blur-xl border border-white/50 rounded-[2rem] md:rounded-[3rem] p-8 md:p-20 text-center relative overflow-hidden shadow-2xl">
                      <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-aura-gold/10 rounded-full blur-[80px] md:blur-[100px] pointer-events-none" />
                      <div className="absolute bottom-0 left-0 w-48 md:w-64 h-48 md:h-64 bg-serene-blue/5 rounded-full blur-[60px] md:blur-[80px] pointer-events-none" />
                      <div className="p-4 md:p-6 rounded-full bg-white shadow-inner w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 md:mb-8 flex items-center justify-center">
                        <YinYangIcon className="w-8 h-8 md:w-10 md:h-10 text-aura-gold" />
                      </div>
                      <h3 className="text-2xl md:text-4xl font-serif text-ink-black mb-4 md:mb-6 tracking-tight">Seek Deeper <span className="italic text-aura-gold">Wisdom</span></h3>
                      <p className="text-moss text-base md:text-lg italic leading-relaxed max-w-2xl mx-auto mb-8 md:mb-12 font-light px-4">
                        "The stars reveal the map, but the master illuminates the path. Share your current struggles, and let the ancient wisdom guide your next steps."
                      </p>
                      <button 
                        onClick={() => setStep('troubles')}
                        className="bg-aura-gold text-white px-8 md:px-12 py-4 md:py-6 rounded-full text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.3em] uppercase font-bold flex items-center gap-3 md:gap-4 mx-auto hover:bg-ink-black transition-all duration-500 shadow-[0_20px_40px_rgba(197,160,89,0.3)] active:scale-95"
                      >
                        <MessageSquare className="w-4 h-4 md:w-5 md:h-5" /> Consult Master Now
                      </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-center gap-12 border-t border-moss/10 pt-16">
                      <button className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] font-bold text-moss hover:text-aura-gold transition-all group">
                        <Download className="w-5 h-5 group-hover:-translate-y-1 transition-transform" /> Download PDF
                      </button>
                      <button 
                        onClick={() => setStep('intro')}
                        className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] font-bold text-moss hover:text-aura-gold transition-all group"
                      >
                        <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" /> New Analysis
                      </button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          )}

          {step === 'report' && (
            <motion.button
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setStep('troubles')}
              className="fixed bottom-8 right-8 z-50 bg-ink-black text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 hover:bg-aura-gold hover:text-ink-black transition-all duration-300 group"
            >
              <div className="relative">
                <YinYangIcon className="w-5 h-5 group-hover:animate-spin" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              </div>
              <span className="font-serif italic tracking-wide">Consult Master</span>
            </motion.button>
          )}

          {step === 'chat' && (
            <motion.div 
              key="chat"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-12"
            >
              <ChatInterface 
                messages={chatMessages} 
                onSendMessage={handleSendMessage} 
                isLoading={isChatting} 
                onBack={() => setStep('report')} 
              />
            </motion.div>
          )}

          {step === 'diy' && (
            <motion.div 
              key="diy"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-12"
            >
              <BraceletBuilder 
                recommendedElement={
                  report ? Object.entries(report.elements).sort((a, b) => a[1] - b[1])[0][0] : undefined
                } 
                onAddToCart={addToCart}
                onShare={(creation) => setSharedCreations(prev => [creation, ...prev.slice(0, 6)])}
              />
              <div className="text-center">
                <button 
                  onClick={() => setStep('report')}
                  className="text-xs uppercase tracking-widest font-bold text-ink-gray hover:text-white transition-colors"
                >
                  Back to Report
                </button>
              </div>
            </motion.div>
          )}

          {step === 'shop' && (
            <motion.div 
              key="shop"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-12"
            >
              <Shop onNav={setStep} report={report} onAddToCart={addToCart} />
              <div className="text-center pb-20">
                <button 
                  onClick={() => setStep(report ? 'report' : 'intro')}
                  className="text-xs uppercase tracking-widest font-bold text-moss hover:text-aura-gold transition-colors flex items-center gap-3 mx-auto"
                >
                  <ChevronLeft className="w-4 h-4" /> {report ? 'Back to Report' : 'Back to Home'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-12 md:bottom-12 left-1/2 -translate-x-1/2 z-[100] bg-white/90 backdrop-blur-2xl border border-aura-gold/30 px-6 md:px-8 py-3 md:py-4 rounded-full shadow-2xl flex items-center gap-3 md:gap-4 w-[90%] md:w-auto justify-center"
          >
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-aura-gold/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-aura-gold" />
            </div>
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-ink-black text-center">{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
      <Footer />
      
      {/* Disclaimer */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 text-center w-full px-6">
        <p className="text-[7px] md:text-[8px] uppercase tracking-[0.2em] md:tracking-[0.3em] text-moss/40 font-bold max-w-md mx-auto leading-relaxed">
          For entertainment and psychological comfort purposes only.<br/>
          Your destiny is shaped by your actions as much as the stars.
        </p>
      </div>
      </div>
    </div>
  );
}
