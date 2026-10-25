import { Link } from 'react-router-dom';
import { BUSINESS } from '../../config';
import LegalLayout, { OPERATOR, CONTACT } from './LegalLayout';

export default function Privacy() {
  return (
    <LegalLayout title="Privacy policy" description="How Unifitz collects, uses and protects your personal information, and the choices you have.">
      <p>This policy explains what personal information {OPERATOR} collects when you use unifitz.in and our live classes, why we collect it, and the choices you have. We operate from {BUSINESS.addressLine} and serve members in the United States, India and elsewhere.</p>

      <h2>What we collect</h2>
      <ul>
        <li><strong>Contact details</strong> — your name, email address and phone/WhatsApp number, when you sign up, request a free class or message us.</li>
        <li><strong>Fitness and health information you choose to share</strong> — goals (for example PCOS/PCOD support, postpartum return or weight loss), height, weight, measurements, activity level, dietary preferences and any health notes you add during onboarding or in the app. This is sensitive information; we only collect it with your consent and only use it to personalise your classes and plans.</li>
        <li><strong>Membership and payment records</strong> — your plan, billing period and payment status. Card and bank details are handled by our payment processor; we never see or store your full card number.</li>
        <li><strong>Class participation</strong> — attendance, check-ins and progress you log. If you join a class on camera, other participants and the instructor can see you; see “Class recordings” below.</li>
        <li><strong>Usage data</strong> — pages visited, device and browser type, approximate location (from IP address) and how you arrived (for example an ad or search), collected through analytics tools.</li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To create and run your account, schedule and deliver live classes, and send class links and reminders.</li>
        <li>To personalise workouts and diet plans to your goals and health information.</li>
        <li>To contact you about a free class you requested, or your membership — by email, phone or WhatsApp, only where you’ve agreed to it.</li>
        <li>To process payments, prevent fraud and meet legal and tax obligations.</li>
        <li>To understand how the site is used and improve it.</li>
      </ul>
      <p>We do <strong>not</strong> sell your personal information, and we do not share it for cross-context behavioural advertising.</p>

      <h2>Consent and your choices</h2>
      <p>Where we rely on consent (for example, to contact you about a free class, or to process health information), you can withdraw it at any time by emailing <a href={`mailto:${CONTACT}`}>{CONTACT}</a> or replying “STOP” on WhatsApp. Withdrawing consent doesn’t affect anything we did before you withdrew it.</p>

      <h2>Who we share it with</h2>
      <p>We share personal information only with service providers who help us run Unifitz, under contracts that limit their use of it:</p>
      <ul>
        <li><strong>Supabase</strong> — database, authentication and file storage.</li>
        <li><strong>Vercel</strong> — website hosting.</li>
        <li><strong>Zoom</strong> — live class delivery.</li>
        <li><strong>WhatsApp (Meta)</strong> — messages you choose to exchange with us.</li>
        <li><strong>Razorpay</strong> and/or other payment processors — payments.</li>
        <li><strong>Google Analytics</strong> — anonymous usage statistics.</li>
      </ul>
      <p>These providers may store data on servers outside your country, including in the United States and India. We may also disclose information if required by law, or to protect the rights and safety of our members and staff.</p>

      <h2>Class recordings</h2>
      <p>Some classes are recorded so members can catch up. Recordings are available only to members of that class and our staff. Cameras are always optional — keep yours off, or ask your instructor if you’d prefer not to appear in a recording.</p>

      <h2>How long we keep it</h2>
      <p>We keep account information while your account is active and for up to 3 years afterwards, unless the law requires longer (for example, payment and tax records). Free-class enquiries that don’t become memberships are deleted within 12 months. You can ask us to delete your information sooner.</p>

      <h2>Your rights</h2>
      <p>Depending on where you live (including under India’s Digital Personal Data Protection Act, 2023 and US state privacy laws such as California’s CCPA), you may have the right to access, correct, delete or get a copy of your personal information, to withdraw consent, and to nominate someone to exercise your rights. To make a request, email <a href={`mailto:${CONTACT}`}>{CONTACT}</a>. We’ll respond within 30 days and won’t treat you differently for exercising your rights.</p>

      <h2>Cookies and analytics</h2>
      <p>We use your browser’s local storage to keep you signed in. If analytics is enabled, Google Analytics sets cookies to measure visits; for visitors in the UK, EU and Switzerland these cookies stay off unless you agree to them. You can also block cookies in your browser settings.</p>

      <h2>Security</h2>
      <p>Data is encrypted in transit (HTTPS) and access is restricted to staff who need it. No system is perfectly secure; if a breach affects you, we’ll tell you and the relevant authorities as the law requires.</p>

      <h2>Children</h2>
      <p>Unifitz is for adults aged 18 and over. We don’t knowingly collect information from children.</p>

      <h2>Grievance officer and contact</h2>
      <p>For privacy questions, requests or complaints, contact our grievance officer at <a href={`mailto:${CONTACT}`}>{CONTACT}</a>, or write to us at {BUSINESS.addressLine}. If you’re not satisfied with our response, you may complain to your local data protection authority (in India, the Data Protection Board of India).</p>

      <h2>Changes to this policy</h2>
      <p>If we make material changes we’ll update the date at the top and, where appropriate, tell you by email. See also our <Link to="/terms">terms of service</Link>.</p>
    </LegalLayout>
  );
}
