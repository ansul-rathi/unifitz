import { Link } from 'react-router-dom';
import { BUSINESS, waLink } from '../../config';
import LegalLayout from './LegalLayout';

export default function Refund() {
  const days = BUSINESS.refundDays;
  return (
    <LegalLayout title="Cancellation & refund policy" description="How to cancel your Unifitz membership, when renewals stop, and when refunds apply.">
      <p>We want cancelling to be as easy as joining. This policy is part of our <Link to="/terms">terms of service</Link>.</p>

      <h2>Cancel anytime</h2>
      <ul>
        <li>Cancel from your account, by emailing <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>, or by <a href={waLink('Hi Unifitz, I’d like to cancel my membership.')} target="_blank" rel="noopener noreferrer">messaging us on WhatsApp</a>. No contracts, no cancellation fees.</li>
        <li>Your cancellation stops all future renewals. You keep full access until the end of the period you’ve already paid for.</li>
        <li>We’ll confirm your cancellation by email or WhatsApp. If you don’t receive a confirmation within 2 business days, contact us again.</li>
      </ul>

      <h2>Refunds</h2>
      {days ? (
        <p><strong>New members:</strong> if Unifitz isn’t right for you, ask for a refund within {days} days of your first payment and we’ll refund it in full — no questions asked. After that, payments for a period that has already started aren’t refundable, but you can cancel to stop the next renewal.</p>
      ) : (
        <p>Payments for a billing period that has already started aren’t refundable, but you can cancel at any time to stop the next renewal.</p>
      )}
      <ul>
        <li><strong>Charged after you cancelled?</strong> If a renewal goes through after you cancelled, we’ll refund it in full.</li>
        <li><strong>Classes we cancel:</strong> if we cancel a class and can’t offer a replacement or recording, tell us and we’ll credit or refund it.</li>
        <li><strong>Founding Member (annual):</strong> the same rules apply to the annual payment.</li>
        <li>Approved refunds go back to your original payment method, usually within 5–10 business days depending on your bank.</li>
      </ul>

      <h2>Questions</h2>
      <p>Email <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a> — {BUSINESS.supportHours.toLowerCase()}.</p>
    </LegalLayout>
  );
}
