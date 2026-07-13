export default function SettingsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">

      <h1 className="text-3xl font-bold mb-8">
        Company Information
      </h1>

      {/* Company Information */}

      <div className="bg-white rounded-xl shadow p-8 mb-8">

        <h2 className="text-2xl font-bold mb-8">
          Company Information
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Logo */}

          <div className="flex justify-center">

            <div className="bg-gray-50 border rounded-2xl p-8 shadow-sm">

              <img
                src="/logo/rain-villa-logo.jpeg"
                alt="Rain Villa Logo"
                className="h-64 w-auto object-contain"
              />

            </div>

          </div>

          {/* Company Details */}

          <div className="space-y-5">

            <div className="rounded-xl border bg-gray-50 p-4">

              <p className="text-xs uppercase tracking-wide text-gray-500">
                Company Name
              </p>

              <p className="mt-1 text-xl font-semibold">
                Rain Villa
              </p>

            </div>

            <div className="rounded-xl border bg-gray-50 p-4">

              <p className="text-xs uppercase tracking-wide text-gray-500">
                Website
              </p>

              <p className="mt-1 text-lg font-medium">
                www.rainvilla.in
              </p>

            </div>

            <div className="rounded-xl border bg-gray-50 p-4">

              <p className="text-xs uppercase tracking-wide text-gray-500">
                Email
              </p>

              <p className="mt-1 text-lg font-medium break-all">
                rainvilla.igatpuri@gmail.com
              </p>

            </div>

            <div className="rounded-xl border bg-gray-50 p-4">

              <p className="text-xs uppercase tracking-wide text-gray-500">
                Phone
              </p>

              <p className="mt-1 text-lg font-medium">
                9923506006 / 9527249988
              </p>

            </div>

          </div>

        </div>

        <div className="mt-10 border-t pt-8">

          <div className="rounded-xl border bg-gray-50 p-5">

            <p className="text-xs uppercase tracking-wide text-gray-500 mb-3">
              Address
            </p>

            <p className="text-lg font-medium leading-8">
              Ritiksha Homeland,
              <br />
              Plot No. 36,
              <br />
              Igatpuri – 422403,
              <br />
              Maharashtra, India
            </p>

          </div>

        </div>

      </div>

      {/* Bank Details */}

      <div className="bg-white rounded-xl shadow p-8 mb-8">

        <h2 className="text-2xl font-bold mb-8">
          Bank Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="rounded-xl border bg-gray-50 p-5">

            <p className="text-xs uppercase tracking-wide text-gray-500">
              Bank Name
            </p>

            <p className="mt-2 text-lg font-semibold">
              Bank of Maharashtra
            </p>

          </div>

          <div className="rounded-xl border bg-gray-50 p-5">

            <p className="text-xs uppercase tracking-wide text-gray-500">
              Account Number
            </p>

            <p className="mt-2 text-lg font-semibold">
              60582272804
            </p>

          </div>
                    <div className="rounded-xl border bg-gray-50 p-5">

            <p className="text-xs uppercase tracking-wide text-gray-500">
              IFSC Code
            </p>

            <p className="mt-2 text-lg font-semibold">
              MAHB0000959
            </p>

          </div>

          <div className="rounded-xl border bg-gray-50 p-5">

            <p className="text-xs uppercase tracking-wide text-gray-500">
              UPI ID
            </p>

            <p className="mt-2 text-lg font-semibold">
              Coming Soon
            </p>

          </div>

        </div>

      </div>

      {/* Support */}

      <div className="bg-white rounded-xl shadow p-8">

        <h2 className="text-2xl font-bold mb-6">
          Support
        </h2>

        <div className="rounded-xl border bg-blue-50 border-blue-200 p-6">

          <h3 className="text-xl font-semibold text-blue-900">
            Rain Villa PMS
          </h3>

          <p className="text-gray-700 mt-4 leading-7">
            This Property Management System has been developed
            exclusively for <strong>Rain Villa, Igatpuri</strong>
            to simplify reservations, guest management,
            payments, reports and daily operations.
          </p>

          <div className="mt-6 border-t pt-4">

            <p className="text-sm text-gray-600">
              <strong>Support:</strong> Please contact the
              Rain Villa PMS administrator for technical
              assistance, maintenance or future enhancements.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}