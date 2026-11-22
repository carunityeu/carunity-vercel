import React from 'react';
import { Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function ContactSellerDialog({ open, onOpenChange, message, onMessageChange, onSend }) {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{t('car.write_seller')}</DialogTitle></DialogHeader>
        <div className="space-y-4 pt-4">
          <Textarea placeholder={t('car.message_placeholder')} value={message} onChange={(e) => onMessageChange(e.target.value)} rows={4} className="resize-none" />
          <Button onClick={onSend} className="w-full gap-2 bg-emerald-500 hover:bg-emerald-600" type="button">
            <Send className="h-4 w-4" />{t('car.send')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}