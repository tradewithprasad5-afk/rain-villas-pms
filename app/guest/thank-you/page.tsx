export default function ThankYouPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-6">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-lg p-10 text-center">
        <div className="text-6xl mb-6">✅</div>

        <h1 className="text-3xl font-bold text-green-700">
          Thank You!
        </h1>

        <p className="mt-4 text-gray-600">
          Your Guest Consent Form has been submitted successfully.
        </p>

        <p className="mt-2 text-gray-600">
          We look forward to welcoming you to The Rain Villa.
        </p>

        <div className="mt-8">
          <p className="text-sm text-gray-500">
            If you have any questions, please contact our team.
          </p>
        </div>
      </div>
    </div>
  );
}