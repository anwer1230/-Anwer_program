import React, { useState } from 'react';
import {
  Star,
  Zap,
  Gift,
  Coins,
  ShieldCheck,
  CreditCard,
  History,
  CheckCircle2,
  X,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

interface TelegramStarsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendStarReaction?: (stars: number) => void;
}

export const TelegramStarsModal: React.FC<TelegramStarsModalProps> = ({
  isOpen,
  onClose,
  onSendStarReaction,
}) => {
  const [starsBalance, setStarsBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('telegram_stars_balance');
      if (saved) return parseInt(saved, 10);
    } catch (e) {}
    return 1500;
  });

  const [activeTab, setActiveTab] = useState<'buy' | 'send' | 'history'>('buy');
  const [selectedPack, setSelectedPack] = useState<number>(500);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  if (!isOpen) return null;

  const starPacks = [
    { stars: 50, price: '$0.99', popular: false, icon: '⭐' },
    { stars: 150, price: '$2.99', popular: false, icon: '🌟' },
    { stars: 500, price: '$9.99', popular: true, icon: '💫' },
    { stars: 1000, price: '$18.99', popular: false, icon: '✨' },
    { stars: 2500, price: '$44.99', popular: false, icon: '👑' },
  ];

  const transactions = [
    { title: 'شراء باقة نجوم تليجرام', amount: '+500 ⭐', date: 'اليوم، 04:20 م', type: 'in' },
    { title: 'تفاعل بنجوم على منشور أكاديمي', amount: '-50 ⭐', date: 'أمس، 09:15 ص', type: 'out' },
    { title: 'اشتراك شهري بقناة متميزة', amount: '-250 ⭐', date: '14/08/2026', type: 'out' },
    { title: 'مكافأة نشاط بالمجموعة الأكاديمية', amount: '+100 ⭐', date: '10/08/2026', type: 'in' },
  ];

  const handleBuy = () => {
    const newBal = starsBalance + selectedPack;
    setStarsBalance(newBal);
    try {
      localStorage.setItem('telegram_stars_balance', String(newBal));
    } catch (e) {}
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const handleSendStars = (amount: number) => {
    if (starsBalance < amount) return;
    const newBal = starsBalance - amount;
    setStarsBalance(newBal);
    try {
      localStorage.setItem('telegram_stars_balance', String(newBal));
    } catch (e) {}
    if (onSendStarReaction) onSendStarReaction(amount);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-lg bg-zinc-950 border border-amber-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-zinc-100"
        dir="rtl"
      >
        {/* Header Banner */}
        <div className="p-5 bg-gradient-to-r from-amber-950/70 via-zinc-900 to-zinc-950 border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl shadow-inner animate-bounce">
              ⭐
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">نجوم تليجرام (Telegram Stars)</h2>
                <span className="px-2 py-0.5 text-[10px] bg-amber-500/20 text-amber-300 rounded-md font-extrabold border border-amber-500/30">
                  رسمي 🌟
                </span>
              </div>
              <p className="text-xs text-zinc-400">العملة الرقمية الرسمية للمحتوى والتفاعلات بالتطبيق</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Balance Card */}
        <div className="p-5 bg-zinc-900/60 border-b border-zinc-800/80">
          <div className="p-4 bg-gradient-to-br from-amber-500/10 via-zinc-900 to-zinc-950 border border-amber-500/30 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs text-zinc-400 font-bold block">رصيدك الحالي من النجوم:</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight">
                  {starsBalance.toLocaleString()}
                </span>
                <span className="text-lg">⭐</span>
              </div>
            </div>
            <div className="text-left">
              <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                محفظة نشطة ⚡
              </span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1.5 mt-4 p-1 bg-zinc-950 rounded-xl border border-zinc-800">
            <button
              onClick={() => setActiveTab('buy')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'buy' ? 'bg-amber-500 text-black shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              شراء النجوم ⭐
            </button>
            <button
              onClick={() => setActiveTab('send')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'send' ? 'bg-amber-500 text-black shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              إرسال تفاعل 🎁
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'history' ? 'bg-amber-500 text-black shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              سجل المعاملات 📜
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto max-h-[60vh] scrollbar-thin">
          {activeTab === 'buy' && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-zinc-300 block">اختر باقة النجوم المطلوبة:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {starPacks.map((pack) => (
                  <button
                    key={pack.stars}
                    onClick={() => setSelectedPack(pack.stars)}
                    className={`p-3.5 rounded-2xl text-right flex items-center justify-between border transition-all ${
                      selectedPack === pack.stars
                        ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{pack.icon}</span>
                      <div>
                        <div className="font-extrabold text-sm text-amber-300">{pack.stars} نجمة</div>
                        <div className="text-[11px] text-zinc-400">{pack.price}</div>
                      </div>
                    </div>
                    {pack.popular && (
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-black border border-amber-500/30">
                        الأكثر طلباً 🔥
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <button
                onClick={handleBuy}
                className="w-full mt-4 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-black text-xs sm:text-sm rounded-2xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>إتمام الشراء وإضافة {selectedPack} نجمة فوراً</span>
              </button>
            </div>
          )}

          {activeTab === 'send' && (
            <div className="space-y-4">
              <span className="text-xs font-bold text-zinc-300 block">إرسال هدية أو تفاعل بالنجوم للمحادثة الحالية:</span>
              <div className="grid grid-cols-3 gap-2">
                {[10, 50, 100, 250, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => handleSendStars(amt)}
                    disabled={starsBalance < amt}
                    className="p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-1 disabled:opacity-40 transition-all hover:scale-105"
                  >
                    <span className="text-lg">🌟</span>
                    <span className="text-xs font-black text-amber-300">{amt} نجمة</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-2">
              {transactions.map((tx, i) => (
                <div
                  key={i}
                  className="p-3 bg-zinc-900 border border-zinc-800/80 rounded-2xl flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-zinc-200">{tx.title}</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">{tx.date}</div>
                  </div>
                  <span
                    className={`text-xs font-extrabold ${
                      tx.type === 'in' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {tx.amount}
                  </span>
                </div>
              ))}
            </div>
          )}

          {showSuccessToast && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>تمت العملية بنجاح وتحديث رصيد النجوم!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
