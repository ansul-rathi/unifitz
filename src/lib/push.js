// Browser push (Firebase Cloud Messaging). The server (`send-push` Edge
// Function) pushes every new notification row to the recipient's registered
// browsers; `public/firebase-messaging-sw.js` shows it while the tab is closed
// or in the background. While a tab is open and visible, the realtime bell in
// DashboardLayout handles it (badge + new-lead sound) instead.
//
// Firebase is loaded lazily so the public pages and the SSR prerender never
// pull it in. Keep FIREBASE_CONFIG in sync with public/firebase-messaging-sw.js.
import { supabase } from './supabase';

// Public web-app identifiers (not secrets).
const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyB8Vu1H85Dzsnk7x3AvsywnpLKrj9DvCTw',
  authDomain: 'unifitz-7e01c.firebaseapp.com',
  projectId: 'unifitz-7e01c',
  storageBucket: 'unifitz-7e01c.firebasestorage.app',
  messagingSenderId: '401520391936',
  appId: '1:401520391936:web:816fffa9aeab21acbc65e5',
};
const VAPID_KEY = 'BF2r5KPSETADC9yUFDgg9mFa-6sN-RLdAzV99mvKy1K57X7NhOhP3TDV5OGTGWCtehYWPtvocs8QNEF-mA4a468';
const TOKEN_KEY = 'unifitz_push_token';

const store = {
  get: () => { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } },
  set: v => { try { localStorage.setItem(TOKEN_KEY, v); } catch { /* private mode */ } },
  clear: () => { try { localStorage.removeItem(TOKEN_KEY); } catch { /* private mode */ } },
};

let messagingPromise;
async function messaging() {
  messagingPromise ??= (async () => {
    const [{ initializeApp, getApps }, m] = await Promise.all([import('firebase/app'), import('firebase/messaging')]);
    if (!(await m.isSupported())) return null;
    const app = getApps()[0] ?? initializeApp(FIREBASE_CONFIG);
    return { m, instance: m.getMessaging(app) };
  })().catch(() => null);
  return messagingPromise;
}

/** 'unsupported' | 'default' (not asked yet) | 'granted' | 'denied' */
export function pushPermission() {
  if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) return 'unsupported';
  return Notification.permission;
}

async function register() {
  const fm = await messaging();
  if (!fm) throw new Error('This browser does not support push notifications.');
  const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/firebase-cloud-messaging-push-scope' });
  const token = await fm.m.getToken(fm.instance, { vapidKey: VAPID_KEY, serviceWorkerRegistration: reg });
  if (!token) throw new Error('Could not get a push token.');
  const { error } = await supabase.rpc('register_push_token', { p_token: token, p_platform: 'web' });
  if (error) throw error;
  store.set(token);
  return token;
}

/** Ask for permission (needs a click) and register this browser. */
export async function enablePush() {
  if (pushPermission() === 'unsupported') throw new Error('This browser does not support push notifications.');
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') throw new Error('Notifications are blocked for this site. Allow them in the browser settings.');
  return register();
}

/** On sign-in / app load: keep the token fresh if permission was given before. Never throws. */
export async function refreshPush() {
  if (pushPermission() !== 'granted') return;
  try { await register(); } catch { /* backend not ready / offline — the realtime bell still works */ }
}

/** Before sign-out, while the session can still unregister this browser. Never throws. */
export async function disablePush() {
  const token = store.get();
  store.clear();
  if (!token) return;
  try { await supabase.rpc('unregister_push_token', { p_token: token }); } catch { /* ignore */ }
  try {
    const fm = await messaging();
    if (fm) await fm.m.deleteToken(fm.instance);
  } catch { /* ignore */ }
}

/** Visible test push to this account's devices. */
export async function sendTestPush() {
  const { error } = await supabase.rpc('send_test_push', { p_silent: false });
  if (error) throw error;
}
