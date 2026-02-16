import { useState } from 'react'
import { useJobStatus } from './hooks/useJobStatus'
import FileUpload from './components/FileUpload'
import Leaderboard from './components/Leaderboard'
import EdaReport from './components/EdaReport'
import './components/FileUpload.css'
import './App.css'

function App() {
  const [edaJobId, setEdaJobId] = useState(null)
  const [trainJobId, setTrainJobId] = useState(null)

  const edaJob = useJobStatus(edaJobId)
  const trainJob = useJobStatus(trainJobId)

  return (
    <div className="app">
      <h1>🤖 ML Buddy</h1>
      <p className="app-tagline">Your AI-powered Machine Learning Assistant</p>

      <FileUpload
        onEdaJobStart={setEdaJobId}
        onTrainJobStart={setTrainJobId}
      />

      {/* Job Status Indicators */}
      {edaJob && (
        <div className={`max-w-xl mx-auto mt-4 px-4 py-3 rounded-xl text-sm animate-[fadeIn_0.3s_ease] ${edaJob.status === 'processing' ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400' :
            edaJob.status === 'completed' ? 'bg-green-500/10 border border-green-500/30 text-green-400' :
              'bg-red-500/10 border border-red-500/30 text-red-400'
          }`}>
          {edaJob.status === 'processing' && '⏳ Generating EDA report... this may take a minute.'}
          {edaJob.status === 'completed' && '✅ EDA report ready!'}
          {edaJob.status === 'failed' && `❌ EDA failed: ${edaJob.error}`}
        </div>
      )}

      {trainJob && (
        <div className={`max-w-xl mx-auto mt-4 px-4 py-3 rounded-xl text-sm animate-[fadeIn_0.3s_ease] ${trainJob.status === 'processing' ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400' :
            trainJob.status === 'completed' ? 'bg-green-500/10 border border-green-500/30 text-green-400' :
              'bg-red-500/10 border border-red-500/30 text-red-400'
          }`}>
          {trainJob.status === 'processing' && '⏳ Training models... this may take several minutes.'}
          {trainJob.status === 'completed' && '✅ Model training complete!'}
          {trainJob.status === 'failed' && `❌ Training failed: ${trainJob.error}`}
        </div>
      )}

      {/* Results */}
      {edaJob?.status === 'completed' && edaJob.result && (
        <EdaReport reportUrl={edaJob.result.report_url} />
      )}

      {trainJob?.status === 'completed' && trainJob.result && (
        <Leaderboard data={trainJob.result} />
      )}
    </div>
  )
}

export default App
