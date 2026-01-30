import { useEffect, useState } from 'react'

export default function Header() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg shadow-sm dark:bg-slate-900/80">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            Phrase Editor
          </p>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Редактор фраз
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-300">
            Сортуй, трансформуй та вимірюй списки фраз у реальному часі.
          </p>
        </div>
        <button
          onClick={() => setIsDark((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
        >
          {isDark ? 'Світла тема' : 'Темна тема'}
        </button>
      </div>
    </header>
  )
}
