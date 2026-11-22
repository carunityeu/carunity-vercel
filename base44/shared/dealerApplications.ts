export function applicationData(form, user) {
  const text = key => typeof form[key] === 'string' ? form[key].trim().slice(0, key === 'description' ? 3000 : 300) : '';
  const data = Object.fromEntries(['dealer_name','applicant_name','contact_email','phone','address','city','country','website','description','import_url'].map(key => [key, text(key)]));
  if (['dealer_name','applicant_name','contact_email','phone','city','country'].some(key => !data[key])) return { error: 'required' };
  if (!['Латвия','Литва','Эстония'].includes(data.country) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contact_email)) return { error: 'required' };
  if (form.gdpr_consent !== true || form.terms_consent !== true) return { error: 'consent' };
  const validUrl = value => { try { return ['https:','http:'].includes(new URL(value).protocol); } catch { return false; } };
  if (data.website && !validUrl(data.website)) return { error: 'url' };
  if (form.import_requested === true) {
    if (!validUrl(data.import_url)) return { error: 'url' };
    const host = new URL(data.import_url).hostname.toLowerCase();
    if (['auto24.ee','autoplius.lt','ss.lv','veego.ee'].some(domain => host === domain || host.endsWith('.' + domain))) return { error: 'source' };
    if (form.data_usage_consent !== true) return { error: 'consent' };
  }
  return { data: { ...data, applicant_email: user.email, import_requested: form.import_requested === true, import_url: form.import_requested === true ? data.import_url : '', data_usage_consent: form.import_requested === true && form.data_usage_consent === true, gdpr_consent: true, terms_consent: true, consented_at: new Date().toISOString(), status: 'pending', admin_notes: '' } };
}

export async function reviewApplication(client, app, decision, notes) {
  if (decision === 'rejected') return await client.entities.DealerApplication.update(app.id, { status: decision, admin_notes: notes });
  const { items: existing } = await client.entities.Dealer.filter({ owner_email: app.applicant_email }, { limit: 1 });
  const fields = { name: app.dealer_name, owner_email: app.applicant_email, phone: app.phone || '', email: app.contact_email || app.applicant_email, contact_person: app.applicant_name || '', address: app.address || '', city: app.city || '', country: app.country || '', description: app.description || '', website: app.website || '', brands: app.brands || [], is_verified: true };
  const dealer = existing[0] ? await client.entities.Dealer.update(existing[0].id, fields) : await client.entities.Dealer.create({ ...fields, logo: app.logo_url || '', subscription_type: 'starter', reviews_count: 0 });
  const applicants = await client.entities.User.filter({ email: app.applicant_email });
  if (applicants[0]) await client.entities.User.update(applicants[0].id, { user_type: 'dealer', dealer_id: dealer.id });
  return await client.entities.DealerApplication.update(app.id, { status: 'approved', dealer_id: dealer.id, admin_notes: notes });
}