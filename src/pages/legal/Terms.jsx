import { Link } from 'react-router-dom';
import { BUSINESS } from '../../config';
import LegalLayout, { OPERATOR, CONTACT } from './LegalLayout';

export default function Terms() {
  return (
    <LegalLayout title="Terms of service" description="The terms for using Unifitz live online fitness classes: membership, billing, auto-renewal, cancellation, class conduct and health disclaimer.">
      <p>These terms are an agreement between you and {OPERATOR}, based in {BUSINESS.addressLine}. By creating an account, booking a free class or buying a membership, you agree to them. Please also read our <Link to="/privacy">privacy policy</Link> and <Link to="/refund">cancellation &amp; refund policy</Link>.</p>

      <h2>1. Who can join</h2>
      <p>You must be 18 or older. Unifitz classes are women-only; we may decline or end a membership that doesn’t meet this requirement.</p>

      <h2 id="health">2. Health disclaimer — please read</h2>
      <p>Unifitz provides general fitness, movement and nutrition guidance. <strong>It is not medical advice, diagnosis or treatment</strong>, and our instructors are not your doctors. Programmes such as PCOS/PCOD Care, Post-40 Strength, Weight-Loss Intensive and Postpartum Return are designed for general wellbeing; individual results vary and are not guaranteed.</p>
      <ul>
        <li>Talk to your doctor before starting any exercise or diet programme — especially if you are pregnant, have recently given birth, have PCOS/PCOD, a heart, joint, blood-pressure or other medical condition, or take medication.</li>
        <li>Stop immediately and seek medical help if you feel pain, dizziness, shortness of breath or discomfort.</li>
        <li>Exercise carries an inherent risk of injury. You take part voluntarily and at your own risk, and are responsible for a safe space to exercise in.</li>
        <li>Tell your instructor about any injury or condition so they can suggest modifications.</li>
      </ul>

      <h2>3. Membership and billing</h2>
      <ul>
        <li>Prices are shown in US dollars on our pricing page, before any applicable taxes. The plan, price and billing period you choose are shown before you pay.</li>
        <li><strong>Automatic renewal:</strong> monthly and quarterly memberships renew automatically at the end of each billing period, at the then-current price, and you’ll be charged using your saved payment method until you cancel. We’ll tell you before any price change takes effect.</li>
        <li>Founding Member is an annual plan billed once per year.</li>
        <li>You can switch plans at any time; changes take effect from your next billing date.</li>
      </ul>

      <h2>4. Cancellation</h2>
      <p>You can cancel at any time from your account, or by emailing <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a> or messaging us on WhatsApp. Cancellation stops future renewals; you keep access until the end of the period you’ve paid for. Refunds are covered by our <Link to="/refund">cancellation &amp; refund policy</Link>.</p>

      <h2>5. Classes</h2>
      <ul>
        <li>Classes run live on Zoom at the times on our timetable. We may occasionally change times or instructors, or cancel a class, and will give as much notice as we can.</li>
        <li>Your class links and account are for you alone — please don’t share them.</li>
        <li>Be respectful. We may remove anyone who harasses, records or photographs other members, or disrupts a class.</li>
        <li><strong>Recordings:</strong> some classes are recorded and shared only with members of that class for catch-up. Cameras are optional; by joining with your camera on, you agree to appear in the recording. You must not record, screenshot or share classes or other members yourself.</li>
      </ul>

      <h2>6. Free classes</h2>
      <p>Free masterclass seats are limited, one per person, and carry no obligation to buy.</p>

      <h2>7. Our content</h2>
      <p>Classes, recordings, diet plans, recipes and site content belong to Unifitz or its instructors. You may use them for your own personal, non-commercial fitness only.</p>

      <h2>8. Liability</h2>
      <p>To the extent the law allows, Unifitz is not liable for indirect or consequential losses, or for injury arising from your participation except where caused by our negligence, and our total liability to you is limited to the amount you paid us in the 3 months before the claim. Nothing in these terms limits rights you have under consumer-protection law that can’t be excluded.</p>

      <h2>9. Governing law</h2>
      <p>These terms are governed by the laws of India, and the courts at Jaipur, Rajasthan have jurisdiction — without affecting any mandatory consumer rights you have where you live.</p>

      <h2>10. Changes and contact</h2>
      <p>We may update these terms; if a change is material we’ll tell you before it applies to your membership. Questions: <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.</p>
    </LegalLayout>
  );
}
