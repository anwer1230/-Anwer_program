import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Compass,
  Navigation,
  Clock,
  Radio,
  AlertCircle,
  CheckCircle2,
  X,
  Share2,
  Bell,
  Shield,
} from 'lucide-react';
import { Chat } from '../types';

interface LiveLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  chat: Chat | null;
  onShareLocation?: (lat: number, lng: number, durationMinutes: number) => void;
}

export const LiveLocationModal: React.FC<LiveLocationModalProps> = ({
  isOpen,
  onClose,
  chat,
  onShareLocation,
}) => {
  const [duration, setDuration] = useState<number>(60); // 15, 60, 480 minutes
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: 24.7136, // Riyadh coordinates
    lng: 46.6753,
  });
  const [proximityAlert, setProximityAlert] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [locationShared, setLocationShared] = useState(false);

  useEffect(() => {
    if (isOpen && navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setIsLocating(false);
        },
        () => {
          setIsLocating(false);
        },
        { timeout: 5000 }
      );
    }
  }, [isOpen]);

  if (!isOpen || !chat) return null;

  const durations = [
    { label: '15 دقيقة', value: 15 },
    { label: '1 ساعة', value: 60 },
    { label: '8 ساعات', value: 480 },
  ];

  const handleShare = () => {
    if (onShareLocation) {
      onShareLocation(coords.lat, coords.lng, duration);
    }
    setLocationShared(true);
    setTimeout(() => {
      setLocationShared(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-lg bg-zinc-950 border border-blue-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-zinc-100"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-950/70 via-zinc-900 to-zinc-950 border-b border-blue-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
              <Navigation className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white">الموقع المباشر (Live Location)</h2>
                <span className="px-2 py-0.5 text-[10px] bg-blue-500/20 text-blue-300 rounded-md font-bold">
                  GPS مباشر 📍
                </span>
              </div>
              <p className="text-xs text-zinc-400">مشاركة تحركاتك اللحظية مع {chat.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Preview Simulator */}
        <div className="relative h-48 bg-zinc-900 overflow-hidden flex items-center justify-center border-b border-zinc-800">
          {/* Stylized Dark GPS Grid */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* User Location Radar Pulse */}
          <div className="relative flex items-center justify-center">
            <div className="absolute w-28 h-28 bg-blue-500/10 rounded-full animate-ping" />
            <div className="absolute w-16 h-16 bg-blue-500/20 rounded-full animate-pulse" />
            <div className="w-10 h-10 bg-blue-600 border-2 border-white rounded-full flex items-center justify-center shadow-lg text-white font-bold text-xs z-10">
              📍
            </div>
          </div>

          <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between bg-zinc-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-[11px] border border-zinc-800 text-zinc-300">
            <span>خط العرض: {coords.lat.toFixed(4)}, خط الطول: {coords.lng.toFixed(4)}</span>
            <span className="text-emerald-400 font-bold">إشارة GPS ممتازة 📡</span>
          </div>
        </div>

        {/* Settings */}
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-2">مدة مشاركة الموقع الحي:</label>
            <div className="grid grid-cols-3 gap-2">
              {durations.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDuration(d.value)}
                  className={`py-2.5 rounded-xl text-xs font-extrabold border transition-all ${
                    duration === d.value
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/25'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Proximity Alert Toggle */}
          <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-xs font-bold text-zinc-200">تنبيه الاقتراب (Proximity Alert)</div>
                <div className="text-[10px] text-zinc-400">إشعار فوري عند اقتراب الطرف الآخر لمسافة أقل من 500 متر</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={proximityAlert}
              onChange={(e) => setProximityAlert(e.target.checked)}
              className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
            />
          </div>

          {locationShared && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>تم بدء مشاركة الموقع المباشر بنجاح!</span>
            </div>
          )}

          <button
            onClick={handleShare}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            <span>مشاركة الموقع المباشر لمدة {durations.find((d) => d.value === duration)?.label}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
