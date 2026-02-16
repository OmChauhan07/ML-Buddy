import FileUpload from './components/FileUpload'
import './components/FileUpload.css'
import './App.css'

function App() {
  return (
    <div className="app">
      <h1>🤖 ML Buddy</h1>
      <p className="app-tagline">Your AI-powered Machine Learning Assistant</p>
      <FileUpload />
    </div>
  )
}

export default App
