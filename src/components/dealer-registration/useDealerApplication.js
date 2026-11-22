import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const initial = { dealer_name:'', country:'', city:'', address:'', website:'', description:'', applicant_name:'', phone:'', contact_email:'', import_requested:false, import_url:'', data_usage_consent:false, gdpr_consent:false, terms_consent:false };
export default function useDealerApplication() {
  const [user,setUser] = useState(null);
  const [application,setApplication] = useState(null);
  const [form,setForm] = useState(initial);
  const [loading,setLoading] = useState(true);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  const [editing,setEditing] = useState(false);
  const [loadError,setLoadError] = useState(false);
  const load = async () => {
    setLoading(true); setLoadError(false);
    try {
      const signedIn = await base44.auth.isAuthenticated();
      if (!signedIn) return;
      const me = await base44.auth.me(); setUser(me);
      const {items} = await base44.entities.DealerApplication.filter({ applicant_email:me.email }, { sort:'-created_date', limit:1 });
      const app = items[0] || null; setApplication(app);
      setForm({...initial, applicant_name:me.full_name || '', contact_email:me.email, ...(app ? Object.fromEntries(Object.keys(initial).map(key => [key, app[key] ?? initial[key]])) : {}), gdpr_consent:false, terms_consent:false, data_usage_consent:false});
    } catch (e) { if (e.status !== 401 && e.response?.status !== 401) setLoadError(true); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (!user) return;
    return base44.entities.DealerApplication.subscribe(event => {
      if (event.id === application?.id && event.type === 'update') { setApplication(event.data); setEditing(false); }
    });
  }, [user,application?.id]);
  const update = (key,value) => {setForm(prev => ({...prev,[key]:value})); setError('');};
  const submit = async () => {
    if (!user) {base44.auth.redirectToLogin(window.location.href); return;}
    if (!form.gdpr_consent || !form.terms_consent || (form.import_requested && !form.data_usage_consent)) {setError('consent'); return;}
    setBusy(true); setError('');
    try {const {data} = await base44.functions.invoke('dealerApplication',{action:'submit',form}); setApplication(data.application); setEditing(false); window.scrollTo({top:0});}
    catch(e) {const key=e.response?.data?.error; setError(['required','consent','url','source'].includes(key) ? key : 'failed');}
    finally {setBusy(false);}
  };
  return {user,application,form,update,loading,busy,error,editing,setEditing,submit,loadError,load};
}