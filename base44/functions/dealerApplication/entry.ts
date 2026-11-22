import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { applicationData, reviewApplication } from '../../shared/dealerApplications.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
    const body = await req.json();
    const client = base44.asServiceRole;
    if (body.action === 'submit') {
      const validated = applicationData(body.form || {}, user);
      if (validated.error) return Response.json({ error: validated.error }, { status: 400 });
      const { items } = await client.entities.DealerApplication.filter({ applicant_email: user.email }, { sort: '-created_date', limit: 1 });
      if (items[0] && items[0].status !== 'rejected') return Response.json({ application: items[0] });
      const application = items[0] ? await client.entities.DealerApplication.update(items[0].id, validated.data) : await client.entities.DealerApplication.create(validated.data);
      return Response.json({ application });
    }
    if (body.action === 'review') {
      if (user.role !== 'admin') return Response.json({ error: 'forbidden' }, { status: 403 });
      if (!body.id || !['approved','rejected'].includes(body.decision)) return Response.json({ error: 'required' }, { status: 400 });
      const notes = typeof body.notes === 'string' ? body.notes.trim().slice(0, 3000) : '';
      if (body.decision === 'rejected' && !notes) return Response.json({ error: 'reason' }, { status: 400 });
      const app = await client.entities.DealerApplication.get(body.id);
      if (!app || app.status !== 'pending') return Response.json({ error: 'reviewed' }, { status: 409 });
      const application = await reviewApplication(client, app, body.decision, notes);
      return Response.json({ application });
    }
    return Response.json({ error: 'action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: 'failed' }, { status: error.status || 500 });
  }
}