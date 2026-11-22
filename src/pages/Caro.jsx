import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, SquarePen, Loader2 } from 'lucide-react';
import CaroBrand from '@/components/caro/CaroBrand';
import CaroMessage from '@/components/caro/CaroMessage';
import CaroComposer from '@/components/caro/CaroComposer';
import useCaroConversation from '@/components/caro/useCaroConversation';
import '@/components/caro/caro.css';

export default function Caro() {
  const { t, i18n } = useTranslation();
  const chat = useCaroConversation(i18n.resolvedLanguage || i18n.language);
  const scroll = useRef(null), follow = useRef(true);
  useEffect(() => { if (follow.current && scroll.current) scroll.current.scrollTop = scroll.current.scrollHeight; }, [chat.messages, chat.busy]);
  return <section className="caro-page" aria-label="Caro AI">
    <header className="caro-top">
      <Link to="/" className="caro-new" aria-label={t('caro.back')}><ArrowLeft className="w-4 h-4" /><span className="hidden sm:inline">CarUnity</span></Link>
      <p className="caro-disclaimer">{t('caro.disclaimer')}</p>
      <button className="caro-new" disabled={chat.busy || chat.loading} onClick={() => { chat.reset(); follow.current = true; }}><SquarePen className="w-4 h-4" />{t('caro.newChat')}</button>
    </header>
    <div className="caro-scroll" ref={scroll} onScroll={event => { const el = event.currentTarget; follow.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120; }}>
      <div className="caro-thread">
        {!chat.messages.length && <div className="caro-welcome"><h1>{t('caro.hello')}</h1><CaroBrand /><p>{t('caro.intro')}</p></div>}
        <div aria-live="polite" aria-busy={chat.busy}>{chat.messages.map((message, index) => <CaroMessage key={message.id || index} message={message} />)}</div>
        {chat.busy && <p role="status" className="caro-status"><Loader2 className="w-4 h-4 animate-spin" />{t('caro.thinking')}</p>}
      </div>
    </div>
    <CaroComposer {...chat} send={() => { follow.current = true; chat.send(); }} retry={() => chat.send(chat.text || t('caro.retry'))} />
  </section>;
}