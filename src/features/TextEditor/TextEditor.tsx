import { useEffect, useState } from 'react'
import useStore from '@store/useStore'

export default function TextEditor() {
  const { phrases, setPhrases } = useStore()
  const [draft, setDraft] = useState(phrases.join('\n'))

  useEffect(() => {
    setDraft(phrases.join('\n'))
  }, [phrases])

  const handleSave = () => {
    const parsed = draft
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)

    setPhrases(parsed)
  }

  return (
    <section className="space-y-3 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/80">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
          Вхідні дані
        </p>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Текстовий редактор
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Вставте кожну фразу з нового рядка, щоб підготувати список.
        </p>
      </div>
      <textarea
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        rows={8}
        className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm leading-6 text-slate-900 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
      />
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="rounded-xl bg-accent/90 px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent"
        >
          Зберегти список
        </button>
      </div>
    </section>
  )
}
