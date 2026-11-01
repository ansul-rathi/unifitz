import { Link } from 'react-router-dom';
import LegalLayout, { CONTACT } from './LegalLayout';

// Public account-deletion page — the URL Google Play's Data safety form asks
// for, also linked from the privacy policy.
export default function DeleteAccount() {
  return (
    <LegalLayout title="Delete your Unifitz account" description="How to delete your Unifitz account and data, what gets deleted and how long it takes.">
      <p>You can delete your Unifitz account yourself at any time, from the Unifitz app or the website.</p>

      <h2>How to delete your account</h2>
      <ol>
        <li><strong>In the app:</strong> open <em>Profile</em> and tap <em>Delete account</em>.</li>
        <li><strong>On the website:</strong> <Link to="/auth">sign in</Link>, open <em>Profile</em> and choose <em>Delete account</em>.</li>
        <li><strong>Can’t sign in?</strong> Email <a href={`mailto:${CONTACT}?subject=Delete%20my%20Unifitz%20account`}>{CONTACT}</a> from the email address on your account and we’ll do it for you.</li>
      </ol>

      <h2>What happens next</h2>
      <ul>
        <li>You’re signed out straight away and your account is scheduled for deletion in <strong>30 days</strong>.</li>
        <li>Changed your mind? Sign in any time within those 30 days and tap <em>Keep my account</em>.</li>
        <li>After 30 days we permanently delete your account and everything linked to it: profile and contact details, body measurements and goals, check-ins and progress, class enrolments, attendance and ratings, badges, referrals, notifications and payment history.</li>
        <li>Deleted data can’t be recovered.</li>
      </ul>

      <h2>Trainer and admin accounts</h2>
      <p>Staff accounts are managed by the Unifitz team — email <a href={`mailto:${CONTACT}`}>{CONTACT}</a> to have one removed.</p>
    </LegalLayout>
  );
}
