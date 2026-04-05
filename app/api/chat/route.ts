import { NextRequest, NextResponse } from 'next/server';
import { chatWithAssistant } from '@/lib/ai/claude';
import type { ChatMessage } from '@/lib/ai/claude';
import { rateLimit } from '@/lib/rateLimit';
import { SITE } from '@/lib/config/site';

export const runtime = 'nodejs';

const SUPPORT_EMAIL_MARKER = SITE.supportEmail;
const MAX_MSG_LENGTH = 2000;
const VALID_ROLES = new Set(['user', 'assistant']);

export async function POST(req: NextRequest) {
  // Rate limit: 20 messages per minute per IP
  const rl = rateLimit(req, { limit: 20, windowMs: 60_000, prefix: 'chat' });
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait before sending more messages.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
    );
  }

  try {
    const body = await req.json() as { messages: ChatMessage[] };
    const { messages } = body;

    // Validate messages array structure and content length
    if (
      !messages ||
      !Array.isArray(messages) ||
      messages.length === 0 ||
      messages.length > 40 ||
      messages.some(
        (m) =>
          typeof m?.content !== 'string' ||
          !VALID_ROLES.has(m?.role) ||
          m.content.length > MAX_MSG_LENGTH
      )
    ) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Limit conversation history to last 10 messages to control token usage
    const recent = messages.slice(-10);
    const reply = await chatWithAssistant(recent);

    // Log if the reply triggers escalation (support email mentioned)
    if (reply.includes(SUPPORT_EMAIL_MARKER)) {
      console.log('[chat] escalation triggered in reply');
    }

    return NextResponse.json({ reply });
  } catch (err) {
    console.error('[chat] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
