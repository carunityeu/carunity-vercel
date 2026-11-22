import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';

export default function AuthPasswordInput(props) {
  const [visible, setVisible] = useState(false);
  const { t } = useTranslation();
  const Icon = visible ? EyeOff : Eye;
  return <div className="relative">
    <Input {...props} type={visible ? 'text' : 'password'} className="h-10 pr-10" />
    <button type="button" className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary rounded-lg" onClick={() => setVisible(!visible)} aria-label={t(visible ? 'authVisual.hide' : 'authVisual.show')} aria-pressed={visible}>
      <Icon className="h-4 w-4" aria-hidden="true" />
    </button>
  </div>;
}