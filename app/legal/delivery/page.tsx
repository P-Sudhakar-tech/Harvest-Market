export const metadata = {
  title: "Delivery Policy — Harvest Market",
  description: "Harvest Market delivery policy covering serviceable areas, fees, and delivery slots.",
};

export default function DeliveryPolicyPage() {
  return (
    <div className="wrap">
      <h1>Delivery Policy</h1>
      <p className="muted">Effective date: October 2026</p>

      <h2>1. Serviceable areas</h2>
      <p>
        Delivery is available only within serviceable PIN codes configured by the administrator. Enter your PIN code
        at checkout to confirm availability.
      </p>

      <h2>2. Delivery fees</h2>
      <p>
        Delivery fees vary by PIN code and are displayed at checkout before you place your order. Some areas may
        qualify for free delivery based on order value or promotions.
      </p>

      <h2>3. Delivery slots</h2>
      <p>
        You may select a delivery slot at checkout, subject to availability. Delivery slots are assigned on a
        first-come, first-served basis.
      </p>

      <h2>4. Order cut-off times</h2>
      <p>
        Orders must be placed before the daily cut-off time to qualify for next-day or scheduled delivery. Cut-off
        times vary by area and are shown at checkout.
      </p>

      <h2>5. Delivery attempts</h2>
      <p>
        If delivery cannot be completed (e.g., no one available to receive), the order may be returned to the farmer
        or held for redelivery. Additional delivery fees may apply for redelivery.
      </p>

      <h2>6. Contact</h2>
      <p>
        For delivery questions, contact us at delivery@harvestmarket.example.
      </p>
    </div>
  );
}
