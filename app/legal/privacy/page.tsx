export const metadata = {
  title: "Privacy Policy — Harvest Market",
  description: "Harvest Market privacy policy — how we collect, use, and protect your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="wrap">
      <h1>Privacy Policy</h1>
      <p className="muted">Effective date: October 2026</p>

      <h2>1. Information we collect</h2>
      <p>
        Harvest Market collects personal information you provide directly, such as your name, email address, phone
        number, delivery address, and payment details when you create an account or place an order. We also collect
        automatically generated information such as IP address, browser type, and usage data through cookies and similar
        technologies.
      </p>

      <h2>2. How we use your information</h2>
      <p>
        We use your information to process orders, manage your account, communicate about deliveries, improve our
        service, and comply with legal obligations. We do not sell your personal data to third parties.
      </p>

      <h2>3. Payment information</h2>
      <p>
        We do not store full payment card details. Payments are processed by Razorpay (or another supported provider)
        on their secure platform. Refer to their privacy policy for details on how they handle payment data.
      </p>

      <h2>4. Sharing and disclosure</h2>
      <p>
        We share information only with service providers necessary to operate the marketplace (e.g., delivery partners,
        payment providers, hosting). Farmers receive your delivery address and contact details only for orders placed
        with them.
      </p>

      <h2>5. Your rights</h2>
      <p>
        You may request access to, correction of, or deletion of your personal data by contacting us. We will respond
        within a reasonable timeframe and in accordance with applicable law.
      </p>

      <h2>6. Data retention</h2>
      <p>
        We retain personal data for as long as necessary to fulfill the purposes for which it was collected, including
        for legal, tax, and accounting purposes.
      </p>

      <h2>7. Security</h2>
      <p>
        We implement reasonable technical and organisational measures to protect your data. However, no method of
        transmission over the internet is 100% secure.
      </p>

      <h2>8. Contact</h2>
      <p>
        For questions about this privacy policy, contact us at privacy@harvestmarket.example.
      </p>
    </div>
  );
}
