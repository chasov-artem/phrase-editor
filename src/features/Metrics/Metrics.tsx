import useStore from '@store/useStore'

export default function Metrics() {
  const { phrases, processedPhrases, history, historyIndex } = useStore()

  return (
    <section className="space-y-3 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/80">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
          Метрики
        </p>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Показники
        </h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-dashed border-slate-200/70 px-4 py-3 text-sm dark:border-slate-800/60">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
            Фраз у редакторі
          </p>
          <p className="text-2xl font-semibold text-slate-900 dark:text-white">{phrases.length}</p>
        </div>
        <div className="rounded-2xl border border-dashed border-slate-200/70 px-4 py-3 text-sm dark:border-slate-800/60">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
            Оброблені
          </p>
          <p className="text-2xl font-semibold text-slate-900 dark:text-white">{processedPhrases.length}</p>
        </div>
        <div className="rounded-2xl border border-dashed border-slate-200/70 px-4 py-3 text-sm dark:border-slate-800/60">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
            Історія
          </p>
          <p className="text-2xl font-semibold text-slate-900 dark:text-white">
            {historyIndex}/{history.length - 1}
          </p>
        </div>
      </div>
    </section>
  )
}
