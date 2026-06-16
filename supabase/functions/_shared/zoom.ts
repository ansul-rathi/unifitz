// Shared Zoom helpers for Edge Functions (Deno).
// - Server-to-Server OAuth (account_credentials grant), token cached in memory.
// - HMAC-SHA256 hex for webhook URL-validation + signature verification.
// - A service-role Supabase client factory.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export function svc() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  );
}

// ── OAuth token (cached per warm invocation; lives ~1h, no refresh token) ──
let cachedToken: { value: string; expiresAt: number } | null = null;

export async function getZoomToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.value;
  }
  const accountId = Deno.env.get('ZOOM_ACCOUNT_ID')!;
  const clientId = Deno.env.get('ZOOM_CLIENT_ID')!;
  const clientSecret = Deno.env.get('ZOOM_CLIENT_SECRET')!;
  const basic = btoa(`${clientId}:${clientSecret}`);

  const res = await fetch(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`,
    { method: 'POST', headers: { Authorization: `Basic ${basic}` } },
  );
  if (!res.ok) throw new Error(`Zoom OAuth failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  cachedToken = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cachedToken.value;
}

export async function zoomFetch(path: string, init: RequestInit = {}) {
  const token = await getZoomToken();
  const res = await fetch(`https://api.zoom.us/v2${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(init.headers ?? {}) },
  });
  const text = await res.text();
  const body = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(`Zoom API ${path} -> ${res.status}: ${text}`);
  return body;
}

// ── HMAC-SHA256 hex (Web Crypto) ──
export async function hmacHex(message: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('');
}
