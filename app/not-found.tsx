import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#1e1f22] flex items-center justify-center px-6">
      <div className="text-center max-w-xl">
        <h1 className="text-7xl font-extrabold text-indigo-400">404</h1>

        <h2 className="mt-6 text-3xl font-bold text-white">
          Page Not Found
        </h2>

        <p className="mt-4 text-gray-400">
          Sorry, the page you're looking for doesn't exist or may have been moved.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/"
            className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition hover:bg-indigo-500"
          >
            Go Home
          </Link>

          <Link
            href="/discussion"
            className="rounded-lg border border-gray-600 px-6 py-3 font-medium text-gray-300 transition hover:border-indigo-400 hover:text-white"
          >
            Discussion
          </Link>

          <Link
            href="/news"
            className="rounded-lg border border-gray-600 px-6 py-3 font-medium text-gray-300 transition hover:border-indigo-400 hover:text-white"
          >
            News
          </Link>
        </div>
      </div>
    </main>
  )
}