import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import MessagesSidebarHeader from '@/components/messages/MessagesSidebarHeader';
import MessagesFrame from '@/components/messages/MessagesFrame';
import '@/components/messages/messages.css';
import { createPageUrl } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { entities } from '@/api/entities';
import { Button } from '@/components/ui/button';

import {
  MessageSquare, Send, ArrowLeft, Car, Loader2,
  Tag, Check, X, Flag, Languages, CheckCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import messageDate from '@/lib/messageDate';
import { resolveViewAsUser } from '@/lib/adminViewAs';

const LANG_LABELS = { ru: 'Russian', en: 'English', et: 'Estonian', lv: 'Latvian', lt: 'Lithuanian' };
const LOCALE_MAP = { ru: 'ru-RU', en: 'en-US', et: 'et-EE', lv: 'lv-LV', lt: 'lt-LT' };

function formatTime(date, locale = 'ru-RU') {
  return messageDate(date).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
}

function formatDate(date, locale = 'ru-RU') {
  const d = messageDate(date);
  const now = new Date();
  const prev = new Date(now);
  prev.setDate(now.getDate() - 1);
  if (d.toDateString() === now.toDateString()) return 'today';
  if (d.toDateString() === prev.toDateString()) return 'yesterday';
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'long' });
}

function groupMessagesByDate(messages, locale = 'ru-RU') {
  const groups = [];
  let lastDate = null;
  for (const msg of messages) {
    const dateStr = formatDate(msg.created_date, locale);
    if (dateStr !== lastDate) {
      groups.push({ type: 'date', label: dateStr, key: `date-${msg.created_date}` });
      lastDate = dateStr;
    }
    groups.push({ type: 'msg', msg });
  }
  return groups;
}

export default function Messages() {
  const { t, i18n } = useTranslation();

  const locale = LOCALE_MAP[i18n.language?.slice(0, 2)] || 'ru-RU';
  const [user, setUser] = useState(null);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const formatDateLabel = (date) => {
    const key = formatDate(date, locale);
    if (key === 'today') return t('messages.today');
    if (key === 'yesterday') return t('messages.yesterday');
    return key;
  };
  const [autoTranslate, setAutoTranslate] = useState(false);
  const [translateLang, setTranslateLang] = useState(localStorage.getItem('i18nextLng')?.split('-')[0] || 'ru');
  const [translations, setTranslations] = useState({});
  const [translating, setTranslating] = useState({});

  useEffect(() => {
    const loadUser = async () => {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) { base44.auth.redirectToLogin(); return; }
      const userData = await base44.auth.me();
      // In admin "view as" mode the chats belong to the previewed account.
      const resolved = await resolveViewAsUser(userData).catch(() => ({ user: userData }));
      setUser(resolved.user);
      setIsLoading(false);
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [sent, received] = await Promise.all([
        entities.Message.filter({ sender_email: user.email }, '-created_date'),
        entities.Message.filter({ receiver_email: user.email }, '-created_date')
      ]);
      const all = [...sent, ...received];
      const unique = [...new Map(all.map(m => [m.id, m])).values()];
      setMessages(unique.sort((a, b) => messageDate(a.created_date) - messageDate(b.created_date)));
    };
    load();
  }, [user]);

  // Real-time subscription
  useEffect(() => {
    if (!user) return;
    const unsub = entities.Message.subscribe((event) => {
      const msg = event.data;
      if (event.type === 'create') {
        if (msg.sender_email === user.email || msg.receiver_email === user.email) {
          setMessages(prev => {
            if (prev.find(m => m.id === msg.id)) return prev;
            return [...prev, msg].sort((a, b) => messageDate(a.created_date) - messageDate(b.created_date));
          });
        }
      } else if (event.type === 'update') {
        setMessages(prev => prev.map(m => m.id === event.id ? event.data : m));
      } else if (event.type === 'delete') {
        setMessages(prev => prev.filter(m => m.id !== event.id));
      }
    });
    return () => unsub();
  }, [user]);

  const chats = useMemo(() => {
    const chatMap = {};
    messages.forEach(msg => {
      if (!chatMap[msg.chat_id]) {
        chatMap[msg.chat_id] = {
          id: msg.chat_id,
          messages: [],
          otherUser: msg.sender_email === user?.email ? msg.receiver_email : msg.sender_email,
          carId: msg.car_id,
          lastMessage: msg
        };
      }
      chatMap[msg.chat_id].messages.push(msg);
      if (messageDate(msg.created_date) >= messageDate(chatMap[msg.chat_id].lastMessage.created_date)) {
        chatMap[msg.chat_id].lastMessage = msg;
      }
    });
    Object.values(chatMap).forEach(c => c.messages.sort((a, b) => messageDate(a.created_date) - messageDate(b.created_date)));
    return Object.values(chatMap).sort((a, b) => messageDate(b.lastMessage.created_date) - messageDate(a.lastMessage.created_date));
  }, [messages, user]);

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats;
    return chats.filter(c => c.otherUser.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [chats, searchQuery]);

  const selectedChat = chats.find(c => c.id === selectedChatId) || null;
  const prevChatIdRef = useRef(null);
  const prevMsgCountRef = useRef(0);

  // Auto-scroll on new messages
  useEffect(() => {
    const msgs = selectedChat?.messages || [];
    const count = msgs.length;
    const chatChanged = prevChatIdRef.current !== selectedChatId;
    if (chatChanged) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'auto' }), 50);
    } else if (count > prevMsgCountRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevChatIdRef.current = selectedChatId;
    prevMsgCountRef.current = count;
  }, [selectedChat?.messages?.length, selectedChatId]);

  const { data: cars = {} } = useQuery({
    queryKey: ['chatCars', chats.map(c => c.carId).join(',')],
    queryFn: async () => {
      const carIds = [...new Set(chats.map(c => c.carId).filter(Boolean))];
      if (!carIds.length) return {};
      const allCars = await entities.Car.list('-created_date', 100);
      const map = {};
      allCars.forEach(car => { if (carIds.includes(car.id)) map[car.id] = car; });
      return map;
    },
    enabled: chats.length > 0
  });

  const { data: chatOffers = [], refetch: refetchOffers } = useQuery({
    queryKey: ['chatOffers', selectedChatId],
    queryFn: () => entities.PriceOffer.filter({ car_id: selectedChat.carId }),
    enabled: !!selectedChat?.carId
  });

  const handleSelectChat = async (chat) => {
    setSelectedChatId(chat.id);
    inputRef.current?.focus();
    const unread = chat.messages.filter(m => m.receiver_email === user.email && !m.is_read);
    for (const msg of unread) {
      await entities.Message.update(msg.id, { is_read: true });
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || isSending) return;
    const text = newMessage.trim();
    setNewMessage('');
    setIsSending(true);
    try {
      await entities.Message.create({
        chat_id: selectedChat.id,
        sender_email: user.email,
        receiver_email: selectedChat.otherUser,
        car_id: selectedChat.carId,
        content: text
      });
    } finally {
      setIsSending(false);
    }
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  };

  const translateMsg = async (msgId, text) => {
    if (translations[msgId]) {
      setTranslations(prev => { const n = { ...prev }; delete n[msgId]; return n; });
      return;
    }
    setTranslating(prev => ({ ...prev, [msgId]: true }));
    try {
      const res = await base44.functions.invoke('translateMessage', { text, targetLang: LANG_LABELS[translateLang] || translateLang });
      setTranslations(prev => ({ ...prev, [msgId]: res.data.translated }));
    } catch {
      toast.error(t('messages.translate_error'));
    }
    setTranslating(prev => ({ ...prev, [msgId]: false }));
  };

  useEffect(() => {
    if (!autoTranslate || !user || !selectedChat) return;
    const incoming = selectedChat.messages.filter(m => m.sender_email !== user.email);
    incoming.forEach(m => {
      if (!translations[m.id] && !translating[m.id] && m.content && !m.content.startsWith('__')) {
        translateMsg(m.id, m.content);
      }
    });
  }, [autoTranslate, selectedChat?.messages?.length]);

  const handleOfferAction = async (msg, action) => {
    const amount = parseInt(msg.content.replace('__OFFER__:', ''));
    const offer = chatOffers.find(o => o.buyer_email === msg.sender_email && o.status === 'pending');
    if (offer) {
      await entities.PriceOffer.update(offer.id, { status: action === 'accept' ? 'accepted' : 'rejected' });
    }
    await entities.Message.create({
      chat_id: selectedChat.id,
      sender_email: user.email,
      receiver_email: selectedChat.otherUser,
      car_id: selectedChat.carId,
      content: action === 'accept' ? `__OFFER_ACCEPTED__:${amount}` : `__OFFER_REJECTED__:${amount}`
    });
    refetchOffers();
    toast.success(action === 'accept' ? t('messages.offer_accepted') : t('messages.offer_rejected'));
  };

  const isOfferResponded = (msg) => {
    const amount = parseInt(msg.content.replace('__OFFER__:', ''));
    return selectedChat.messages.some(m =>
      (m.content === `__OFFER_ACCEPTED__:${amount}` || m.content === `__OFFER_REJECTED__:${amount}`) &&
      messageDate(m.created_date) > messageDate(msg.created_date)
    );
  };

  const formatEur = (amount) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);

  const lastMsgPreview = (msg) => {
    if (msg?.content?.startsWith('__OFFER__:')) return t('messages.price_offer');
    if (msg?.content?.startsWith('__OFFER_ACCEPTED__:')) return t('messages.accepted');
    if (msg?.content?.startsWith('__OFFER_REJECTED__:')) return t('messages.rejected');
    return msg?.content || '';
  };

  const renderMessage = (msg) => {
    const isOwn = msg.sender_email === user.email;

    if (msg.content?.startsWith('__OFFER__:')) {
      const amount = parseInt(msg.content.replace('__OFFER__:', ''));
      const responded = isOfferResponded(msg);
      const canRespond = !isOwn && !responded;
      return (
        <div key={msg.id} className={cn("flex mb-1", isOwn ? "justify-end" : "justify-start")}>
          <div className={cn("max-w-[90%] sm:max-w-[80%] rounded-xl border border-border overflow-hidden", isOwn ? "rounded-br-sm" : "rounded-bl-sm")}>
            <div className={cn("flex items-center gap-2 px-4 py-2.5 text-xs font-semibold", isOwn ? "bg-primary/15 text-primary" : "bg-muted text-foreground")}>
            <Tag className="w-3.5 h-3.5" />
            {isOwn ? t('messages.you_offered') : t('messages.price_offer')}
            </div>
            <div className="bg-card px-4 py-3">
              <p className="text-2xl font-bold text-foreground">{formatEur(amount)}</p>
              <p className="text-xs text-muted-foreground mt-1">{formatTime(msg.created_date, locale)}</p>
              {canRespond && (
                <div className="flex gap-2 mt-3">
                  <Button size="sm" onClick={() => handleOfferAction(msg, 'accept')} className="flex-1 bg-primary/15 border border-primary/30 hover:bg-primary/20 text-primary h-8 text-xs gap-1">
                    <Check className="w-3.5 h-3.5" /> {t('messages.accept')}
                  </Button>
                  <Button size="sm" onClick={() => handleOfferAction(msg, 'reject')} variant="outline" className="flex-1 border-border bg-background text-foreground hover:bg-accent h-8 text-xs gap-1">
                    <X className="w-3.5 h-3.5" /> {t('messages.decline')}
                  </Button>
                </div>
              )}
              {responded && <p className="text-xs text-muted-foreground mt-2 italic">{t('messages.offer_processed')}</p>}
            </div>
          </div>
        </div>
      );
    }

    if (msg.content?.startsWith('__OFFER_ACCEPTED__:')) {
      const amount = parseInt(msg.content.replace('__OFFER_ACCEPTED__:', ''));
      return (
        <div key={msg.id} className="flex justify-center my-3">
          <div className="flex items-center gap-2 max-w-full bg-primary/10 border border-primary/20 rounded-xl px-4 py-2 text-sm text-primary">
            <Check className="w-4 h-4 text-primary" />
            {t('messages.offer_accepted_label', { amount: formatEur(amount) })}
          </div>
        </div>
      );
    }

    if (msg.content?.startsWith('__OFFER_REJECTED__:')) {
      const amount = parseInt(msg.content.replace('__OFFER_REJECTED__:', ''));
      return (
        <div key={msg.id} className="flex justify-center my-3">
          <div className="flex items-center gap-2 max-w-full bg-muted border border-border rounded-xl px-4 py-2 text-sm text-muted-foreground">
            <X className="w-4 h-4 text-muted-foreground" />
            {t('messages.offer_rejected_label', { amount: formatEur(amount) })}
          </div>
        </div>
      );
    }

    const handleReport = async () => {
      await entities.Report.create({
        reporter_email: user.email, target_type: 'user', target_id: msg.sender_email,
        reason: 'inappropriate', description: `Report on message: "${msg.content.slice(0, 100)}"`
      });
      toast.success(t('messages.report_sent'));
    };

    const translatedText = translations[msg.id];
    const isTranslating = translating[msg.id];

    return (
      <div key={msg.id} className={cn("flex mb-1 group px-1", isOwn ? "justify-end" : "justify-start")}>
        <div className="min-w-0 flex flex-col max-w-[90%] sm:max-w-[80%]">
          <div className="flex items-end gap-1.5">
            {/* Report button for incoming */}
            {!isOwn && (
              <button onClick={handleReport}
                aria-label={t('messages.report')}
                 className="message-action transition-opacity mb-1 p-1 text-muted-foreground hover:text-foreground flex-shrink-0">
                <Flag className="w-3.5 h-3.5" />
              </button>
            )}

            <div className={cn(
              "min-w-0 relative px-3.5 py-2 rounded-xl border border-border",
              isOwn
                ? "bg-primary/15 text-foreground border-primary/20 rounded-br-sm"
                : "bg-card text-foreground rounded-bl-sm"
            )}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>

              {translatedText && (
                <p className={cn("text-sm mt-1.5 pt-1.5 border-t leading-relaxed italic",
                  isOwn ? "text-muted-foreground border-primary/20" : "text-muted-foreground border-border")}>
                  {translatedText}
                </p>
              )}

              <div className={cn("flex items-center gap-1.5 mt-1", isOwn ? "justify-end" : "justify-between")}>
                {!isOwn && (
                  <button
                    onClick={() => translateMsg(msg.id, msg.content)}
                    disabled={isTranslating}
                    className={cn("flex items-center gap-0.5 text-xs transition-colors",
                      translatedText ? "text-primary" : "text-muted-foreground hover:text-foreground",
                      "message-action"
                    )}>
                    {isTranslating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Languages className="w-3 h-3" />}
                    <span>{translatedText ? t('messages.hide') : t('messages.translate')}</span>
                  </button>
                )}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className={cn("text-xs", isOwn ? "text-muted-foreground" : "text-muted-foreground")}>
                    {formatTime(msg.created_date, locale)}
                    </span>
                    {isOwn && (
                     msg.is_read
                       ? <CheckCheck className="w-3.5 h-3.5 text-primary" />
                      : <Check className="w-3.5 h-3.5 text-primary" />
                  )}
                </div>
              </div>
            </div>

            {/* Report button for own messages */}
            {isOwn && (
              <button onClick={handleReport}
                aria-label={t('messages.report')}
                 className="message-action transition-opacity mb-1 p-1 text-muted-foreground hover:text-foreground flex-shrink-0">
                <Flag className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const groupedMessages = selectedChat ? groupMessagesByDate(selectedChat.messages, locale) : [];

  return (
    <MessagesFrame selectedChatId={selectedChatId}>

        {/* ── LEFT SIDEBAR ── */}
        <div className={cn(
          "w-full md:w-[300px] xl:w-[340px] min-h-0 flex-shrink-0 bg-card flex flex-col md:border-r border-border",
          selectedChat ? "hidden md:flex" : "flex"
        )}>
          <MessagesSidebarHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />

          {/* Chat list */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {filteredChats.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">{t('messages.no_chats')}</p>
              </div>
            ) : (
              filteredChats.map((chat) => {
                const car = cars[chat.carId];
                const unread = chat.messages.filter(m => m.receiver_email === user.email && !m.is_read).length;
                const isActive = selectedChatId === chat.id;
                const preview = lastMsgPreview(chat.lastMessage);
                const isOwnLast = chat.lastMessage.sender_email === user.email;

                return (
                  <button
                    key={chat.id}
                    onClick={() => handleSelectChat(chat)}
                    className={cn(
                      "w-full px-3 py-3 border-b border-border text-left transition-colors",
                      isActive
                        ? "bg-border"
                        : "hover:bg-border/50"
                    )}
                  >
                    <div className="flex gap-3 items-center">
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center text-primary font-semibold text-lg overflow-hidden">
                          {car?.images?.[0]
                            ? <img src={car.images[0]} alt="" className="w-full h-full object-cover" />
                            : <span>{(chat.otherUser[0] || '?').toUpperCase()}</span>
                          }
                        </div>
                        {unread > 0 && (
                          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary rounded-full text-primary-foreground text-xs flex items-center justify-center font-medium">
                            {unread > 9 ? '9+' : unread}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between mb-0.5">
                          <span className={cn("font-semibold text-sm truncate", isActive ? "text-primary" : "text-foreground")}>
                            {chat.otherUser.split('@')[0]}
                          </span>
                          <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                            {formatDate(chat.lastMessage.created_date, locale) === 'today'
                             ? formatTime(chat.lastMessage.created_date, locale)
                             : formatDateLabel(chat.lastMessage.created_date)}
                          </span>
                        </div>
                        {car && (
                          <div className="flex items-center gap-1 text-xs text-primary mb-0.5">
                            <Car className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{car.brand} {car.model} {car.year}</span>
                          </div>
                        )}
                        <p className={cn("text-xs truncate", unread > 0 ? "text-foreground font-medium" : "text-muted-foreground")}>
                          {isOwnLast ? <span className="text-muted-foreground">{t('messages.you')}: </span> : null}{preview}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── CHAT WINDOW ── */}
        <div className={cn(
          "min-w-0 min-h-0 flex-1 flex flex-col bg-background",
          !selectedChat && "hidden md:flex"
        )}>
          {selectedChat ? (
            <>
              {/* Chat header */}
              <div className="shrink-0 flex flex-wrap items-center gap-3 p-3 sm:p-4 bg-card border-b border-border">
                <Button
                  variant="ghost" size="icon"
                  className="md:hidden w-10 h-10 flex-shrink-0"
                  aria-label={t('messages.back')}
                  onClick={() => setSelectedChatId(null)}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-primary font-semibold flex-shrink-0 overflow-hidden">
                  {cars[selectedChat.carId]?.images?.[0]
                    ? <img src={cars[selectedChat.carId].images[0]} alt="" className="w-full h-full object-cover" />
                    : <span>{(selectedChat.otherUser[0] || '?').toUpperCase()}</span>
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-foreground text-sm leading-tight truncate">
                    {selectedChat.otherUser.split('@')[0]}
                  </h2>
                  {cars[selectedChat.carId] && (
                    <Link
                      to={createPageUrl('CarDetails') + `?id=${selectedChat.carId}`}
                      className="text-xs text-muted-foreground hover:text-foreground hover:underline flex items-center gap-1 min-w-0 [&_svg]:shrink-0"
                    >
                      <Car className="w-3 h-3" />
                      {cars[selectedChat.carId].brand} {cars[selectedChat.carId].model} {cars[selectedChat.carId].year}
                    </Link>
                  )}
                </div>

                {/* Translate controls */}
                <div className="flex items-center gap-2 w-full lg:w-auto lg:ml-auto min-w-0">
                  <select
                    value={translateLang}
                    onChange={e => { setTranslateLang(e.target.value); setTranslations({}); }}
                    aria-label={t('messages.language_label')}
                    className="h-9 min-w-0 flex-1 lg:flex-none text-xs border border-border rounded-lg px-2 bg-background text-foreground outline-none focus:ring-2 focus:ring-ring/30"
                  >
                    {Object.entries(LANG_LABELS).map(([code, label]) => (
                      <option key={code} value={code}>{t(`messages.languages.${code}`)}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => { setAutoTranslate(v => !v); setTranslations({}); }}
                    aria-pressed={autoTranslate}
                    className={cn(
                      "h-9 flex items-center justify-center gap-1.5 text-xs px-3 rounded-lg border transition-colors font-medium whitespace-nowrap",
                      autoTranslate
                        ? "bg-primary/15 text-primary border-primary/30"
                        : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                    )}
                  >
                    <Languages className="w-3.5 h-3.5" />
                    {t('messages.auto')}
                  </button>
                </div>
              </div>

              {/* Messages area */}
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-4 px-2 sm:px-4 space-y-0.5">
                {groupedMessages.map((item) => {
                if (item.type === 'date') {
                  const label = item.label === 'today' ? t('messages.today') : item.label === 'yesterday' ? t('messages.yesterday') : item.label;
                  return (
                    <div key={item.key} className="flex justify-center my-4">
                      <span className="bg-card text-muted-foreground text-xs px-3 py-1 rounded-lg border border-border">
                        {label}
                      </span>
                    </div>
                  );
                }
                  return renderMessage(item.msg);
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input bar */}
              <div className="shrink-0 p-3 bg-card border-t border-border">
                <div className="flex items-end gap-2">
                  <div className="flex-1 relative">
                    <textarea
                      ref={inputRef}
                      value={newMessage}
                      onChange={e => {
                        setNewMessage(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder={t('messages.input_placeholder')}
                      rows={1}
                      aria-label={t('messages.input_placeholder')}
                      className="w-full resize-none bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring/30 leading-relaxed"
                      style={{ minHeight: '42px', maxHeight: '120px' }}
                    />
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || isSending}
                    aria-label={t('messages.send')}
                    className="h-11 w-11 rounded-lg bg-primary hover:bg-primary/90 flex-shrink-0 p-0 text-primary-foreground"
                  >
                    {isSending
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Send className="w-4 h-4" />
                    }
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 ml-1">{t('messages.enter_hint')}</p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-6 bg-background">
              <div>
                <div className="w-14 h-14 bg-card border border-border rounded-xl flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{t('messages.select_chat')}</h3>
                <p className="text-muted-foreground text-sm">{t('messages.select_chat_desc')}</p>
              </div>
            </div>
          )}
        </div>
    </MessagesFrame>
  );
}