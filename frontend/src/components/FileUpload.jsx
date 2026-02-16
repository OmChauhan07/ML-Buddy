import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

function FileUpload({ onEdaJobStart, onTrainJobStart }) {
    const [uploadedFile, setUploadedFile] = useState(null)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadStatus, setUploadStatus] = useState(null)
    const [columns, setColumns] = useState([])
    const [targetColumn, setTargetColumn] = useState('')
    const [taskType, setTaskType] = useState('classification')
    const [isRunningEda, setIsRunningEda] = useState(false)
    const [isRunningTrain, setIsRunningTrain] = useState(false)

    const onDrop = useCallback(async (acceptedFiles) => {
        if (acceptedFiles.length === 0) return

        const file = acceptedFiles[0]
        setIsUploading(true)
        setUploadStatus(null)
        setUploadedFile(null)
        setColumns([])
        setTargetColumn('')

        const formData = new FormData()
        formData.append('file', file)

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })

            if (response.ok) {
                const data = await response.json()
                setUploadedFile(file)
                setUploadStatus({ type: 'success', message: `"${file.name}" uploaded successfully!` })

                // Populate columns from backend response
                if (data.columns && data.columns.length > 0) {
                    setColumns(data.columns)
                }
            } else {
                setUploadStatus({ type: 'error', message: `Upload failed: ${response.statusText}` })
            }
        } catch (error) {
            setUploadStatus({ type: 'error', message: `Upload failed: ${error.message}` })
        } finally {
            setIsUploading(false)
        }
    }, [])

    const handleRunEda = async () => {
        if (!uploadedFile) return
        setIsRunningEda(true)

        const formData = new FormData()
        formData.append('file', uploadedFile)

        try {
            const res = await fetch('/api/eda', { method: 'POST', body: formData })
            const data = await res.json()
            if (data.job_id) onEdaJobStart(data.job_id)
        } catch (err) {
            console.error('EDA start failed:', err)
        } finally {
            setIsRunningEda(false)
        }
    }

    const handleRunTrain = async () => {
        if (!uploadedFile || !targetColumn) return
        setIsRunningTrain(true)

        const formData = new FormData()
        formData.append('file', uploadedFile)
        formData.append('target', targetColumn)
        formData.append('task_type', taskType)

        try {
            const res = await fetch('/api/train', { method: 'POST', body: formData })
            const data = await res.json()
            if (data.job_id) onTrainJobStart(data.job_id)
        } catch (err) {
            console.error('Train start failed:', err)
        } finally {
            setIsRunningTrain(false)
        }
    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/csv': ['.csv'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls'],
        },
        maxFiles: 1,
    })

    return (
        <div className="file-upload-container">
            <h2>Upload Your Dataset</h2>
            <p className="upload-subtitle">Upload a CSV or Excel file to get started with ML analysis</p>

            <div
                {...getRootProps()}
                className={`dropzone ${isDragActive ? 'dropzone-active' : ''} ${isUploading ? 'dropzone-uploading' : ''}`}
            >
                <input {...getInputProps()} />
                <div className="dropzone-content">
                    <div className="dropzone-icon">
                        {isUploading ? '⏳' : isDragActive ? '📂' : '📁'}
                    </div>
                    {isUploading ? (
                        <p>Uploading <strong>{uploadedFile?.name}</strong>...</p>
                    ) : isDragActive ? (
                        <p>Drop your file here...</p>
                    ) : (
                        <>
                            <p><strong>Drag & drop</strong> your dataset here</p>
                            <p className="dropzone-hint">or click to browse files</p>
                            <p className="dropzone-formats">Supports: CSV, XLS, XLSX</p>
                        </>
                    )}
                </div>
            </div>

            {uploadStatus && (
                <div className={`upload-status ${uploadStatus.type}`}>
                    {uploadStatus.type === 'success' ? '✅' : '❌'} {uploadStatus.message}
                </div>
            )}

            {/* Action buttons — shown after file upload */}
            {uploadedFile && (
                <div className="actions-panel">
                    <button
                        className="action-btn eda-btn"
                        onClick={handleRunEda}
                        disabled={isRunningEda}
                    >
                        {isRunningEda ? '⏳ Starting...' : '📊 Run EDA Report'}
                    </button>

                    <div className="train-section">
                        <div className="train-inputs">
                            <select
                                value={targetColumn}
                                onChange={(e) => setTargetColumn(e.target.value)}
                                className="target-input"
                            >
                                <option value="">— Select target column —</option>
                                {columns.map((col) => (
                                    <option key={col.name} value={col.name}>
                                        {col.name} ({col.dtype})
                                    </option>
                                ))}
                            </select>
                            <select
                                value={taskType}
                                onChange={(e) => setTaskType(e.target.value)}
                                className="task-select"
                            >
                                <option value="classification">Classification</option>
                                <option value="regression">Regression</option>
                            </select>
                        </div>
                        <button
                            className="action-btn train-btn"
                            onClick={handleRunTrain}
                            disabled={isRunningTrain || !targetColumn}
                        >
                            {isRunningTrain ? '⏳ Starting...' : '🚀 Train Models'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default FileUpload
