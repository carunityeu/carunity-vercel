import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { entities } from '@/api/entities';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Check, 
  X, 
  Clock,
  Loader2,
  Delete
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const presetAmounts = [
  ['$175,000', '$170,000', '$175,000'],
  ['$175,000', '$170,000', '$175,000'],
  ['$175,000', '$170,000', '$175,000'],
];

export default function MakeOfferModal({ 
  open, 
  onOpenChange, 
  car, 
  user, 
  dealer,
  onSuccess 
}) {
  const { t } = useTranslation();
  const [step, setStep] = useState('input'); // input, processing, accepted, rejected
  const [offerAmount, setOfferAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(price);
  };

  const handleNumberClick = (num) => {
    if (offerAmount.length < 10) {
      setOfferAmount(prev => prev + num);
    }
  };

  const handleDelete = () => {
    setOfferAmount(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setOfferAmount('');
  };

  const handlePresetClick = (amount) => {
    // Extract number from string like "$175,000"
    const num = amount.replace(/[^0-9]/g, '');
    setOfferAmount(num);
  };

  const handleSubmit = async () => {
    if (!offerAmount || parseInt(offerAmount) <= 0) {
      toast.error('Введите сумму предложения');
      return;
    }

    if (!user) {
      base44.auth.redirectToLogin();
      return;
    }

    setIsSubmitting(true);
    const available = await entities.Car.filter({ id: car.id, status: 'active' }, '-created_date', 1);
    if (!available.length) {
      setIsSubmitting(false);
      toast.error(t('car.inactive_view_only'));
      onOpenChange(false);
      return;
    }
    setStep('processing');

    const sellerEmail = car.created_by || dealer?.owner_email || car.seller_id;

    if (!sellerEmail) {
      toast.error('Не удалось определить продавца');
      setIsSubmitting(false);
      setStep('input');
      return;
    }

    // Create offer
    await entities.PriceOffer.create({
      car_id: car.id,
      buyer_email: user.email,
      seller_email: sellerEmail,
      offered_price: parseInt(offerAmount),
      message: '',
      status: 'pending'
    });

    // Send offer as a message in chat
    const chatId = [user.email, sellerEmail, car.id].join('-').replace(/[^a-zA-Z0-9]/g, '_');
    await entities.Message.create({
      chat_id: chatId,
      sender_email: user.email,
      receiver_email: sellerEmail,
      car_id: car.id,
      content: `__OFFER__:${offerAmount}`
    });

    setIsSubmitting(false);
  };

  const handleClose = () => {
    setStep('input');
    setOfferAmount('');
    onOpenChange(false);
  };

  const renderContent = () => {
    switch (step) {
      case 'processing':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Clock className="w-12 h-12 text-slate-400 animate-pulse" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Your offer is being processed
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto">
              Please check notifications periodically to see if your offer was accepted or rejected by the seller
            </p>
            <Button 
              onClick={handleClose}
              variant="outline" 
              className="mt-8"
            >
              Back to Home
            </Button>
          </motion.div>
        );

      case 'accepted':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Check className="w-12 h-12 text-emerald-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Congrats! Your offer has been accepted!
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Your offer has been accepted by the seller for
            </p>
            <p className="text-2xl font-bold text-emerald-600 mt-2">
              €{formatPrice(offerAmount)}
            </p>
            <Button 
              onClick={() => {
                handleClose();
                if (onSuccess) onSuccess();
              }}
              className="mt-8 bg-emerald-500 hover:bg-emerald-600"
            >
              Proceed to Checkout
            </Button>
          </motion.div>
        );

      case 'rejected':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 mx-auto mb-6">
              <img 
                src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop" 
                alt=""
                className="w-full h-full rounded-full object-cover opacity-50"
              />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              We're sorry, your offer has been rejected
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto">
              Don't worry, you can always be able to make another offer. We'll leave a notification so that you know when new offers available for your offer
            </p>
            <Button 
              onClick={() => {
                setStep('input');
                setOfferAmount('');
              }}
              className="mt-8 bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800"
            >
              Make an Offer Again
            </Button>
          </motion.div>
        );

      default:
        return (
          <>
            <DialogHeader className="pb-3 border-b dark:border-slate-700">
              <DialogTitle className="text-center">Предложить цену</DialogTitle>
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-1">
                Цена продавца: <strong>€{formatPrice(car?.price || 0)}</strong>
              </p>
            </DialogHeader>

            <div className="py-4 space-y-4">
              {/* Input */}
              <div>
                <label className="text-sm text-slate-500 mb-1 block">Ваше предложение (€)</label>
                <input
                  type="number"
                  value={offerAmount}
                  onChange={e => setOfferAmount(e.target.value)}
                  placeholder="Введите сумму"
                  className="w-full h-12 px-4 text-xl font-bold border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>

              {/* Quick presets */}
              <div className="grid grid-cols-3 gap-2">
                {[0.95, 0.9, 0.85].map((pct) => {
                  const amount = Math.round((car?.price || 0) * pct);
                  return (
                    <button
                      key={pct}
                      onClick={() => setOfferAmount(amount.toString())}
                      className="py-2 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-center"
                    >
                      <div className="font-medium">€{formatPrice(amount)}</div>
                      <div className="text-xs text-slate-400">-{Math.round((1-pct)*100)}%</div>
                    </button>
                  );
                })}
              </div>

              <Button 
                onClick={handleSubmit}
                disabled={!offerAmount || isSubmitting}
                className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Отправить предложение'}
              </Button>
            </div>
          </>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}