import React, { useState, useEffect } from "react";

import { auth } from '@/api/auth';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import AuthLayout from "@/components/AuthLayout";
import AuthPasswordInput from '@/components/auth/AuthPasswordInput';
import GoogleIcon from "@/components/GoogleIcon";
import { toast } from "@/components/ui/use-toast";
import { safeReturnTo } from "@/lib/authReturnTo";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ConsentText, CONSENT_PENDING_KEY } from "@/components/auth/ConsentGate";
import { COUNTRIES } from "@/lib/countries";
import { translateCountry } from "@/utils/locationUtils";
import { LANGUAGES } from "@/components/ui/LanguageSwitcherMenu";

export default function Register() {
  const { t, i18n } = useTranslation();
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState(i18n.language?.slice(0, 2) || "ru");
  // One box: 18+, Terms of Use and Privacy Policy (needed for e-mail and for Google sign-up)
  const [agreed, setAgreed] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");


  useEffect(() => {
    setPreferredLanguage(i18n.language?.slice(0, 2) || "ru");
  }, [i18n.language]);

  const saveProfile = async () => {
    try {
      await auth.updateMe({
        full_name: fullName.trim(),
        country,
        preferred_language: preferredLanguage,
        gdpr_consent: true,
        gdpr_consent_date: new Date().toISOString(),
        terms_consent: true,
      });
    } catch {
      // Account is created; the details can still be filled in later in settings.
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!fullName.trim() || !country || !agreed) {
      setError(t('authVisual.consentRequired'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('authVisual.mismatch'));
      return;
    }
    setLoading(true);
    try {
      const { session } = await auth.register({ email, password, full_name: fullName.trim() });
      // With e-mail confirmation off the account is signed in right away
      if (session) { await saveProfile(); window.location.href = safeReturnTo(); return; }
      setShowOtp(true);
    } catch (err) {
      setError(err.message || t('authVisual.failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      await auth.verifyOtp({ email, otpCode });
      await saveProfile();
      window.location.href = safeReturnTo();
    } catch (err) {
      setError(err.message || t('authVisual.invalidCode'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await auth.resendOtp(email);
      toast({
        title: t('authVisual.codeSent'),
        description: t('authVisual.checkEmail'),
      });
    } catch (err) {
      setError(err.message || t('authVisual.resendFailed'));
    }
  };

  const handleProvider = async (provider) => {
    setError("");
    if (!agreed) {
      setError(t('authVisual.consentFirst', 'Отметьте согласие внизу формы: возраст 18+ и условия.'));
      document.getElementById('consent-all')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }
    // The account is created on return from Google; the consent is saved then (ConsentGate)
    try { localStorage.setItem(CONSENT_PENDING_KEY, new Date().toISOString()); } catch { /* storage blocked */ }
    setLoading(true);
    try { await auth.loginWithProvider(provider, safeReturnTo()); }
    catch (err) { setError(err.message || t('authProvider.error', { provider })); }
    finally { setLoading(false); }
  };


  if (showOtp) {
    return (
      <AuthLayout
        title={t('authVisual.verifyTitle')}
        subtitle={t('authVisual.codeTo', { email })}
      >
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}
        <div className="flex justify-center mb-6">
          <InputOTP
            maxLength={6}
            value={otpCode}
            onChange={setOtpCode}
            autoFocus
            autoComplete="one-time-code"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button
          className="w-full h-10 font-medium"
          onClick={handleVerify}
          disabled={loading || otpCode.length < 6}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t('authVisual.verifying')}
            </>
          ) : (
            t('authVisual.verify')
          )}
        </Button>
        <p className="text-center text-sm text-muted-foreground mt-4">
          {t('authVisual.noCode')}{" "}
          <button onClick={handleResend} className="text-primary font-medium hover:underline">
            {t('authVisual.resend')}
          </button>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout reference>
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
          <Label htmlFor="name">{t('authVisual.name')}</Label>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            placeholder={t('authVisual.namePlaceholder')}
            autoFocus
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="h-10"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">{t('authVisual.country')}</Label>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger id="country" className="h-10">
              <SelectValue placeholder={t('authVisual.selectCountry')} />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              {COUNTRIES.map((item) => (
                <SelectItem key={item} value={item}>{translateCountry(t, item)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="language">{t('authVisual.preferredLanguage')}</Label>
          <Select
            value={preferredLanguage}
            onValueChange={(value) => {
              setPreferredLanguage(value);
              i18n.changeLanguage(value);
            }}
          >
            <SelectTrigger id="language" className="h-10">
              <SelectValue placeholder={t('authVisual.selectLanguage')} />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              {LANGUAGES.map((item) => (
                <SelectItem key={item.code} value={item.code}>{item.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
          <AuthPasswordInput id="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">{t('authVisual.confirm')}</Label>
          <AuthPasswordInput id="confirm" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        </div>
        <div className="space-y-2.5 pt-1">
          <div className="flex items-start gap-2">
            <Checkbox id="consent-all" checked={agreed} onCheckedChange={(value) => setAgreed(value === true)} className="mt-0.5 shrink-0" />
            <label htmlFor="consent-all" className="cursor-pointer text-[11px] leading-relaxed text-muted-foreground sm:text-xs"><ConsentText /></label>
          </div>
        </div>
        <Button type="submit" className="w-full h-10 font-medium" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t('authVisual.creating')}
            </>
          ) : (
            t('authVisual.register')
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}