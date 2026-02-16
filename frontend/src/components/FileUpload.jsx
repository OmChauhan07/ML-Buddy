import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

function FileUpload() {
    const [uploadStatus, setUploadStatus] = useState(null)
    const [fileName, setFileName] = useState(null)
    const [isUploading, setIsUploading] = useState(false)

    const onDrop = useCallback(async (acceptedFiles) => {
        if (acceptedFiles.length === 0) return

        const file = acceptedFiles[0]
        setFileName(file.name)
        setIsUploading(true)
        setUploadStatus(null)

        const formData = new FormData()
        formData.append('file', file)

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })

            if (response.ok) {
                const data = await response.json()
                setUploadStatus({ type: 'success', message: `File "${file.name}" uploaded successfully!` })
            } else {
                setUploadStatus({ type: 'error', message: `Upload failed: ${response.statusText}` })
            }
        } catch (error) {
            setUploadStatus({ type: 'error', message: `Upload failed: ${error.message}` })
        } finally {
            setIsUploading(false)
        }
    }, [])

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
                        <p>Uploading <strong>{fileName}</strong>...</p>
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
        </div>
    )
}

export default FileUpload
