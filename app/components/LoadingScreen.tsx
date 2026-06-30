export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#1e1f22] flex items-center justify-center relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-5">
        <div className="w-20 h-20 rounded-full border-4 border-indigo-500/30 border-t-indigo-400 animate-spin flex items-center justify-center">
          <span className="text-xs font-extrabold tracking-tight">
            <span className="text-indigo-400">CEE</span>
            <span className="text-gray-300">prep</span>
          </span>
        </div>
      </div>
    </div>
  )
}