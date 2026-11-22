import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { Loader2, Check, Mail, Paperclip, X, AlertCircle } from 'lucide-react';

const MAX_FILES = 5;
const MAX_FILE_SIZE_MB = 25;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function ContactSupportModal({ open, onOpenChange }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [files, setFiles] = useState([]);
  const [fileError, setFileError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    setFileError('');
    const selected = Array.from(e.target.files);
    const combined = [...files, ...selected];

    if (combined.length > MAX_FILES) {
      setFileError(t('contact.file_max_count', { count: MAX_FILES }));
      e.target.value = '';
      return;
    }

    const oversized = selected.find(f => f.size > MAX_FILE_SIZE_BYTES);
    if (oversized) {
      setFileError(t('contact.file_too_large', { name: oversized.name, size: MAX_FILE_SIZE_MB }));
      e.target.value = '';
      return;
    }

    setFiles(combined);
    e.target.value = '';
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
    setFileError('');
  };

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} ${t('contact.kb')}`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} ${t('contact.mb')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setIsSending(true);
    setSendError('');

    try {
      let fileUrls = [];
      if (files.length > 0) {
        for (const file of files) {
          const { file_url } = await base44.integrations.Core.UploadFile({ file });
          fileUrls.push({ name: file.name, url: file_url });
        }
      }

      await base44.functions.invoke('sendContactEmail', {
        name: form.name,
        email: form.email,
        subject: form.subject,
        message: form.message,
        fileUrls,
      });

      setSent(true);
    } catch (err) {
      setSendError(t('contact.send_error'));
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setSent(false);
      setForm({ name: '', email: '', subject: '', message: '' });
      setFiles([]);
      setFileError('');
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-emerald-500" />
            {t('contact.title')}
          </DialogTitle>
        </DialogHeader>

        {sent ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{t('contact.sent_title')}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{t('contact.sent_desc')}</p>
            <Button onClick={handleClose} className="bg-emerald-500 hover:bg-emerald-600">{t('contact.close')}</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>{t('contact.field_name')}</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={t('contact.name_placeholder')} required />
            </div>
            <div>
              <Label>Email *</Label>
              <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="ivan@example.com" required />
            </div>
            <div>
              <Label>{t('contact.field_subject')}</Label>
              <Input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder={t('contact.subject_placeholder')} />
            </div>
            <div>
              <Label>{t('contact.field_message')}</Label>
              <Textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder={t('contact.message_placeholder')} rows={4} required />
            </div>

            {/* File attachments */}
            <div>
              <Label>{t('contact.attachments')}</Label>
              <div className="mt-1">
                {files.length > 0 && (
                  <div className="mb-2 space-y-1">
                    {files.map((file, i) => (
                      <div key={i} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2 text-sm">
                        <span className="truncate text-slate-700 dark:text-slate-300 flex-1 mr-2">{file.name}</span>
                        <span className="text-slate-400 text-xs mr-2 shrink-0">{formatSize(file.size)}</span>
                        <button type="button" onClick={() => removeFile(i)} className="text-slate-400 hover:text-red-500 transition-colors shrink-0">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {files.length < MAX_FILES && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                  >
                    <Paperclip className="w-4 h-4" />
                    {t('contact.attach_file', { current: files.length, max: MAX_FILES, size: MAX_FILE_SIZE_MB })}
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />

                {fileError && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-red-500 text-xs">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {fileError}
                  </div>
                )}
              </div>
            </div>

            {sendError && (
              <div className="flex items-center gap-1.5 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4" />
                {sendError}
              </div>
            )}

            <Button type="submit" disabled={isSending} className="w-full bg-emerald-500 hover:bg-emerald-600 gap-2">
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {files.length > 0 ? t('contact.uploading') : t('contact.sending')}
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  {t('contact.submit')}
                </>
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}