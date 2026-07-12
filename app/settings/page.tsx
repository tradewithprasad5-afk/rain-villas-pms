export default function SettingsPage() {
  return (
    <div className="p-8">

      <h1 className="text-3xl font-bold mb-8">
        Company Information
      </h1>

      {/* Company Information */}

      <div className="bg-white rounded-xl shadow p-6 mb-8">

        <h2 className="text-xl font-semibold mb-6">
          Company Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          <div>

            <p className="text-sm text-gray-500 mb-2">
              Company Logo
            </p>

            <img
  src="/logo/rain-villa-logo.jpeg"
  alt="Rain Villa Logo"
  className="h-28 w-auto rounded-lg border bg-white p-2"
/>
          </div>

          <div className="space-y-5">

            <div>

              <p className="text-sm text-gray-500">
                Company Name
              </p>

              <p className="font-semibold text-lg">
                Rain Villa
              </p>

            </div>

            <div>

              <p className="text-sm text-gray-500">
                Website
              </p>

              <p className="font-semibold">
                www.rainvilla.in
              </p>

            </div>

            <div>

              <p className="text-sm text-gray-500">
                Email
              </p>

              <p className="font-semibold">
                rainvilla.igatpuri@gmail.com
              </p>

            </div>

            <div>

              <p className="text-sm text-gray-500">
                Phone
              </p>

              <p className="font-semibold">
                9923506006 / 9527249988
              </p>

            </div>

          </div>

        </div>

        <div className="mt-8">

          <p className="text-sm text-gray-500">
            Address
          </p>

          <p className="font-semibold leading-7">
            Ritiksha Homeland,
            <br />
            Plot No. 36,
            <br />
            Igatpuri - 422403,
            Maharashtra, India
          </p>

        </div>

      </div>

      {/* Bank Details */}

      <div className="bg-white rounded-xl shadow p-6 mb-8">

        <h2 className="text-xl font-semibold mb-6">
          Bank Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div>

            <p className="text-sm text-gray-500">
              Bank Name
            </p>

            <p className="font-semibold">
              Bank of Maharashtra
            </p>

          </div>

          <div>

            <p className="text-sm text-gray-500">
              Account Number
            </p>

            <p className="font-semibold">
              60582272804
            </p>

          </div>
                    <div>

            <p className="text-sm text-gray-500">
              IFSC Code
            </p>

            <p className="font-semibold">
              MAHB0000959
            </p>

          </div>

          <div>

            <p className="text-sm text-gray-500">
              UPI ID
            </p>

            <p className="font-semibold">
              To be created
            </p>

          </div>

        </div>

      </div>

      

      {/* Support */}

      <div className="bg-white rounded-xl shadow p-6">

        <h2 className="text-xl font-semibold mb-4">
          Support
        </h2>

        <p className="text-gray-700 mb-3">
  Rain Villa PMS has been developed exclusively for
  <strong> Rain Villa, Igatpuri.</strong>
</p>

<p className="text-gray-700">
  For technical support, system maintenance, or future
  enhancements, please contact the Rain Villa PMS
  administrator.
</p>

      </div>

    </div>
  );
}