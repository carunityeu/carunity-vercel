import React from 'react';
import { SendHorizontal, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function CaroComposer({ text, setText, send, busy, loading, error, retry, authenticated }) {
  const { t } = useTranslation();
  return <div className="caro-bottom">
    {error && <div className="caro-error" role="alert"><span>{t('caro.error')}</span><button disabled={busy} onClick={retry}>{t('caro.retry')}</button></div>}
    <form className="caro-composer" onSubmit={event => { event.preventDefault(); send(); }}>
      <textarea aria-label={t('caro.placeholder')} placeholder={t('caro.placeholder')} maxLength={2500} value={text} onChange={event => setText(event.target.value)} onKeyDown={event => {
        if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); if (!busy && !loading && text.trim()) send(); }
      }} />
      <button type="submit" disabled={busy || loading || !text.trim()} aria-label={t('caro.send')}>
        {busy || loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <SendHorizontal className="w-5 h-5" />}
      </button>
    </form>
    {!loading && !authenticated && <p className="caro-disclaimer mt-2">{t('caro.login')}</p>}
    <div className="caro-links"><Link to="/Terms">{t('caro.terms')}</Link><Link to="/PrivacyPolicy">{t('caro.privacy')}</Link></div>
  </div>;
}