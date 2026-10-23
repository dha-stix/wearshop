const STEPS = ["Cart", "Delivery details", "Pay with Bachs"];

export default function CheckoutSteps({ current }) {
  return (
    <ol className="cart-steps" aria-label="Checkout progress">
      {STEPS.map((label, i) => (
        <li key={label} data-state={i < current ? "done" : i === current ? "now" : "next"} aria-current={i === current ? "step" : undefined}>
          <span>0{i + 1}</span>
          {label}
        </li>
      ))}
    </ol>
  );
}
