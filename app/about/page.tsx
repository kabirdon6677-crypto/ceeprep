export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#1e1f22] text-white px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-indigo-400">
          About CEEprep
        </h1>

        <div className="space-y-6 text-gray-300 leading-8">
          <p>
            <strong className="text-white">CEEprep</strong> is a free online
            platform created to help students preparing for Nepal's Common
            Entrance Examination (CEE) for medical education.
          </p>

          <p>
            Our goal is to provide students with useful study tools, educational
            discussions, and important updates in one place.
          </p>

          <p>
            Current features include:
          </p>

          <ul className="list-disc ml-6 space-y-2">
            <li>Study Timer with study history</li>
            <li>CEE Discussion Forum</li>
            <li>Student News & Updates</li>
            <li>Anonymous participation for privacy</li>
          </ul>

          <p>
            CEEprep is continuously improving with new features to make CEE
            preparation easier and more effective for every student.
          </p>

          <p>
            Thank you for using CEEprep and best of luck with your medical
            entrance preparation.
          </p>
        </div>
      </div>
    </main>
  )
}
