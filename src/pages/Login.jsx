import React, { useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useTranslation } from 'react-i18next';
import AuthLayout from "@/components/AuthLayout";
import AuthPasswordInput from '@/components/auth/AuthPasswordInput';
import GoogleIcon from "@/components/GoogleIcon";
import { safeReturnTo } from "@/lib/authReturnTo";

export default function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const confirmed = new URLSearchParams(window.location.search).get("confirmed") === "1";
  // Post-login destination (e.g. the MCP OAuth consent page sends users here
  // with returnTo so the grant flow can resume). Same-origin paths only.
  const returnTo = safeReturnTo();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await auth.loginViaEmailPassword(email, password);
      window.location.href = returnTo;
    } catch (err) {
      // Supabase answers in English; show our own texts for the two common cases
      const notConfirmed = /not confirmed/i.test(err.message || '');
      setError(notConfirmed ? t('authVisual.notConfirmed', 'Подтвердите email: откройте письмо, которое мы отправили при регистрации.') : t('authVisual.invalid'));
    } finally {
      setLoading(false);
    }
  };

  const handleProvider = async (provider) => {
    setError("");
    setLoading(true);
    try { await auth.loginWithProvider(provider, returnTo); }
    catch (err) { setError(err.message || t('authProvider.error', { provider })); }
    finally { setLoading(false); }
  };

  return (
    <AuthLayout reference>
      {confirmed && (
        <div className="mb-4 rounded-lg bg-brand/15 p-3 text-sm text-brand-text">
          {t('authVisual.emailConfirmed', 'Email подтверждён. Теперь можно войти.')}
        </div>
      )}
      <Button variant="outline" onClick={() => handleProvider('google')} disabled={loading}>
        <GoogleIcon className="w-4 h-4 mr-2" />
        {t('authProvider.continue', { provider: 'Google' })}
      </Button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-3 text-muted-foreground normal-case">{t('authVisual.or')}</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t('authVisual.email')}</Label>
          <div className="relative">

            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{t('authVisual.password')}</Label>
          <AuthPasswordInput id="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Link to="/forgot-password" className="inline-block py-1 text-xs text-foreground underline underline-offset-4 hover:text-primary">{t('authVisual.forgot')}</Link>
        </div>
        <Button type="submit" className="w-full h-10 font-medium" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t('authVisual.logging')}
            </>
          ) : (
            t('authVisual.login')
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}