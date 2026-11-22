import React, { useState } from "react";
import { Link } from "react-router-dom";
import { loginWithMfa } from "@/lib/authMfa";
import { signInWithProvider } from "@/lib/authMfaFlow";
import MfaFlow from "@/components/MfaFlow";
import { MfaScreen } from "@/components/MfaParts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useTranslation } from 'react-i18next';
import AuthLayout from "@/components/AuthLayout";
import AuthPasswordInput from '@/components/auth/AuthPasswordInput';
import GoogleIcon from "@/components/GoogleIcon";
import AppleIcon from "@/components/auth/AppleIcon";
import { safeReturnTo } from "@/lib/authReturnTo";

export default function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mfaChallenge, setMfaChallenge] = useState(null);
  // Post-login destination (e.g. the MCP OAuth consent page sends users here
  // with returnTo so the grant flow can resume). Same-origin paths only.
  const returnTo = safeReturnTo();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await loginWithMfa(email, password);
      if (result.mfa_required) {
        setMfaChallenge(result);
        return;
      }
      window.location.href = returnTo;
    } catch (err) {
      setError(err.message || t('authVisual.invalid'));
    } finally {
      setLoading(false);
    }
  };

  const handleProvider = async (provider) => {
    setError("");
    setLoading(true);
    try { await signInWithProvider(provider, returnTo); }
    catch (err) { setError(err.message || t('authProvider.error', { provider })); }
    finally { setLoading(false); }
  };

  // The second sign-in step (authenticator app or text message) replaces the whole page.
  if (mfaChallenge) return <MfaScreen><MfaFlow challenge={mfaChallenge} returnTo={returnTo} /></MfaScreen>;

  return (
    <AuthLayout reference>
      <Button variant="outline" onClick={() => handleProvider('apple')} disabled={loading}>
        <AppleIcon className="w-4 h-4 mr-2 text-foreground" />
        {t('authProvider.continue', { provider: 'Apple' })}
      </Button>
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