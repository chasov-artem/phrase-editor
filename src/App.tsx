import Footer from '@components/Layout/Footer'
import Header from '@components/Layout/Header'
import Metrics from '@features/Metrics/Metrics'
import OperationsPanel from '@features/Operations/OperationsPanel'
import TextEditor from '@features/TextEditor/TextEditor'

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <TextEditor />
            <OperationsPanel />
          </div>
          <div className="space-y-6">
            <Metrics />
            <section className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/80">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Result Area
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-300">
                Тут буде вивід оброблених фраз, графіки або превʼю результатів.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
