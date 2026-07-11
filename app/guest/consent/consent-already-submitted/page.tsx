export default function ConsentAlreadySubmittedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white shadow-lg rounded-xl p-10 text-center max-w-md">
        <div className="text-6xl mb-4">✅</div>

        <h1 className="text-3xl font-bold text-green-700 mb-4">
          Consent Already Submitted
        </h1>

        <p className="text-gray-600">
          Thank you.
          <br />
          Your consent form has already been submitted.
          <br />
          No further action is required.
        </p>
      </div>
    </div>
  );
}