interface PaymentHeaderProps {}

export default function PaymentHeader({}: PaymentHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold">
        Payments
      </h1>

      <p className="text-gray-500 mt-1">
        Receive and manage booking payments.
      </p>
    </div>
  );
}