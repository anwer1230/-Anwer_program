import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  TelegramAccount,
  ChatItem,
  MessageItem,
  TelegramSettings,
  UserProfile,
} from '../types';
import {
  saveAccountCachedChats,
  getAccountCachedChats,
  saveAccountCachedMessages,
  getAccountCachedMessages,
  getAllAccountCachedMessages,
  saveAccountCachedUserProfile,
  getAccountCachedUserProfile,
  saveAccountCachedSettings,
  getAccountCachedSettings,
  clearAccountStorageCache,
  saveCachedChats,
  saveCachedMessages,
  saveCachedUserProfile,
} from '../lib/storageCache';

export interface AccountSessionData {
  chats: ChatItem[];
  messages: Record<string, MessageItem[]>;
  settings: TelegramSettings | null;
  drafts: Record<string, string>;
  pinnedMessages: Record<string, any>;
  currentChatId: string | number | null;
  unreadCount: number;
}

export interface TelegramContextValue {
  accounts: TelegramAccount[];
  activeAccount: TelegramAccount | null;
  activeAccountId: string;
  chats: ChatItem[];
  messages: Record<string, MessageItem[]>;
  currentChatId: string | number | null;
  settings: TelegramSettings | null;
  drafts: Record<string, string>;
  pinnedMessages: Record<string, any>;
  isSyncing: boolean;
  isOnline: boolean;
  switchAccount: (accountId: string) => Promise<void>;
  addAccount: (newAcc: TelegramAccount) => Promise<void>;
  removeAccount: (accountId: string) => Promise<void>;
  updateAccountProfile: (accountId: string, updates: Partial<TelegramAccount> | Partial<UserProfile>) => void;
  updateAccountSettings: (accountId: string, updates: Partial<TelegramSettings>) => Promise<void>;
  saveDraft: (chatId: string | number, text: string) => void;
  setChatMessages: (chatId: string | number, msgsOrUpdater: MessageItem[] | ((prev: MessageItem[]) => MessageItem[])) => void;
  updateChatsList: (updater: (prev: ChatItem[]) => ChatItem[]) => void;
  selectChat: (chatId: string | number | null) => void;
  getAccountUnreadCount: (accountId: string) => number;
  triggerSync: () => Promise<void>;
}

const TelegramContext = createContext<TelegramContextValue | undefined>(undefined);

const DEFAULT_SETTINGS: TelegramSettings = {
  message: 'السلام عليكم ورحمة الله، مرحباً بكم في مركز سرعة إنجاز للخدمات الأكاديمية والبحثية 🎓📚',
  groups: [],
  watch_words: ['بحث', 'مشروع', 'أطروحة', 'ترجمة', 'تحليل', 'نشر', 'تدقيق', 'ماجستير', 'دكتوراه'],
  interval_seconds: 60,
  send_type: 'manual',
  schedule_duration_hours: 6,
  sanitize_mode: 'smart',
  smart_required_messages: 5,
  auto_reply_enabled: true,
  learning_active_private: true,
  learning_active_group: true,
};

const INITIAL_ACCOUNTS: TelegramAccount[] = [
  {
    id: 'acc_1001',
    phone: '+964 770 123 4567',
    session_name: 'الحساب الرئيسي - أنور السعدي',
    username: 'anwer1230',
    first_name: 'أنور السعدي',
    status: 'connected',
    has_2fa: true,
    is_active: true,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    last_sync: new Date().toISOString(),
  },
  {
    id: 'acc_1002',
    phone: '+964 750 987 6543',
    session_name: 'حساب إدارة التسويق والنشر',
    username: 'enjaz_marketing',
    first_name: 'إدارة التسويق',
    status: 'connected',
    has_2fa: false,
    is_active: false,
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    last_sync: new Date().toISOString(),
  },
  {
    id: 'acc_1003',
    phone: '+966 50 112 2334',
    session_name: 'خدمة العملاء والاستفسارات',
    username: 'enjaz_support',
    first_name: 'الدعم الأكاديمي',
    status: 'connected',
    has_2fa: true,
    is_active: false,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    last_sync: new Date().toISOString(),
  },
];

export const TelegramProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ── 1. ACCOUNTS STATE ──────────────────────────────────────────────────
  const [accounts, setAccounts] = useState<TelegramAccount[]>(() => {
    try {
      const saved = localStorage.getItem('tg_multi_accounts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_ACCOUNTS;
  });

  const [activeAccountId, setActiveAccountId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('tg_active_account_id');
      if (saved) return saved;
    } catch (e) {}
    const initialActive = accounts.find((a) => a.is_active);
    return initialActive ? initialActive.id : accounts[0]?.id || 'acc_1001';
  });

  // ── 2. ACTIVE ACCOUNT WORKSPACE STATE ──────────────────────────────────
  const [chats, setChats] = useState<ChatItem[]>(() => {
    return getAccountCachedChats(activeAccountId) || [];
  });

  const [messages, setMessages] = useState<Record<string, MessageItem[]>>(() => {
    return getAllAccountCachedMessages(activeAccountId) || {};
  });

  const [settings, setSettings] = useState<TelegramSettings | null>(() => {
    return getAccountCachedSettings(activeAccountId) || DEFAULT_SETTINGS;
  });

  const [drafts, setDrafts] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(`tg_drafts_${activeAccountId}`);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const [pinnedMessages, setPinnedMessages] = useState<Record<string, any>>({});
  const [currentChatId, setCurrentChatId] = useState<string | number | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  const activeAccount = accounts.find((a) => a.id === activeAccountId) || accounts[0] || null;

  // Refs for stable access inside SSE & event callbacks
  const activeAccountIdRef = useRef(activeAccountId);
  activeAccountIdRef.current = activeAccountId;

  const accountsRef = useRef(accounts);
  accountsRef.current = accounts;

  const currentChatIdRef = useRef(currentChatId);
  currentChatIdRef.current = currentChatId;

  // ── PERSIST ACCOUNTS LIST ──────────────────────────────────────────────
  useEffect(() => {
    try {
      localStorage.setItem('tg_multi_accounts', JSON.stringify(accounts));
      localStorage.setItem('tg_active_account_id', activeAccountId);
    } catch (e) {}
  }, [accounts, activeAccountId]);

  // ── PERSIST ACTIVE ACCOUNT CHATS & MESSAGES ────────────────────────────
  useEffect(() => {
    if (activeAccountId && chats.length > 0) {
      saveAccountCachedChats(activeAccountId, chats);
      saveCachedChats(chats); // Global fallback
    }
  }, [activeAccountId, chats]);

  useEffect(() => {
    if (activeAccountId && Object.keys(messages).length > 0) {
      Object.keys(messages).forEach((cid) => {
        saveAccountCachedMessages(activeAccountId, cid, messages[cid]);
        saveCachedMessages(cid, messages[cid]);
      });
    }
  }, [activeAccountId, messages]);

  useEffect(() => {
    if (activeAccountId && settings) {
      saveAccountCachedSettings(activeAccountId, settings);
    }
  }, [activeAccountId, settings]);

  useEffect(() => {
    if (activeAccountId && Object.keys(drafts).length > 0) {
      try {
        localStorage.setItem(`tg_drafts_${activeAccountId}`, JSON.stringify(drafts));
      } catch (e) {}
    }
  }, [activeAccountId, drafts]);

  // ── UNREAD TOTAL CALCULATOR PER ACCOUNT ────────────────────────────────
  const getAccountUnreadCount = useCallback((accId: string): number => {
    if (accId === activeAccountIdRef.current) {
      return chats.reduce((sum, c) => sum + (c.unread || 0), 0);
    }
    const cached = getAccountCachedChats(accId);
    return cached.reduce((sum: number, c: any) => sum + (c.unread || 0), 0);
  }, [chats]);

  // ── SWITCH ACCOUNT (STRICT ISOLATION & ZERO POLLUTION) ─────────────────
  const switchAccount = useCallback(async (targetAccountId: string) => {
    if (!targetAccountId || targetAccountId === activeAccountIdRef.current) return;

    const currentId = activeAccountIdRef.current;

    // 1. Flush & Save current active account's state before switching
    if (currentId) {
      saveAccountCachedChats(currentId, chats);
      Object.keys(messages).forEach((cid) => {
        saveAccountCachedMessages(currentId, cid, messages[cid]);
      });
      if (settings) saveAccountCachedSettings(currentId, settings);
      try {
        localStorage.setItem(`tg_drafts_${currentId}`, JSON.stringify(drafts));
      } catch (e) {}
    }

    setIsSyncing(true);

    // 2. Load target account's isolated cache from local storage
    const loadedChats = getAccountCachedChats(targetAccountId);
    const loadedMessages = getAllAccountCachedMessages(targetAccountId);
    const loadedSettings = getAccountCachedSettings(targetAccountId) || DEFAULT_SETTINGS;
    let loadedDrafts: Record<string, string> = {};
    try {
      const d = localStorage.getItem(`tg_drafts_${targetAccountId}`);
      if (d) loadedDrafts = JSON.parse(d);
    } catch (e) {}

    // 3. Reset active workspace state with target account's data
    setChats(loadedChats);
    setMessages(loadedMessages);
    setSettings(loadedSettings);
    setDrafts(loadedDrafts);
    setCurrentChatId(null); // Clear selected chat to prevent viewing messages from previous account

    // 4. Update accounts active flag
    setAccounts((prev) =>
      prev.map((acc) => ({
        ...acc,
        is_active: acc.id === targetAccountId,
      }))
    );
    setActiveAccountId(targetAccountId);

    // 5. Notify server to switch active backend session context
    try {
      await fetch(`/api/accounts/${encodeURIComponent(targetAccountId)}/activate`, {
        method: 'POST',
      });
    } catch (e) {
      console.warn('[TelegramContext] Server activate notification completed with local switch fallback');
    }

    setIsSyncing(false);
  }, [chats, messages, settings, drafts]);

  // ── ADD NEW ACCOUNT ────────────────────────────────────────────────────
  const addAccount = useCallback(async (newAcc: TelegramAccount) => {
    setAccounts((prev) => {
      const updated = prev.map((a) => ({ ...a, is_active: false }));
      const exists = updated.some((a) => a.id === newAcc.id);
      if (exists) {
        return updated.map((a) => (a.id === newAcc.id ? { ...newAcc, is_active: true } : a));
      }
      return [...updated, { ...newAcc, is_active: true }];
    });

    // Switch to the newly created account immediately
    await switchAccount(newAcc.id);
  }, [switchAccount]);

  // ── REMOVE / LOGOUT ACCOUNT ────────────────────────────────────────────
  const removeAccount = useCallback(async (accountId: string) => {
    clearAccountStorageCache(accountId);

    setAccounts((prev) => {
      const filtered = prev.filter((a) => a.id !== accountId);
      if (filtered.length === 0) {
        return INITIAL_ACCOUNTS;
      }
      return filtered;
    });

    if (activeAccountIdRef.current === accountId) {
      const remaining = accountsRef.current.filter((a) => a.id !== accountId);
      const nextAcc = remaining[0] || INITIAL_ACCOUNTS[0];
      await switchAccount(nextAcc.id);
    }

    try {
      await fetch(`/api/accounts/${encodeURIComponent(accountId)}`, { method: 'DELETE' });
    } catch (e) {}
  }, [switchAccount]);

  // ── UPDATE ACCOUNT PROFILE ─────────────────────────────────────────────
  const updateAccountProfile = useCallback((accountId: string, updates: Partial<TelegramAccount> | Partial<UserProfile>) => {
    setAccounts((prev) =>
      prev.map((a) => (a.id === accountId ? { ...a, ...updates, id: a.id } as TelegramAccount : a))
    );
    if (accountId === activeAccountIdRef.current) {
      saveAccountCachedUserProfile(accountId, updates);
      saveCachedUserProfile(updates);
    }
  }, []);

  // ── UPDATE ACCOUNT SETTINGS ────────────────────────────────────────────
  const updateAccountSettings = useCallback(async (accountId: string, updates: Partial<TelegramSettings>) => {
    if (accountId === activeAccountIdRef.current) {
      setSettings((prev) => {
        const next = { ...(prev || DEFAULT_SETTINGS), ...updates };
        saveAccountCachedSettings(accountId, next);
        return next;
      });
    } else {
      const current = getAccountCachedSettings(accountId) || DEFAULT_SETTINGS;
      saveAccountCachedSettings(accountId, { ...current, ...updates });
    }

    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_id: accountId, ...updates }),
      });
    } catch (e) {}
  }, []);

  // ── SAVE DRAFT ─────────────────────────────────────────────────────────
  const saveDraft = useCallback((chatId: string | number, text: string) => {
    if (!chatId) return;
    const cidStr = String(chatId);
    setDrafts((prev) => {
      const next = { ...prev };
      if (!text.trim()) {
        delete next[cidStr];
      } else {
        next[cidStr] = text;
      }
      return next;
    });
  }, []);

  // ── SET CHAT MESSAGES ──────────────────────────────────────────────────
  const setChatMessages = useCallback((
    chatId: string | number,
    msgsOrUpdater: MessageItem[] | ((prev: MessageItem[]) => MessageItem[])
  ) => {
    const cidStr = String(chatId).replace('-100', '').replace('-', '');
    setMessages((prev) => {
      const oldList = prev[cidStr] || [];
      const newList = typeof msgsOrUpdater === 'function' ? msgsOrUpdater(oldList) : msgsOrUpdater;
      if (activeAccountIdRef.current) {
        saveAccountCachedMessages(activeAccountIdRef.current, cidStr, newList);
      }
      return {
        ...prev,
        [cidStr]: newList,
      };
    });
  }, []);

  // ── UPDATE CHATS LIST ──────────────────────────────────────────────────
  const updateChatsList = useCallback((updater: (prev: ChatItem[]) => ChatItem[]) => {
    setChats((prev) => {
      const updated = updater(prev);
      if (activeAccountIdRef.current) {
        saveAccountCachedChats(activeAccountIdRef.current, updated);
      }
      return updated;
    });
  }, []);

  // ── SELECT CHAT ────────────────────────────────────────────────────────
  const selectChat = useCallback((chatId: string | number | null) => {
    setCurrentChatId(chatId);
  }, []);

  // ── TRIGGER MANUAL SYNC ────────────────────────────────────────────────
  const triggerSync = useCallback(async () => {
    setIsSyncing(true);
    try {
      const res = await fetch(`/api/chats?account_id=${encodeURIComponent(activeAccountIdRef.current)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.chats)) {
        setChats(data.chats);
        saveAccountCachedChats(activeAccountIdRef.current, data.chats);
      }
    } catch (e) {
      console.warn('[TelegramContext] Sync fallback to cache');
    }
    setIsSyncing(false);
  }, []);

  // ── SSE REAL-TIME DISPATCHER WITH ISOLATION FILTER ─────────────────────
  useEffect(() => {
    const es = new EventSource('/api/events');

    es.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const { type, data } = payload;
        const eventAccountId = payload.account_id || data?.account_id || activeAccountIdRef.current;

        const isForActiveAccount = eventAccountId === activeAccountIdRef.current;

        if (type === 'new_message' || type === 'new_incoming_message') {
          const msg = data.message || data;
          const rawCid = String(msg.chat_id || data.chat_id);
          const cid = rawCid.replace('-100', '').replace('-', '');
          const isOut = !!msg.is_outgoing || !!msg.out || !!msg.from_me;

          if (isForActiveAccount) {
            // Update active UI React state
            setMessages((prev) => {
              const list = prev[cid] || [];
              if (list.some((m) => String(m.id) === String(msg.id))) return prev;
              const updatedList: MessageItem[] = [
                ...list,
                {
                  id: msg.id || `m_${Date.now()}`,
                  chat_id: cid,
                  sender_id: msg.sender_id,
                  sender_name: msg.sender_name,
                  out: isOut,
                  from_me: isOut,
                  text: msg.content?.text || msg.text,
                  media: msg.content?.filePath || msg.media,
                  type: msg.content?.type || msg.type || (msg.is_system ? 'system' : msg.media ? 'photo' : 'text'),
                  is_system: !!msg.is_system,
                  system_type: msg.system_type,
                  duration: msg.content?.duration || msg.duration,
                  date: typeof msg.date === 'string' ? Math.floor(new Date(msg.date).getTime() / 1000) : (msg.date || Math.floor(Date.now() / 1000)),
                  status: msg.status || (isOut ? 'sent' : undefined),
                  reactions: msg.reactions || [],
                },
              ];
              saveAccountCachedMessages(activeAccountIdRef.current, cid, updatedList);
              return { ...prev, [cid]: updatedList };
            });

            // Update chat list for active account
            setChats((prev) => {
              const isCurrentChat = String(currentChatIdRef.current) === cid;
              const updated = prev.map((c) => {
                if (String(c.id) === cid || String(c.id) === rawCid) {
                  return {
                    ...c,
                    lastMsg: msg.content?.text || msg.text || '[رسالة جديدة]',
                    lastMsgDate: Math.floor(Date.now() / 1000),
                    unread: isCurrentChat ? 0 : (c.unread || 0) + (isOut ? 0 : 1),
                  };
                }
                return c;
              });

              // Reorder: pinned first, then newest message
              const sorted = [...updated].sort((a, b) => {
                if (a.pinned && !b.pinned) return -1;
                if (!a.pinned && b.pinned) return 1;
                return (b.lastMsgDate || 0) - (a.lastMsgDate || 0);
              });
              saveAccountCachedChats(activeAccountIdRef.current, sorted);
              return sorted;
            });
          } else {
            // Background account event: strictly isolate to its own cache without touching active UI!
            const bgCachedMsgs = getAccountCachedMessages(eventAccountId, cid);
            const updatedBgMsgs = [
              ...bgCachedMsgs,
              {
                id: msg.id || `m_${Date.now()}`,
                chat_id: cid,
                sender_id: msg.sender_id,
                sender_name: msg.sender_name,
                out: isOut,
                from_me: isOut,
                text: msg.content?.text || msg.text,
                date: Math.floor(Date.now() / 1000),
              },
            ];
            saveAccountCachedMessages(eventAccountId, cid, updatedBgMsgs);

            const bgChats = getAccountCachedChats(eventAccountId);
            const updatedBgChats = bgChats.map((c: any) => {
              if (String(c.id) === cid || String(c.id) === rawCid) {
                return {
                  ...c,
                  lastMsg: msg.content?.text || msg.text || '[رسالة جديدة]',
                  lastMsgDate: Math.floor(Date.now() / 1000),
                  unread: (c.unread || 0) + 1,
                };
              }
              return c;
            });
            saveAccountCachedChats(eventAccountId, updatedBgChats);
          }
        }
      } catch (e) {}
    };

    return () => {
      es.close();
    };
  }, []);

  const value: TelegramContextValue = {
    accounts,
    activeAccount,
    activeAccountId,
    chats,
    messages,
    currentChatId,
    settings,
    drafts,
    pinnedMessages,
    isSyncing,
    isOnline,
    switchAccount,
    addAccount,
    removeAccount,
    updateAccountProfile,
    updateAccountSettings,
    saveDraft,
    setChatMessages,
    updateChatsList,
    selectChat,
    getAccountUnreadCount,
    triggerSync,
  };

  return <TelegramContext.Provider value={value}>{children}</TelegramContext.Provider>;
};

export const useTelegram = (): TelegramContextValue => {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error('useTelegram must be used within a TelegramProvider');
  }
  return context;
};
