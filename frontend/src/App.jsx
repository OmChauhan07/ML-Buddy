import { useState } from 'react'
import { useJobStatus } from './hooks/useJobStatus'
import FileUpload from './components/FileUpload'
import Leaderboard from './components/Leaderboard'
import EdaReport from './components/EdaReport'
import './components/FileUpload.css'
import './components/Leaderboard.css'
import './components/EdaReport.css'
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
        <div className={`job-status ${edaJob.status}`}>
          {edaJob.status === 'processing' && '⏳ Generating EDA report... this may take a minute.'}
          {edaJob.status === 'completed' && '✅ EDA report ready!'}
          {edaJob.status === 'failed' && `❌ EDA failed: ${edaJob.error}`}
        </div>
      )}

      {trainJob && (
        <div className={`job-status ${trainJob.status}`}>
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
