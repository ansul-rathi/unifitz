# UniFit — Email OTP Login + Auth Email Flow: Claude Code Prompt

Copy below the line into Claude Code. This completes ALL the app-side work for email OTP login and the confirmation/redirect flow, so the only remaining task is the Resend domain verification (DNS, done in the dashboard). Extends the existing UniFit React + Vite + Tailwind + Supabase app. Keep password login and all dashboards intact.

---

Implement passwordless EMAIL OTP login and fix the auth redirect flow in the existing UniFit app. Supabase Auth is already set up with password login, role-based dashboards (admin/teacher/client), and a mandatory onboarding wizard. Add OTP alongside the existing login (do not remove password login). Email templates and SMTP are configured in the Supabase dashboard separately — do not attempt to manage templates or SMTP from code.

## 1. EMAIL OTP LOGIN (two-step, on the existing login screen)
Add an "Email me a code instead" option on the current login screen that switches to a passwordless flow:

Step A - enter email:
- A single email input + "Send code" button.
- On click: `await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true, emailRedirectTo: `${window.location.origin}/auth/confirm` } })`.
- `shouldCreateUser: true` so new users are created on first OTP (they then go through onboarding). Make this a constant ALLOW_SIGNUP_VIA_OTP = true so it can be flipped later.
- Show loading + a friendly error toast on failure (rate limit, invalid email).

Step B - enter the 6-digit code:
- After send succeeds, reveal a 6-digit code input (one box or 6 cells) + "Verify & sign in" button, plus the email shown with a "wrong email? change" link back to Step A.
- On verify: `await supabase.auth.verifyOtp({ email, token: code, type: 'email' })`. On success a session is returned -> proceed to post-login routing (section 3).
- Wrong/expired code: clear error message, let them retry or resend.

Resend control:
- A "Resend code" link with a 45-second cooldown countdown (disabled + showing "Resend in 45s"). Re-calls signInWithOtp.

## 2. FIX THE CONFIRMATION / REDIRECT FLOW (no more localhost)
- Wherever the app calls `signUp` (password signup) and `signInWithOtp`, pass `options.emailRedirectTo = `${window.location.origin}/auth/confirm``. Using window.location.origin means it is localhost in dev and the real domain in production automatically (the production domain + localhost must both be in Supabase's Redirect URLs allowlist — note this in the README; it is a dashboard setting, not code).
- Create a route/page at `/auth/confirm` that handles users arriving from an email link (confirmation link or magic link fallback):
  - Read `token_hash` and `type` from the URL query params.
  - Call `await supabase.auth.verifyOtp({ token_hash, type })` to exchange for a session.
  - On success: route via the post-login logic (section 3). On error (expired/invalid/prefetched link): show a clean "This link has expired or was already used" screen with a button to request a new code/link.
  - Also handle the case where Supabase returns the session via URL hash (detectSessionInUrl) - ensure the supabase client is created with detectSessionInUrl enabled so link-based sign-in completes.

## 3. POST-LOGIN ROUTING (reuse existing logic for both password and OTP)
After any successful auth (password, OTP code, or email link):
- Fetch the user's profile; read role.
- If profile.onboarding_complete is false (or profile is missing required fields, e.g. a brand-new OTP user) -> send to the existing onboarding wizard, then to the dashboard.
- Else route by role: admin -> Admin Dashboard, teacher -> Teacher Dashboard, client -> Client Dashboard.
- This must be a single shared function used by the password login, the OTP verify, and the /auth/confirm route so behavior is identical everywhere.

## 4. NEW OTP USERS
- A first-time OTP user (created via shouldCreateUser) will have a profile row created by the existing on-signup trigger but onboarding_complete=false. They must be funneled into the onboarding wizard before any dashboard, exactly like password signups.
- If the existing trigger expects signup metadata (full_name, referral_code) that OTP signup doesn't provide, ensure onboarding collects/sets full_name so the profile is complete; do not break the existing trigger.

## 5. SUPABASE CLIENT CONFIG
- Ensure the Supabase client is initialized with `auth: { detectSessionInUrl: true, persistSession: true, autoRefreshToken: true }` so email-link sign-ins and existing sessions work.
- Keep VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in env.

## 6. UI / UX
- OTP UI matches the existing login design (UniFit orange). Mobile-first, large tap targets, numeric keyboard for the code input on mobile (inputmode="numeric").
- Loading states on every async action; clear inline errors; success transitions straight into routing without a dead screen.
- No HTML form submit reloads (use button onClick handlers).

## DELIVERABLES
1. Updated login screen with password + "Email me a code" OTP two-step flow and resend cooldown.
2. New `/auth/confirm` route handling token_hash/type verification and the expired-link state.
3. A shared post-login routing function used by all auth paths (role + onboarding gate).
4. emailRedirectTo wired into signUp and signInWithOtp using window.location.origin.
5. Supabase client configured with detectSessionInUrl.
6. README note listing the dashboard settings that must exist (Site URL = production domain, Redirect URLs allowlist includes production + localhost, custom SMTP via Resend, Magic Link template shows {{ .Token }}) — these are done in Supabase, not code.
Do not modify the dashboards, the existing password signup fields, or the onboarding wizard's content beyond what is needed to funnel OTP users into it.
