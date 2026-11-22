Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { name, email, subject, message, fileUrls } = body;

    if (!name || !email || !message) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let fileSection = '';
    if (fileUrls && fileUrls.length > 0) {
      fileSection = '<br><br><strong>Вложения:</strong><br>' + fileUrls.map(f => `- <a href="${f.url}">${f.name}</a>`).join('<br>');
    }

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'CarUnity Contact <noreply@carunity.eu>',
        to: ['info@carunity.eu'],
        reply_to: email,
        subject: subject || `Обращение от ${name}`,
        html: `<p><strong>От:</strong> ${name} &lt;${email}&gt;</p><p>${message.replace(/\n/g, '<br>')}</p>${fileSection}`,
      }),
    });

    if (!resendRes.ok) {
      const err = await resendRes.text();
      console.error('Resend error:', err);
      return Response.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('sendContactEmail error:', error?.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});