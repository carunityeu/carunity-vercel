import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';
import { getUserPreferredLanguage, getNotificationText } from '../../shared/notificationTranslations.ts';

// This function is triggered by entity automation when a Favorite is created
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const { event, data } = payload;

    if (event?.type !== 'create' || !data) {
      return Response.json({ ok: true });
    }

    const { car_id, user_email: liker_email } = data;

    if (!car_id || !liker_email) {
      return Response.json({ ok: true });
    }

    // Get car info
    const cars = await base44.asServiceRole.entities.Car.filter({ id: car_id });
    const car = cars[0];

    if (!car) return Response.json({ ok: true });

    // Don't notify if user favorited their own car
    if (car.created_by === liker_email) {
      return Response.json({ ok: true });
    }

    // Get recipient's preferred language
    const lang = await getUserPreferredLanguage(base44, car.created_by);
    const ctx = { carTitle: car.title };
    const { title, content } = getNotificationText('car_favorited', lang, ctx);

    // Create notification for car owner
    await base44.asServiceRole.entities.Notification.create({
      user_email: car.created_by,
      type: 'car_favorited',
      title,
      content,
      data: ctx,
      car_id: car_id,
      car_title: car.title,
      link: `/CarDetails?id=${car_id}`,
      is_read: false
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});