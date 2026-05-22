import { FC } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const PrivacyPolicy: FC = () => (
  <>
    <Helmet>
      <title>Privacy Policy | Unifitz</title>
      <meta name="description" content="Unifitz Privacy Policy — how we collect, use, and protect your personal data." />
      <meta name="robots" content="noindex, follow" />
    </Helmet>

    <div className="min-h-screen bg-[#0a0514] text-white font-lexend">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-[#0a0514]/95 backdrop-blur-xl border-b border-white/5 px-4 sm:px-8 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-lg font-black tracking-tight text-pink-500 uppercase">Unifitz</Link>
          <Link to="/" className="text-sm text-neutral-400 hover:text-white transition-colors">← Back to Home</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-12 sm:py-20">
        <h1 className="text-3xl sm:text-4xl font-black mb-2">Privacy Policy</h1>
        <p className="text-neutral-500 text-sm mb-10">Last updated: May 22, 2026</p>

        <div className="space-y-10 text-neutral-300 leading-relaxed text-sm sm:text-base">

          <section>
            <h2 className="text-white font-bold text-lg mb-3">1. Who We Are</h2>
            <p>Unifitz (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is an online fitness platform based in India offering live Zumba, Yoga, and Strength Training classes. We operate at <strong className="text-white">unifitz.in</strong>. For any privacy-related queries, contact us at <a href="mailto:unifitzofficial@gmail.com" className="text-pink-400 hover:underline">unifitzofficial@gmail.com</a>.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">2. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-white">Registration data</strong> — full name, WhatsApp number, age, city, fitness level, goals.</li>
              <li><strong className="text-white">Payment evidence</strong> — screenshot of payment (stored securely, not your card details).</li>
              <li><strong className="text-white">Usage data</strong> — pages visited, time on site, referral source (via analytics).</li>
              <li><strong className="text-white">Communications</strong> — messages sent to us via WhatsApp or email.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Process your challenge or program registrations.</li>
              <li>Verify payment and add you to the correct batch WhatsApp group.</li>
              <li>Send program updates, schedules, and coaching materials.</li>
              <li>Improve our website and user experience.</li>
              <li>Respond to your queries and support requests.</li>
            </ul>
            <p className="mt-3">We do <strong className="text-white">not</strong> sell, rent, or trade your personal information to third parties.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">4. Data Storage & Security</h2>
            <p>Your data is stored securely using <strong className="text-white">Supabase</strong> (PostgreSQL database and object storage), hosted on servers compliant with industry-standard security practices. Payment screenshots are stored in a private bucket and accessed only by authorised Unifitz staff via time-limited signed URLs.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">5. WhatsApp Communication</h2>
            <p>By registering, you consent to receiving program-related messages on your provided WhatsApp number. We will not add you to unrelated groups or share your number with advertisers.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">6. Cookies & Analytics</h2>
            <p>We may use cookies and third-party analytics tools (such as Google Analytics) to understand site traffic. These tools collect anonymised, aggregated data. You can disable cookies in your browser settings at any time.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">7. Your Rights</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Request access to the personal data we hold about you.</li>
              <li>Request correction or deletion of your data.</li>
              <li>Withdraw consent to marketing communications at any time.</li>
            </ul>
            <p className="mt-3">To exercise these rights, email <a href="mailto:unifitzofficial@gmail.com" className="text-pink-400 hover:underline">unifitzofficial@gmail.com</a>.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">8. Children&apos;s Privacy</h2>
            <p>Our services are intended for users aged 15 and above. We do not knowingly collect personal data from children under 13.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">9. Changes to This Policy</h2>
            <p>We may update this policy from time to time. The latest version will always be available at <strong className="text-white">unifitz.in/privacy-policy</strong>. Continued use of our services after changes constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">10. Contact</h2>
            <p>Unifitz<br />Email: <a href="mailto:unifitzofficial@gmail.com" className="text-pink-400 hover:underline">unifitzofficial@gmail.com</a><br />WhatsApp: <a href="https://wa.me/917387846841" className="text-pink-400 hover:underline">+91 73878 46841</a></p>
          </section>

        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <Link to="/terms" className="text-pink-400 hover:underline text-sm">Terms of Service →</Link>
          <Link to="/" className="text-neutral-500 hover:text-white text-sm transition-colors">← Back to Unifitz</Link>
        </div>
      </main>
    </div>
  </>
);

export default PrivacyPolicy;
