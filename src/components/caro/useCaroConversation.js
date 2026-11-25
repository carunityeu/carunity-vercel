import { useEffect, useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { auth } from '@/api/auth';
import useCaroStream from '@/components/caro/useCaroStream';

export default function useCaroConversation(language) {
  const [conversation, setConversation] = useState(null), [messages, setMessages] = useState([]);
  const [text, setText] = useState(() => sessionStorage.getItem('caro-draft') || '');
  const [busy, setBusy] = useState(false), [loading, setLoading] = useState(true), [error, setError] = useState(false);
  const [user, setUser] = useState(null); const lock = useRef(false);
  useCaroStream(conversation, setMessages, setBusy, setError);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!await auth.isAuthenticated()) return;
        const me = await auth.me(); if (!alive) return; setUser(me);
        const id = sessionStorage.getItem(`caro-chat-${me.id}`);
        if (id) { const saved = await base44.agents.getConversation(id); if (alive) { setConversation(saved); setMessages(saved.messages || []); } }
      } catch (e) { if (alive) { if (e.status !== 401) setError(true); } }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, []);
  useEffect(() => {
    if (!busy) return;
    const timer = setTimeout(() => { setBusy(false); setError(true); }, 90000);
    return () => clearTimeout(timer);
  }, [busy]);
  const send = async (value = text) => {
    const content = value.trim(); if (!content || busy || lock.current || loading) return;
    if (!user) { sessionStorage.setItem('caro-draft', content); auth.redirectToLogin(window.location.href); return; }
    lock.current = true; setBusy(true); setError(false);
    try {
      let current = conversation;
      if (!current) { current = await base44.agents.createConversation({ agent_name: 'caro', metadata: { name: 'Caro AI', language } }); setConversation(current); sessionStorage.setItem(`caro-chat-${user.id}`, current.id); }
      setText('');
      await base44.agents.addMessage(current, { role: 'user', content });
      sessionStorage.removeItem('caro-draft');
      const fresh = await base44.agents.getConversation(current.id); setMessages(fresh.messages || []);
      const last = fresh.messages?.at(-1); if (last?.role === 'assistant' && last.content && last.additional_message_params?.llm_finish_reason === 'stop') setBusy(false);
    } catch { setText(content); setError(true); setBusy(false); }
    finally { lock.current = false; }
  };
  const reset = () => { if (busy) return; setConversation(null); setMessages([]); setText(''); setError(false); sessionStorage.removeItem('caro-draft'); if (user) sessionStorage.removeItem(`caro-chat-${user.id}`); };
  return { messages, text, setText, busy, loading, error, send, reset, authenticated: !!user };
}