import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { SITE } from '@/lib/config/site';

const SAGE = '#536046';
const BG   = '#fafaf5';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token   = searchParams.get('token');
  const confirm = searchParams.get('confirm') === 'true';

  if (!token) {
    return new NextResponse(errorPage('Invalid Link', 'No token provided. Please use the link from your email.'), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const supabase = createAdminClient();

  const { data: subscriber, error } = await supabase
    .from('newsletter_subscribers')
    .select('id, email, is_confirmed')
    .eq('unsubscribe_token', token)
    .maybeSingle();

  if (error || !subscriber) {
    return new NextResponse(errorPage('Link Not Found', 'This link is invalid or has already been used.'), {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  if (confirm) {
    // Confirm subscription
    await supabase
      .from('newsletter_subscribers')
      .update({ is_confirmed: true, confirmed_at: new Date().toISOString() })
      .eq('unsubscribe_token', token);

    return new NextResponse(successPage(
      'Subscription Confirmed',
      "You're now subscribed to the Yoga Founders Network newsletter. Welcome to the community!",
      'Read the Journal',
      `${SITE.url}/journal`
    ), {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // Unsubscribe
  await supabase
    .from('newsletter_subscribers')
    .update({ is_confirmed: false })
    .eq('unsubscribe_token', token);

  return new NextResponse(successPage(
    'Unsubscribed',
    "You've been unsubscribed from the Yoga Founders Network newsletter. We're sorry to see you go.",
    'Return to YFN',
    SITE.url
  ), {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

// ── HTML helpers ─────────────────────────────────────────────────────────────

function successPage(title: string, message: string, ctaLabel: string, ctaHref: string): string {
  return page(title, `
    <p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:#2d2d2d;">${message}</p>
    <a href="${ctaHref}" style="display:inline-block;background:${SAGE};color:#fff;padding:12px 28px;border-radius:4px;text-decoration:none;font-family:Arial,sans-serif;font-size:14px;">${ctaLabel}</a>
  `);
}

function errorPage(title: string, message: string): string {
  return page(title, `
    <p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:#c0392b;">${message}</p>
    <a href="${SITE.url}" style="display:inline-block;background:${SAGE};color:#fff;padding:12px 28px;border-radius:4px;text-decoration:none;font-family:Arial,sans-serif;font-size:14px;">Return to YFN</a>
  `);
}

function page(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title} — Yoga Founders Network</title>
</head>
<body style="margin:0;padding:0;background:${BG};font-family:Georgia,'Times New Roman',serif;">
  <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:40px 20px;">
    <div style="max-width:480px;width:100%;background:#fff;border:1px solid #e8e8e0;border-radius:8px;overflow:hidden;">
      <div style="background:${SAGE};padding:32px 40px;text-align:center;">
        <p style="margin:0;color:#fff;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-family:Arial,sans-serif;">Yoga Founders Network</p>
        <h1 style="margin:8px 0 0;color:#fff;font-size:22px;font-weight:normal;">${title}</h1>
      </div>
      <div style="padding:40px;">
        ${bodyHtml}
      </div>
    </div>
  </div>
</body>
</html>`;
}
