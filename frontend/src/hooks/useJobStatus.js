import { useState, useEffect, useRef } from 'react'

/**
 * Polls GET /api/status/{jobId} every `interval` ms until status is
 * "completed" or "failed". Returns the current job state.
 */
export function useJobStatus(jobId, interval = 3000) {
    const [job, setJob] = useState(null)
    const timerRef = useRef(null)

    useEffect(() => {
        if (!jobId) {
            setJob(null)
            return
        }

        // Reset on new jobId
        setJob({ status: 'processing' })

        const poll = async () => {
            try {
                const res = await fetch(`/api/status/${jobId}`)
                if (res.ok) {
                    const data = await res.json()
                    setJob(data)

                    // Stop polling when done
                    if (data.status === 'completed' || data.status === 'failed') {
                        clearInterval(timerRef.current)
                        timerRef.current = null
                    }
                }
            } catch (err) {
                console.error('Polling error:', err)
            }
        }

        poll() // immediate first check
        timerRef.current = setInterval(poll, interval)

        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [jobId, interval])

    return job
}
