export default function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-white/80 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-800/60 dark:bg-slate-900/80 dark:text-slate-400">
      © {new Date().getFullYear()} Phrase Editor · Built with React, Vite і Tailwind
    </footer>
  )
}
