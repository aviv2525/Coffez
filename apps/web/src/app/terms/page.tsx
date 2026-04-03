import { Header } from '@/components/Header';

export const metadata = {
  title: 'Terms of Service – Coffez',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-amber-50/30">
      <Header />

      <main className="max-w-2xl mx-auto px-5 py-10 space-y-8 text-stone-700">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 mb-1">Terms of Service</h1>
          <p className="text-xs text-stone-400">Last updated: April 2026</p>
        </div>

        <p className="text-sm leading-relaxed">
          Welcome to Coffez. By creating an account or using our platform, you agree to these Terms of Service. Please read them carefully.
        </p>

        <section className="space-y-2">
          <h2 className="font-semibold text-stone-900">1. About Coffez</h2>
          <p className="text-sm leading-relaxed text-stone-600">
            Coffez is an online marketplace that connects home and small-business coffee sellers with local buyers. Coffez acts solely as a platform — we are not a party to any transaction between buyers and sellers, and we do not produce, handle, or deliver any food or beverage products.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-stone-900">2. Eligibility</h2>
          <p className="text-sm leading-relaxed text-stone-600">
            You must be at least 18 years old to use Coffez. By using the platform, you confirm that you meet this requirement.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-stone-900">3. Seller Responsibility</h2>
          <p className="text-sm leading-relaxed text-stone-600">
            Sellers are solely and fully responsible for:
          </p>
          <ul className="text-sm leading-relaxed list-disc list-inside space-y-1 text-stone-600">
            <li>The quality, safety, and legality of all products they sell</li>
            <li>Compliance with all applicable laws and regulations, including food safety standards set by the Israeli Ministry of Health</li>
            <li>Accurate descriptions of their products, ingredients, and allergens</li>
            <li>Fulfilling orders on time and as described</li>
          </ul>
          <p className="text-sm leading-relaxed text-stone-600">
            Coffez bears no responsibility for the quality, safety, or legality of any product sold through the platform.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-stone-900">4. Seller Approval</h2>
          <p className="text-sm leading-relaxed text-stone-600">
            Becoming a seller on Coffez requires submitting an application and receiving explicit approval from Coffez. We reserve the right to approve or reject any application at our sole discretion, and to revoke seller status at any time for violations of these terms.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-stone-900">5. Seller Tiers & Fees</h2>
          <ul className="text-sm leading-relaxed list-disc list-inside space-y-1 text-stone-600">
            <li><strong>Home Seller:</strong> Free for the first 50 orders. After 50 orders, a monthly subscription fee applies. Payments are tip-based (Bit / PayPal).</li>
            <li><strong>Business Seller:</strong> Monthly subscription fee applies from the start. Supports full payment processing.</li>
          </ul>
          <p className="text-sm leading-relaxed text-stone-600">
            Coffez reserves the right to change pricing with 30 days notice.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-stone-900">6. Orders & Cancellations</h2>
          <p className="text-sm leading-relaxed text-stone-600">
            Orders are agreements between the buyer and seller. Coffez does not guarantee fulfillment of any order. Cancellation and refund policies are the responsibility of the seller. Coffez may, at its discretion, mediate disputes between buyers and sellers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-stone-900">7. Prohibited Conduct</h2>
          <p className="text-sm leading-relaxed text-stone-600">You may not use Coffez to:</p>
          <ul className="text-sm leading-relaxed list-disc list-inside space-y-1 text-stone-600">
            <li>Sell illegal, unsafe, or misrepresented products</li>
            <li>Harass, defraud, or harm other users</li>
            <li>Attempt to access other users' accounts or data</li>
            <li>Use the platform for any purpose other than buying and selling coffee products</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-stone-900">8. Account Termination</h2>
          <p className="text-sm leading-relaxed text-stone-600">
            Coffez reserves the right to suspend or terminate any account that violates these terms, without prior notice. You may delete your account at any time by contacting us.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-stone-900">9. Limitation of Liability</h2>
          <p className="text-sm leading-relaxed text-stone-600">
            Coffez is provided "as is" without warranties of any kind. To the fullest extent permitted by law, Coffez shall not be liable for any indirect, incidental, or consequential damages arising from the use of the platform or any products purchased through it.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-stone-900">10. Governing Law</h2>
          <p className="text-sm leading-relaxed text-stone-600">
            These terms are governed by the laws of the State of Israel. Any disputes shall be resolved in the competent courts of Israel.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-stone-900">11. Changes to These Terms</h2>
          <p className="text-sm leading-relaxed text-stone-600">
            We may update these terms from time to time. Continued use of Coffez after changes are posted constitutes acceptance of the updated terms.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-stone-900">12. Contact</h2>
          <p className="text-sm leading-relaxed text-stone-600">
            For questions about these terms, contact us at:{' '}
            <a href="mailto:avivcoffez@gmail.com" className="text-amber-800 underline">avivcoffez@gmail.com</a>
          </p>
        </section>
      </main>
    </div>
  );
}
