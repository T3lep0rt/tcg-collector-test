import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          TCG Collector
        </h1>

        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="text-center">
            <button
              onClick={() => setCount((count) => count + 1)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Count is {count}
            </button>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              Edit <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">src/App.jsx</code> and save to test HMR
            </p>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-600 dark:text-gray-400">
          <p>Click on the Vite and React logos to learn more</p>
        </div>
      </div>
    </div>
  )
}

export default App
