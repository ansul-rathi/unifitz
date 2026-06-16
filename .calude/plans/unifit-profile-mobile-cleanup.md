# UniFit — Mobile Profile Cleanup: Claude Code Prompt

Copy below the line into Claude Code. Scope: the client Profile screen, MOBILE VIEW ONLY. Do not change desktop/tablet layout, and do not change any data, fields, or logic — this is a layout/grouping refactor only.

---

Restructure the client Profile screen for mobile (viewport < 640px) only. The current mobile Profile page is cluttered: it stacks the profile header, a flat 11-row details list, AND the entire Refer & Earn section (referral code, how-it-works, referral list, top referrers) plus Sign out into one long scroll. Keep all the same data and fields; only reorganize the layout, and only on mobile. Desktop/tablet must remain unchanged (gate the new layout behind a mobile breakpoint).

### 1. Remove Refer & Earn from the Profile page
Refer & Earn already has its own dedicated tab. On the Profile screen, delete the entire embedded referral block (code card, how-it-works, your referrals, top referrers) and replace it with a single tappable row labelled "Refer & earn" with a gift icon and a right chevron that navigates to the existing Refer & Earn tab. Do not duplicate referral content on Profile.

### 2. Profile header card (keep, minor polish)
A white card with: avatar/initials circle, name, phone. Below it, a row of three compact stat tiles: Points (flame icon), Badges (medal icon), BMI (heartbeat icon, showing the BMI number). Equal-width tiles in one row, secondary background, rounded. (Replace the previous "27.4 Overweight" combined tile with just the BMI number; the category label moves into the details below.)

### 3. Group "Your details" into three labelled cards
Replace the single long list with three separate white cards, each preceded by a small uppercase section label in muted text. Each row is label (left, muted) + value (right, medium weight), with 0.5px dividers between rows and no divider after the last row.
- "Personal" card: Age, Gender. Put an "Edit" text-button in this section's header (right-aligned) that opens the existing edit flow.
- "Body & goals" card: Height, Starting weight, Target weight, Activity, Goal.
- "Your numbers" card: BMI (with a small coloured category pill next to the number — e.g. "Overweight" on a warning-tone background), TDEE (show "1,927 kcal/day" format). These are calculated values, kept visually separate from the user-entered fields above.

### 4. Account actions
Below the cards: the "Refer & earn" navigation row (from step 1), then a "Sign out" row — full-width, centered, danger-coloured text with a logout icon, in its own bordered row. Keep them visually distinct from the data cards.

### 5. Styling
- Mobile-only changes — wrap in the app's mobile breakpoint; do not alter the desktop component.
- Consistent vertical rhythm between cards (around 14-16px gaps), comfortable row padding (about 12px vertical), rounded card corners, 0.5px borders, flat surfaces (no heavy shadows).
- Reduce overall page length and visual noise; the goal is a clean, scannable single screen where each group of information has a clear home.
- Keep all existing functionality: Edit opens the same edit flow, Refer & earn navigates to that tab, Sign out works as before.

Deliver only the changed Profile component(s) and any small responsive helper needed; do not touch unrelated screens.
