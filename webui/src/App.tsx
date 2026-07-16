import { useState } from 'react'
import { Toaster } from 'sonner'
import { Sidebar } from '@/components/layout/Sidebar'
import { MainContent } from '@/components/layout/MainContent'
import { CrawlerConfigPanel } from '@/components/config/CrawlerConfigPanel'
import { CrawlerSearchHeader } from '@/components/config/CrawlerSearchHeader'
import { EnvironmentCheck, isEnvChecked } from '@/components/env/EnvironmentCheck'
import { ResultWorkbench } from '@/components/analytics/ResultWorkbench'

function App() {
  // Initialize by checking localStorage if env check has passed
  const [envChecked, setEnvChecked] = useState(() => isEnvChecked())
  const [activeView, setActiveView] = useState<'crawler' | 'results'>('crawler')

  const handleEnvCheckComplete = () => {
    setEnvChecked(true)
  }

  return (
    <div className="flex flex-col h-screen cyber-grid overflow-hidden relative">
      {/* Environment Check Modal */}
      {!envChecked && (
        <EnvironmentCheck onCheckComplete={handleEnvCheckComplete} />
      )}

      {/* Header Bar */}
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
      />

      {/* Main Area */}
      {activeView === 'crawler' ? (
        <div className="flex-1 flex flex-col gap-3 p-4 overflow-y-auto min-h-0">
          {/* Global targets and primary action */}
          <div className="flex-shrink-0">
            <CrawlerSearchHeader />
          </div>

          {/* One shared configuration for every selected platform */}
          <CrawlerConfigPanel />

          {/* Platform-specific status and logs */}
          <div className="flex-1 min-h-[300px]">
            <MainContent />
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-hidden pt-3">
          <ResultWorkbench />
        </div>
      )}

      {/* Toast notifications - Theme-aware style */}
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'glass-panel font-mono text-cyber-text-primary',
          style: {
            fontFamily: 'JetBrains Mono, monospace',
          },
        }}
      />
    </div>
  )
}

export default App
