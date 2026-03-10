'use client';

import Link from 'next/link';
import { Shield, Zap, Users, HardDrive, ArrowRight, Globe } from 'lucide-react';
import { usePeerStore } from '@/store/usePeerStore';

const dict = {
  en: {
    navTitle: 'Share AboElnazer',
    launchApp: 'Launch App',
    heroBadge: '100% Peer-to-Peer',
    heroTitle1: 'Serverless.',
    heroTitle2: 'Private.',
    heroTitle3: 'Instant.',
    heroDesc: 'Share AboElnazer is a browser-based chat and file sharing application. No servers store your messages. No accounts required. Just direct, encrypted connections between you and your peers.',
    startChatting: 'Start Chatting',
    learnMore: 'Learn More',
    aliceMsg: 'Here\'s the design file for the new landing page.',
    bobMsg: 'Got it! Downloading directly from you now at 50MB/s 🚀',
    featuresTitle: 'Everything you need, nothing you don\'t.',
    featuresDesc: 'Built on WebRTC, Share AboElnazer provides a seamless communication experience without relying on central servers.',
    feature1Title: 'True Privacy',
    feature1Desc: 'Messages and files travel directly between peers. No central database stores your chat history or personal data.',
    feature2Title: 'Unlimited File Transfers',
    feature2Desc: 'Send files of any size. Since data goes peer-to-peer, you\'re only limited by your own network speed, not server caps.',
    feature3Title: 'Local Network Discovery',
    feature3Desc: 'Automatically find and connect to other users on the same Wi-Fi or LAN without needing to share room codes.',
    footerText: 'Built with Next.js, WebRTC, and Tailwind CSS.',
    todayAt: 'Today at',
  },
  ar: {
    navTitle: 'Share AboElnazer',
    launchApp: 'تشغيل التطبيق',
    heroBadge: '١٠٠٪ ند للند (P2P)',
    heroTitle1: 'بدون خوادم.',
    heroTitle2: 'خاص.',
    heroTitle3: 'فوري.',
    heroDesc: 'Share AboElnazer هو تطبيق دردشة ومشاركة ملفات يعمل عبر المتصفح. لا توجد خوادم تخزن رسائلك. لا يتطلب حسابات. فقط اتصالات مباشرة ومشفرة بينك وبين أقرانك.',
    startChatting: 'ابدأ الدردشة',
    learnMore: 'اعرف المزيد',
    aliceMsg: 'إليك ملف التصميم للصفحة الرئيسية الجديدة.',
    bobMsg: 'وصل! جاري التحميل مباشرة منك الآن بسرعة ٥٠ ميجابايت/ث 🚀',
    featuresTitle: 'كل ما تحتاجه، ولا شيء غير ذلك.',
    featuresDesc: 'مبني على WebRTC، يوفر Share AboElnazer تجربة اتصال سلسة دون الاعتماد على خوادم مركزية.',
    feature1Title: 'خصوصية حقيقية',
    feature1Desc: 'تنتقل الرسائل والملفات مباشرة بين الأقران. لا توجد قاعدة بيانات مركزية تخزن سجل الدردشة أو بياناتك الشخصية.',
    feature2Title: 'نقل ملفات غير محدود',
    feature2Desc: 'أرسل ملفات بأي حجم. نظراً لأن البيانات تنتقل من ند لند، فأنت مقيد فقط بسرعة شبكتك الخاصة، وليس بحدود الخادم.',
    feature3Title: 'اكتشاف الشبكة المحلية',
    feature3Desc: 'ابحث تلقائياً واتصل بالمستخدمين الآخرين على نفس شبكة Wi-Fi أو الشبكة المحلية (LAN) دون الحاجة إلى مشاركة رموز الغرف.',
    footerText: 'تم البناء باستخدام Next.js و WebRTC و Tailwind CSS.',
    todayAt: 'اليوم الساعة',
  }
};

export default function LandingPage() {
  const { language, setLanguage } = usePeerStore();
  const t = dict[language];
  const isRtl = language === 'ar';

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <div 
      className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#7289da] selection:text-white"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Navbar */}
      <nav className="border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#7289da] rounded-lg flex items-center justify-center font-bold text-white">
              N
            </div>
            <span className="font-bold text-xl tracking-tight">{t.navTitle}</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors text-sm font-medium"
            >
              <Globe size={18} />
              {language === 'en' ? 'العربية' : 'English'}
            </button>
            <Link 
              href="/chat" 
              className="bg-[#7289da] hover:bg-[#677bc4] text-white px-5 py-2 rounded-full text-sm font-medium transition-colors"
            >
              {t.launchApp}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {t.heroBadge}
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.1]">
                {t.heroTitle1} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7289da] to-violet-400">
                  {t.heroTitle2}
                </span> <br />
                {t.heroTitle3}
              </h1>
              
              <p className="text-lg text-gray-400 max-w-xl leading-relaxed">
                {t.heroDesc}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/chat" 
                  className="inline-flex items-center justify-center gap-2 bg-[#7289da] hover:bg-[#677bc4] text-white px-8 py-4 rounded-full text-lg font-medium transition-all hover:scale-105 active:scale-95"
                >
                  {t.startChatting} <ArrowRight size={20} className={isRtl ? 'rotate-180' : ''} />
                </Link>
                <a 
                  href="#features" 
                  className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-full text-lg font-medium transition-colors border border-white/10"
                >
                  {t.learnMore}
                </a>
              </div>
            </div>
            
            {/* Hero Visual */}
            <div className="relative lg:h-[600px] rounded-2xl border border-white/10 bg-[#141414] overflow-hidden shadow-2xl shadow-[#7289da]/10">
              <div className="absolute top-0 w-full h-12 border-b border-white/10 bg-[#1a1a1a] flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="p-8 pt-20 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#7289da] flex items-center justify-center font-bold">A</div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="font-medium">{isRtl ? 'أليس' : 'Alice'}</span>
                      <span className="text-xs text-gray-500">{t.todayAt} 10:42 AM</span>
                    </div>
                    <div className="text-gray-300 mt-1">{t.aliceMsg}</div>
                    <div className="mt-2 bg-[#202225] border border-white/5 rounded p-3 flex items-center max-w-sm">
                      <div className="w-10 h-10 bg-[#2f3136] rounded flex items-center justify-center ltr:mr-3 rtl:ml-3">
                        <HardDrive size={20} className="text-[#7289da]" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[#7289da]" dir="ltr">landing-v2.fig</div>
                        <div className="text-xs text-gray-500" dir="ltr">42.5 MB</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center font-bold">B</div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="font-medium">{isRtl ? 'بوب' : 'Bob'}</span>
                      <span className="text-xs text-gray-500">{t.todayAt} 10:43 AM</span>
                    </div>
                    <div className="text-gray-300 mt-1">{t.bobMsg}</div>
                  </div>
                </div>
              </div>
              
              {/* Decorative gradient */}
              <div className={`absolute -bottom-32 ${isRtl ? '-left-32' : '-right-32'} w-96 h-96 bg-[#7289da]/20 rounded-full blur-[128px] pointer-events-none`} />
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-24 bg-[#111] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">{t.featuresTitle}</h2>
            <p className="text-gray-400 text-lg">{t.featuresDesc}</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Shield className="text-emerald-400" size={24} />}
              title={t.feature1Title}
              description={t.feature1Desc}
            />
            <FeatureCard 
              icon={<Zap className="text-yellow-400" size={24} />}
              title={t.feature2Title}
              description={t.feature2Desc}
            />
            <FeatureCard 
              icon={<Users className="text-[#7289da]" size={24} />}
              title={t.feature3Title}
              description={t.feature3Desc}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 text-center text-gray-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <div className="w-6 h-6 bg-[#7289da] rounded flex items-center justify-center font-bold text-white text-xs">
              N
            </div>
            <span className="font-medium text-gray-300">{t.navTitle}</span>
          </div>
          <p className="text-sm">{t.footerText}</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-8 hover:border-white/10 transition-colors">
      <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}
