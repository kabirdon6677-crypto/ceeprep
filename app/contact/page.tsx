export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#1e1f22] text-white px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-indigo-400">
          Contact
        </h1>

        <div className="space-y-6 text-gray-300 leading-8">
          <p>
            We'd love to hear your feedback, suggestions, or report any issues
            you encounter while using CEEprep.
          </p>

          <div className="bg-[#2b2d31] border border-gray-700 rounded-xl p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Contact Information
            </h2>

            <p>
              <strong>Email:</strong><br />
              yujaldhital@gmail.com
            </p>

            <p className="mt-4">
              We aim to respond to genuine inquiries as soon as possible.
            </p>
          </div>

          <p className="text-sm text-gray-500">
            Please do not send passwords or other sensitive personal information
            by email.
          </p>
        </div>
      </div>
    </main>
  )
}