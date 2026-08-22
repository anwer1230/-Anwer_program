import React, { useState, useEffect } from 'react';
import {
  Lock,
  Unlock,
  ShieldCheck,
  Fingerprint,
  KeyRound,
  Eye,
  EyeOff,
  Clock,
  CheckCircle2,
  X,
  AlertCircle,
} from 'lucide-react';

interface AppLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  isUnlocked: boolean;
  onUnlockSuccess: () => void;
  isSettingsMode?: boolean;
}

export const AppLockModal: React.FC<AppLockModalProps> = ({
  isOpen,
  onClose,
  isUnlocked,
  onUnlockSuccess,
  isSettingsMode = false,
}) => {
  const [pin, setPin] = useState('');
  const [savedPin, setSavedPin] = useState(() => {
    try {
      return localStorage.getItem('telegram_app_lock_pin') || '1234';
    } catch (e) {
      return '1234';
    }
  });
  const [newPin, setNewPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [autoLockTimeout, setAutoLockTimeout] = useState(() => {
    try {
      return localStorage.getItem('telegram_auto_lock_timeout') || '5';
    } catch (e) {
      return '5';
    }
  });
  const [biometricEnabled, setBiometricEnabled] = useState(() => {
    try {
      return localStorage.getItem('telegram_biometric_enabled') === 'true';
    } catch (e) {
      return true;
    }
  });

  if (!isOpen) return null;

  const handleDigitClick = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setErrorMsg('');

      if (nextPin.length === 4) {
        if (nextPin === savedPin) {
          onUnlockSuccess();
        } else {
          setErrorMsg('رمز المرور غير صحيح، حاول مرة أخرى');
          setTimeout(() => setPin(''), 500);
        }
      }
    }
  };

  const handleDeleteDigit = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleBiometricAuth = () => {
    // Simulate biometric check
    onUnlockSuccess();
  };

  const handleSaveSettings = () => {
    if (newPin && newPin.length === 4) {
      setSavedPin(newPin);
      localStorage.setItem('telegram_app_lock_pin', newPin);
    }
    localStorage.setItem('telegram_auto_lock_timeout', autoLockTimeout);
    localStorage.setItem('telegram_biometric_enabled', String(biometricEnabled));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fadeIn" dir="rtl">
      <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-3xl p-6 flex flex-col items-center shadow-2xl text-zinc-100 relative">
        {isSettingsMode && (
          <button
            onClick={onClose}
            className="absolute left-4 top-4 p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Lock Icon */}
        <div className="w-16 h-16 rounded-3xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4 shadow-inner">
          <Lock className="w-8 h-8 animate-bounce" />
        </div>

        <h2 className="text-lg font-black text-white">
          {isSettingsMode ? 'إعدادات قفل التطبيق' : 'أدخل رمز المرور لفتح تليجرام'}
        </h2>
        <p className="text-xs text-zinc-400 text-center mt-1 mb-6">
          {isSettingsMode
            ? 'تشفير وحماية الرسائل والمحادثات بكلمة مرور وبصمة الإصبع'
            : 'التطبيق مقفل برمز حماية مشفر (Passcode Lock)'}
        </p>

        {!isSettingsMode ? (
          <div className="w-full flex flex-col items-center space-y-6">
            {/* PIN Dots Display */}
            <div className="flex items-center gap-4">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full border transition-all duration-200 ${
                    pin.length > i
                      ? 'bg-blue-500 border-blue-400 scale-110 shadow-md shadow-blue-500/50'
                      : 'bg-zinc-900 border-zinc-700'
                  }`}
                />
              ))}
            </div>

            {errorMsg && <div className="text-xs font-bold text-rose-400 animate-shake">{errorMsg}</div>}

            {/* Keypad Grid */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-[260px]">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
                <button
                  key={d}
                  onClick={() => handleDigitClick(d)}
                  className="w-16 h-16 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-xl font-black text-white flex items-center justify-center mx-auto transition-all active:scale-95 shadow-sm"
                >
                  {d}
                </button>
              ))}

              {/* Biometric Button */}
              {biometricEnabled ? (
                <button
                  onClick={handleBiometricAuth}
                  className="w-16 h-16 rounded-full bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto transition-all"
                  title="فتح بالبصمة"
                >
                  <Fingerprint className="w-7 h-7" />
                </button>
              ) : (
                <div />
              )}

              <button
                onClick={() => handleDigitClick('0')}
                className="w-16 h-16 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-xl font-black text-white flex items-center justify-center mx-auto transition-all active:scale-95 shadow-sm"
              >
                0
              </button>

              <button
                onClick={handleDeleteDigit}
                className="w-16 h-16 rounded-full bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center mx-auto transition-all text-xs font-bold"
              >
                مسح
              </button>
            </div>
          </div>
        ) : (
          /* Settings Mode Form */
          <div className="w-full space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">تعيين رمز PIN جديد (4 أرقام):</label>
              <input
                type="password"
                maxLength={4}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder={`الرمز الحالي: ${savedPin}`}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-center text-lg tracking-widest font-mono text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">القفل التلقائي بعد:</label>
              <select
                value={autoLockTimeout}
                onChange={(e) => setAutoLockTimeout(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="1">دقيقة واحدة (1 min)</option>
                <option value="5">5 دقائق</option>
                <option value="60">ساعة واحدة</option>
                <option value="off">إيقاف القفل التلقائي</option>
              </select>
            </div>

            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-zinc-200">فتح بالبصمة / FaceID</span>
              </div>
              <input
                type="checkbox"
                checked={biometricEnabled}
                onChange={(e) => setBiometricEnabled(e.target.checked)}
                className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
              />
            </div>

            <button
              onClick={handleSaveSettings}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-xl transition-all shadow-md shadow-blue-500/25"
            >
              حفظ الإعدادات
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
