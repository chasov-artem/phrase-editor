import Header from './components/Layout/Header'
import TextEditor from './features/TextEditor/TextEditor'
import Metrics from './features/Metrics/Metrics'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-7xl space-y-10">
        <section className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Редактор списку фраз
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Обробляйте до 10 000 рядків з підтримкою української мови та Unicode
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <TextEditor />

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Доступні операції
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  'Усі великі',
                  'Усі малі',
                  'Перше слово з великої',
                  'Додати +',
                  'Видалити +',
                  'Додати лапки',
                  'Обрізати пробіли',
                ].map((op) => (
                  <span
                    key={op}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                  >
                    {op}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Повна панель операцій буде додана наступним кроком
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <Metrics />

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Історія дій
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Доступні кроки:</span>
                  <span className="font-mono">0</span>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    disabled
                    className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                  >
                    ← Undo
                  </button>
                  <button
                    disabled
                    className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                  >
                    Redo →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-12 py-6 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div>
              <h4 className="font-medium text-gray-800 dark:text-white mb-2">
                Про інструмент
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Веб-інструмент для редагування списків фраз з підтримкою української мови
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 dark:text-white mb-2">
                Можливості
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                До 10 000 рядків • Unicode • Текстові трансформації • Undo/Redo
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 dark:text-white mb-2">
                Технології
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                React • TypeScript • Tailwind CSS • Zustand
              </p>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>© 2026 Редактор фраз • Підтримка української локалізації</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
