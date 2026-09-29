import { NextResponse } from 'next/server';
import { issueGateToken } from '@/lib/botGate';

// Hands the lead form its signed load-time token (see lib/botGate.ts).
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ token: issueGateToken() }, { headers: { 'Cache-Control': 'no-store' } });
}
