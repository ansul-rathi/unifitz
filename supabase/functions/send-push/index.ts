// send-push — delivers one notification row (or a test) to the recipients'
// devices through Firebase Cloud Messaging (HTTP v1).
//
// Called only by the database (migration_push.sql → trg_push_notification /
// send_test_push) with header x-push-secret, checked via push_secret_ok().
// Body: { id }  or  { test: true, user_id }
//
// Secrets: FCM_SERVICE_ACCOUNT = the Firebase service-account JSON.
// MUST be deployed with JWT verification OFF (the DB has no user JWT):
//   supabase functions deploy send-push --no-verify-jwt

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SITE = 'https://www.unifitz.in';
const HOME: Record<string, string> = { admin: '/admin', teacher: '/teacher', client: '/app' };

// Must match the app's Android channels (lib/notifications/alerts.dart).
const CHANNEL = {
  leads: 'unifitz_leads_v1',
  activity: 'unifitz_activity_v1',
  inbox: 'unifitz_inbox_v1',
};
const ACTIVITY = new Set(['signup', 'enrollment', 'payment', 'account_deletion']);
// The app already rings these from a local alarm at class end — phones skip them.
const SCHEDULED_ON_PHONE = new Set(['class_rate', 'class_ended']);

const TITLE: Record<string, string> = {
  lead: '🔥 New lead — call now',
  payment: '💰 New payment',
  enrollment: '🎟️ New enrollment',
  account_deletion: '⚠️ Account deletion request',
  signup: '🙌 New signup',
  class_remark: '💬 Note from your trainer',
  class_added: '🎉 New live class',
  class_rate: '⭐ Rate your class',
  class_feedback: '⭐ New class rating',
  class_ended: '📋 Mark attendance',
};

type Row = {
  id: string; type: string; title: string; link: string | null;
  recipient_id: string | null; actor_id: string | null; challenge_id: string | null; created_at: string;
};
type Token = { token: string; platform: 'android' | 'ios' | 'web'; user_id: string; role: string };

const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
  auth: { persistSession: false },
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

Deno.serve(async req => {
  if (req.method !== 'POST') return json({ error: 'method' }, 405);
  const secret = req.headers.get('x-push-secret') ?? '';
  const { data: ok } = await db.rpc('push_secret_ok', { p_secret: secret });
  if (ok !== true) return json({ error: 'forbidden' }, 403);

  try {
    const body = await req.json();
    let row: Row;
    let userIds: string[];
    const silent = body.test === true && body.silent === true;

    if (body.test === true && typeof body.user_id === 'string') {
      row = {
        id: crypto.randomUUID(), type: silent ? 'verify' : 'test', title: 'Push notifications are working on this device.',
        link: null, recipient_id: body.user_id, actor_id: null, challenge_id: null, created_at: new Date().toISOString(),
      };
      userIds = [body.user_id];
    } else {
      const { data, error } = await db.from('notifications')
        .select('id, type, title, link, recipient_id, actor_id, challenge_id, created_at')
        .eq('id', body.id).maybeSingle();
      if (error) throw error;
      if (!data) return json({ skipped: 'not found' });
      row = data as Row;
      if (row.recipient_id) {
        userIds = [row.recipient_id];
      } else {
        const { data: admins, error: e2 } = await db.from('profiles').select('id').eq('role', 'admin').or('is_active.is.null,is_active.eq.true');
        if (e2) throw e2;
        userIds = (admins ?? []).map(a => a.id);
      }
    }
    if (userIds.length === 0) return json({ sent: 0 });

    const { data: tokRows, error: e3 } = await db.from('push_tokens')
      .select('token, platform, user_id, profile:user_id(role)').in('user_id', userIds);
    if (e3) throw e3;
    const tokens: Token[] = (tokRows ?? []).map((t: any) => ({
      token: t.token, platform: t.platform, user_id: t.user_id, role: t.profile?.role ?? 'client',
    })).filter(t => silent
      ? t.platform !== 'web'
      : t.platform === 'web' || !SCHEDULED_ON_PHONE.has(row.type));
    if (tokens.length === 0) return json({ sent: 0 });

    const sa = JSON.parse(Deno.env.get('FCM_SERVICE_ACCOUNT') ?? '{}');
    if (!sa.client_email || !sa.private_key) throw new Error('FCM_SERVICE_ACCOUNT secret missing or invalid');
    const access = await accessToken(sa);

    const results = await Promise.all(tokens.map(t => send(sa.project_id, access, t, row, silent)));
    const dead = tokens.filter((_, i) => results[i] === 'dead').map(t => t.token);
    if (dead.length) await db.from('push_tokens').delete().in('token', dead);
    return json({
      sent: results.filter(r => r === 'ok').length,
      failed: results.filter(r => r === 'error').length,
      removed: dead.length,
    });
  } catch (e) {
    console.error('send-push', e);
    return json({ error: String((e as Error).message ?? e) }, 500);
  }
});

function channelFor(t: Token, type: string) {
  if (type === 'lead' || (type === 'test' && t.role === 'admin')) return CHANNEL.leads;
  if (ACTIVITY.has(type)) return CHANNEL.activity;
  return CHANNEL.inbox;
}

async function send(projectId: string, access: string, t: Token, row: Row, silent: boolean): Promise<'ok' | 'dead' | 'error'> {
  if (silent) {
    // Data-only: nothing is shown; the open app sees it and knows push works.
    return post(projectId, access, t, {
      token: t.token,
      data: { type: 'verify', id: row.id },
      android: { priority: 'HIGH' },
      apns: { headers: { 'apns-push-type': 'background', 'apns-priority': '5' }, payload: { aps: { 'content-available': 1 } } },
    });
  }
  const title = row.type === 'test' ? '✅ Unifitz test' : TITLE[row.type] ?? 'Unifitz';
  const channel = channelFor(t, row.type);
  const loud = channel === CHANNEL.leads;
  const webPath = row.link ?? `${HOME[t.role] ?? '/app'}/notifications`;

  // Strings only — FCM data values must be strings. The app rebuilds the row
  // from these to pick the screen to open.
  const data: Record<string, string> = {
    id: row.id, type: row.type, title: row.title, created_at: row.created_at,
    ...(row.link ? { link: row.link } : {}),
    ...(row.actor_id ? { actor_id: row.actor_id } : {}),
    ...(row.challenge_id ? { challenge_id: row.challenge_id } : {}),
  };

  const message = {
    token: t.token,
    notification: { title, body: row.title },
    data,
    android: {
      priority: 'HIGH',
      notification: {
        channel_id: channel,
        tag: row.id,
        icon: 'ic_stat_unifitz',
        color: '#F97316',
        notification_priority: loud ? 'PRIORITY_MAX' : 'PRIORITY_HIGH',
        visibility: 'PRIVATE',
      },
    },
    apns: {
      headers: { 'apns-priority': '10', 'apns-push-type': 'alert', 'apns-collapse-id': row.id },
      payload: {
        aps: {
          sound: loud ? 'unifitz_lead_alert.wav' : 'default',
          'interruption-level': loud ? 'time-sensitive' : 'active',
          'thread-id': channel,
        },
      },
    },
    webpush: {
      headers: { Urgency: 'high' },
      notification: { title, body: row.title, icon: '/icon-192.png', tag: row.id, requireInteraction: loud },
      fcm_options: { link: SITE + webPath },
    },
  };
  return post(projectId, access, t, message);
}

async function post(projectId: string, access: string, t: Token, message: unknown): Promise<'ok' | 'dead' | 'error'> {
  const res = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${access}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  if (res.ok) return 'ok';
  const err = await res.json().catch(() => ({}));
  const code = err?.error?.details?.find((d: any) => d.errorCode)?.errorCode ?? err?.error?.status;
  console.warn('fcm', t.platform, res.status, code, err?.error?.message);
  // Uninstalled app / revoked browser permission / token from another project.
  return res.status === 404 || code === 'UNREGISTERED' || code === 'SENDER_ID_MISMATCH' ? 'dead' : 'error';
}

// ── Google OAuth token from the service account (cached per instance) ──
let cached: { token: string; exp: number } | null = null;

async function accessToken(sa: { client_email: string; private_key: string; token_uri?: string }) {
  if (cached && cached.exp > Date.now() + 60_000) return cached.token;
  const aud = sa.token_uri ?? 'https://oauth2.googleapis.com/token';
  const now = Math.floor(Date.now() / 1000);
  const enc = new TextEncoder();
  const header = b64url(enc.encode(JSON.stringify({ alg: 'RS256', typ: 'JWT' })));
  const claims = b64url(enc.encode(JSON.stringify({
    iss: sa.client_email, scope: 'https://www.googleapis.com/auth/firebase.messaging', aud, iat: now, exp: now + 3600,
  })));
  const pem = sa.private_key.replace(/-----[^-]+-----/g, '').replace(/\s/g, '');
  const der = Uint8Array.from(atob(pem), c => c.charCodeAt(0));
  const key = await crypto.subtle.importKey('pkcs8', der, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, enc.encode(`${header}.${claims}`)));
  const jwt = `${header}.${claims}.${b64url(sig)}`;

  const res = await fetch(aud, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
  });
  const out = await res.json();
  if (!res.ok) throw new Error(`google oauth ${res.status}: ${out.error_description ?? out.error}`);
  cached = { token: out.access_token, exp: Date.now() + out.expires_in * 1000 };
  return cached.token;
}

function b64url(bytes: Uint8Array) {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
