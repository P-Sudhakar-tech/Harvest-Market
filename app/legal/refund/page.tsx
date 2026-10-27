export const metadata = {
  title: "Refund & Cancellation Policy — Harvest Market",
  description: "Harvest Market refund and cancellation policy for orders.",
};

export default function RefundPolicyPage() {
  return (
    <div className="wrap">
      <h1>Refund &amp; Cancellation Policy</h1>
      <p className="muted">Effective date: October 2026</p>

      <h2>1. Cancellations</h2>
      <p>
        You may cancel an order before it is marked as "Out for Delivery." Once an order is out for delivery,
        cancellation may not be possible and may be subject to a delivery fee.
      </p>

      <h2>2. Refunds</h2>
      <p>
        Refunds are issued to the original payment method. Approved refunds are typically processed within 5–10
        business days, depending on your payment provider.
      </p>

      <h2>3. Eligibility for refund</h2>
      <p>
        Refunds may be issued if:
        <ul>
          <li>The order is cancelled before fulfilment begins.</li>
          <li>Products are not delivered or are delivered in unsatisfactory condition.</li>
          <li>There is a duplicate or erroneous charge.</li>
        </ul>
      </p>

      <h2>4. Non-refundable</h2>
      <p>
        Delivery fees may be non-refundable if delivery was attempted. Perishable goods that have been delivered and
        accepted are generally not returnable unless there is a quality issue.
      </p>

      <h2>5. How to request a refund</h2>
      <p>
        Contact customer support with your order ID and reason for the request. We will review and respond within
        3 business days.
      </p>

      <h2>6. Contact</h2>
      <p>
        For refund or cancellation questions, contact us at support@harvestmarket.example.
      </p>
    </div>
  );
}
