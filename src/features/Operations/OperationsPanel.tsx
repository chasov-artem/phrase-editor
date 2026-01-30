import useStore from '@store/useStore'
import { SUPPORTED_OPERATIONS } from '@utils/constants'

export default function OperationsPanel() {
  const { currentOperation, addOperation } = useStore()

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/80">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
          Операції
        </p>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Панель дій
        </h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {SUPPORTED_OPERATIONS.map((operation) => (
          <button
            key={operation}
            onClick={() => addOperation(operation)}
            className="rounded-2xl border border-slate-200/70 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:border-accent hover:text-slate-900 dark:border-slate-800/60 dark:text-slate-200 dark:hover:border-accent dark:hover:text-white"
          >
            {operation}
          </button>
        ))}
      </div>
      {currentOperation && (
        <p className="text-sm text-slate-500 dark:text-slate-300">
          Поточна операція: <span className="font-semibold text-slate-900 dark:text-white">{currentOperation}</span>
        </p>
      )}
    </section>
  )
}
