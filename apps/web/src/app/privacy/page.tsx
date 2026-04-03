import { Header } from '@/components/Header';

export const metadata = {
  title: 'Privacy Policy – Coffez',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-amber-50/30">
      <Header />

      <main className="max-w-2xl mx-auto px-5 py-10 space-y-8 text-stone-700">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 mb-1">Privacy Policy</h1>
          <p className="text-xs text-stone-400">Last updated: April 2026</p>
        </div>

        <p className="text-sm leading-relaxed">
          Coffez ("we", "us", or "our") operates the Coffez platform — a marketplace connecting home coffee sellers with local buyers. This Privacy Policy explains how we collect, use, and protect your personal information.
        </p>

        <section className="space-y-2">
          <h2 className="font-semibold text-stone-900">1. Information We Collect</h2>
          <ul className="text-sm leading-relaxed list-disc list-inside space-y-1 text-stone-600">
            <li><strong>Account information:</strong> full name, email address, and password (stored as a secure hash)</li>
            <li><strong>Google sign-in:</strong> name, email, and Google account ID if you log in via Google</li>
            <li><strong>Seller information:</strong> phone number, city, street address, shop description, and payment tip details (Bit / PayPal)</li>
            <li><strong>Order information:</strong> items ordered, order status, timestamps, and any notes attached to an order</li>
            <li><strong>Device information:</strong> push notification tokens for order updates (optional)</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-stone-900">2. How We Use Your Information</h2>
          <ul className="text-sm leading-relaxed list-disc list-inside space-y-1 text-stone-600">
            <li>To create and manage your account</li>
            <li>To process and display orders between buyers and sellers</li>
            <li>To send transactional emails (order updates, account verification, seller approval)</li>
            <li>To send push notifications about order status changes</li>
            <li>To review and approve seller applications</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-stone-900">3. Third-Party Services</h2>
          <p className="text-sm leading-relaxed text-stone-600">We use the following third-party services to operate the platform:</p>
          <ul className="text-sm leading-relaxed list-disc list-inside space-y-1 text-stone-600">
            <li><strong>Vercel</strong> — hosting and deployment</li>
            <li><strong>Neon</strong> — secure database storage</li>
            <li><strong>Resend</strong> — transactional email delivery</li>
            <li><strong>Google OAuth</strong> — optional sign-in via Google account</li>
          </ul>
          <p className="text-sm leading-relaxed text-stone-600">We do not sell your personal information to any third party.</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-stone-900">4. Data Retention</h2>
          <p className="text-sm leading-relaxed text-stone-600">
            We retain your data for as long as your account is active. If you request account deletion, we will remove your personal data within 30 days, except where retention is required by law.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-stone-900">5. Cookies & Tokens</h2>
          <p className="text-sm leading-relaxed text-stone-600">
            We use HTTP-only cookies to store secure refresh tokens for authentication. These are not accessible by JavaScript and are used solely to keep you logged in. We do not use advertising or tracking cookies.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-stone-900">6. Your Rights</h2>
          <p className="text-sm leading-relaxed text-stone-600">You have the right to:</p>
          <ul className="text-sm leading-relaxed list-disc list-inside space-y-1 text-stone-600">
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your account and associated data</li>
            <li>Withdraw consent at any time</li>
          </ul>
          <p className="text-sm leading-relaxed text-stone-600">
            To exercise these rights, contact us at <a href="mailto:avivcoffez@gmail.com" className="text-amber-800 underline">avivcoffez@gmail.com</a>.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-stone-900">7. Children</h2>
          <p className="text-sm leading-relaxed text-stone-600">
            Coffez is not intended for users under the age of 18. We do not knowingly collect data from minors.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-stone-900">8. Changes to This Policy</h2>
          <p className="text-sm leading-relaxed text-stone-600">
            We may update this Privacy Policy from time to time. We will notify you of significant changes via email or an in-app notice.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-stone-900">9. Contact</h2>
          <p className="text-sm leading-relaxed text-stone-600">
            For any privacy-related questions, contact us at:{' '}
            <a href="mailto:avivcoffez@gmail.com" className="text-amber-800 underline">avivcoffez@gmail.com</a>
          </p>
        </section>
      </main>
    </div>
  );
}
