export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#1e1f22] text-white px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-indigo-400">
          Privacy Policy
        </h1>

        <div className="space-y-6 text-gray-300 leading-8">
          <p>
            CEEprep respects your privacy. We collect only the information
            necessary to provide our services.
          </p>

          <h2 className="text-2xl font-semibold text-white">Information We Store</h2>

          <ul className="list-disc ml-6 space-y-2">
            <li>An anonymous browser ID stored in your browser.</li>
            <li>Posts, discussions, polls and study sessions you create.</li>
            <li>Images you upload to the platform.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-white">Cookies & Local Storage</h2>

          <p>
            CEEprep uses your browser's local storage to remember your anonymous
            identity and improve your experience.
          </p>

          <h2 className="text-2xl font-semibold text-white">Third-Party Services</h2>

          <p>
            We use Supabase for data storage. In the future, Google AdSense may
            display advertisements on this website.
          </p>

          <h2 className="text-2xl font-semibold text-white">Contact</h2>

          <p>
            If you have questions about this Privacy Policy, contact us at:
            <br />
            <strong>yujaldhital@gmail.com</strong>
          </p>
        </div>
      </div>
    </main>
  )
}