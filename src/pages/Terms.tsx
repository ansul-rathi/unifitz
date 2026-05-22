import { FC } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const Terms: FC = () => (
  <>
    <Helmet>
      <title>Terms of Service | Unifitz</title>
      <meta name="description" content="Unifitz Terms of Service — rules and guidelines for using our platform and programs." />
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
        <h1 className="text-3xl sm:text-4xl font-black mb-2">Terms of Service</h1>
        <p className="text-neutral-500 text-sm mb-10">Last updated: May 22, 2026</p>

        <div className="space-y-10 text-neutral-300 leading-relaxed text-sm sm:text-base">

          <section>
            <h2 className="text-white font-bold text-lg mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using Unifitz (&ldquo;the Platform&rdquo;), registering for any program, or clicking any call-to-action on <strong className="text-white">unifitz.in</strong>, you agree to be bound by these Terms of Service. If you do not agree, please do not use the Platform.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">2. Our Services</h2>
            <p>Unifitz provides live and recorded online fitness sessions including Zumba, Yoga, and Strength Training, delivered via WhatsApp groups and video platforms. Programs include but are not limited to:</p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>21-Day Fitness Challenge</li>
              <li>30-Day Strength Challenge</li>
              <li>Regular monthly batch classes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">3. Registration & Eligibility</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>You must be at least 15 years of age to register.</li>
              <li>You must provide accurate and complete registration information.</li>
              <li>One registration per person per program batch.</li>
              <li>Unifitz reserves the right to decline or cancel registrations at its discretion.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">4. Payment & Fees</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Program fees are displayed at the time of registration.</li>
              <li>Payment must be completed via UPI, PhonePe, GPay, or Paytm to the number provided in the form.</li>
              <li>Your spot is confirmed only after payment verification by our team.</li>
              <li>Fees are non-transferable between programs or batches.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">5. Refund Policy</h2>
            <p>All program fees are <strong className="text-white">non-refundable</strong> once your registration is verified and you have been added to the program group. In the exceptional case of a program cancellation by Unifitz, a full refund will be processed within 7 business days.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">6. Health & Safety Disclaimer</h2>
            <p>Fitness activities carry inherent risk. By participating, you acknowledge that:</p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>You are physically capable of participating in the program.</li>
              <li>You have consulted a doctor if you have any medical conditions.</li>
              <li>Unifitz coaches are fitness instructors, not licensed medical professionals.</li>
              <li>You participate at your own risk and Unifitz is not liable for any injury or health issue arising from participation.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">7. Code of Conduct</h2>
            <p>All participants in Unifitz WhatsApp groups and sessions must:</p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>Treat coaches and fellow participants with respect.</li>
              <li>Not share program content, workout plans, or nutrition guides outside the group.</li>
              <li>Not engage in spam, harassment, or promotional activity within Unifitz groups.</li>
            </ul>
            <p className="mt-3">Violation of the code of conduct may result in immediate removal from the program without refund.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">8. Intellectual Property</h2>
            <p>All workout plans, nutrition guides, session recordings, and content provided by Unifitz are the intellectual property of Unifitz. You may not reproduce, distribute, or sell any content without written permission.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">9. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, Unifitz shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Platform or participation in any program.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">10. Changes to Terms</h2>
            <p>We may update these Terms at any time. Updated terms will be posted at <strong className="text-white">unifitz.in/terms</strong>. Continued participation after changes constitutes acceptance of the updated terms.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">11. Governing Law</h2>
            <p>These Terms are governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts in Jaipur, Rajasthan.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">12. Contact</h2>
            <p>Unifitz<br />Email: <a href="mailto:unifitzofficial@gmail.com" className="text-pink-400 hover:underline">unifitzofficial@gmail.com</a><br />WhatsApp: <a href="https://wa.me/917387846841" className="text-pink-400 hover:underline">+91 73878 46841</a></p>
          </section>

        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <Link to="/privacy-policy" className="text-pink-400 hover:underline text-sm">Privacy Policy →</Link>
          <Link to="/" className="text-neutral-500 hover:text-white text-sm transition-colors">← Back to Unifitz</Link>
        </div>
      </main>
    </div>
  </>
);

export default Terms;
