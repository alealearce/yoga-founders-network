import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// One-click opt-out from Get Featured outreach emails. Mirrors
// app/api/newsletter/unsubscribe/route.ts — minimal branded HTML, never
// errors loudly (an invalid/expired token just shows the same friendly page).

const SAGE = '#111111';
const BG   = '#ffffff';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return html(page(false));
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('listings')
      .update({ outreach_opt_out: true })
      .eq('invite_token', token)
      .select('id')
      .maybeSingle();

    return html(page(!error && !!data));
  } catch (err) {
    console.error('[outreach/unsubscribe] error:', err);
    return html(page(false));
  }
}

function html(body: string): NextResponse {
  return new NextResponse(body, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

function page(success: boolean): string {
  const title   = success ? "You're Unsubscribed" : 'Invalid Link';
  const message = success
    ? "You won't hear from us about this again."
    : "This link isn't valid.";

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
      <div style="padding:40px;text-align:center;">
        <p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:#2d2d2d;">${message}</p>
        <a href="https://yogafoundersnetwork.com" style="display:inline-block;background:${SAGE};color:#fff;padding:12px 28px;border-radius:4px;text-decoration:none;font-family:Arial,sans-serif;font-size:14px;">Return to YFN</a>
      </div>
    </div>
  </div>
</body>
</html>`;
}
