import { useState, useEffect } from 'react'
import { Briefcase, MapPin, Star, CheckCircle, XCircle, Clock, Send } from 'lucide-react'
const API_URL = 'http://127.0.0.1:8000'


const riskColor: Record<string, string> = {
  Low:    'text-green-400 bg-green-400/10',
  Medium: 'text-amber-400 bg-amber-400/10',
  High:   'text-red-400 bg-red-400/10',
}

const matchColor = (score: number) =>
  score >= 70 ? 'text-green-400' :
  score >= 50 ? 'text-amber-400' : 'text-red-400'

const getRisk = (score: number) =>
  score >= 70 ? 'Low' : score >= 50 ? 'Medium' : 'High'

export default function ApplyQueue() {
  const [jobs, setJobs]           = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [applying, setApplying]   = useState<string | null>(null)
  const [autoApply, setAutoApply] = useState(false)
  const [applied, setApplied]     = useState<Set<string>>(new Set())
  const [saved, setSaved]         = useState<Set<string>>(new Set())
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [jobsRes, appsRes] = await Promise.all([
          fetch(`${API_URL}/api/v1/scraper/jobs?limit=20&skip=0&min_score=0`),
          fetch(`${API_URL}/api/v1/applications/`)
        ])
        const jobsData = await jobsRes.json()
        const appsData = await appsRes.json()

        if (Array.isArray(jobsData)) setJobs(jobsData)

        if (Array.isArray(appsData)) {
          // Mark already saved jobs
          const savedIds = new Set(
            appsData.map((a: any) => a.job_id)
          )
          // Mark already applied jobs
          const appliedIds = new Set(
            appsData
              .filter((a: any) => a.status === 'Applied')
              .map((a: any) => a.job_id)
          )
          setSaved(savedIds)
          setApplied(appliedIds)
          // Hide already applied jobs from queue
          setDismissed(appliedIds)
        }
      } catch(e) {
        console.log('Error loading:', e)
      }
      setIsLoading(false)
    }
    loadAll()
  }, [])

  const approve = async (job: any) => {
    if (applying || applied.has(job.id)) return
    setApplying(job.id)
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${API_URL}/api/v1/applications/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ job_id: job.id })
      })
      if (response.ok || response.status === 400) {
        setApplied(prev => new Set([...prev, job.id]))
        setDismissed(prev => new Set([...prev, job.id]))
      } else {
        alert('Failed to apply. Please try again.')
      }
    } catch(e) {
      console.log('Error:', e)
    }
    setApplying(null)
  }

  const saveJob = async (job: any) => {
    if (saved.has(job.id)) {
      // Unsave
      try {
        await fetch(`http://127.0.0.1:8000/api/v1/applications/job/${job.id}`, {
        method: 'DELETE'
      
        })
        setSaved(prev => {
          const next = new Set(prev)
          next.delete(job.id)
          return next
        })
      } catch(e) {
        console.log('Error unsaving:', e)
      }
    } else {
      // Save
      setSaved(prev => new Set([...prev, job.id]))
      try {
        const token = localStorage.getItem('access_token')
        const response = await fetch(`${API_URL}/api/v1/applications/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            job_id: job.id,
            notes: 'Saved for later'
          })
        })
        if (!response.ok && response.status !== 400) {
          setSaved(prev => {
            const next = new Set(prev)
            next.delete(job.id)
            return next
          })
        }
      } catch(e) {
        setSaved(prev => {
          const next = new Set(prev)
          next.delete(job.id)
          return next
        })
      }
    }
  }

  const skip = (id: string) => {
    if (applying === id) return
    setDismissed(prev => new Set([...prev, id]))
  }

  const visible = jobs.filter(j => !dismissed.has(j.id))

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 min-h-screen bg-slate-950">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Apply Queue</h1>
        <p className="text-slate-400 text-sm mt-1">
          {isLoading ? 'Loading...' : `${visible.length} applications waiting`}
        </p>
      </div>

      {/* Auto Apply Toggle */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6 flex items-center justify-between">
        <div>
          <p className="text-white font-medium text-sm">Autonomous Mode</p>
          <p className="text-slate-400 text-xs mt-0.5">Auto-apply when match score is above 70%</p>
        </div>
        <button
          onClick={() => setAutoApply(!autoApply)}
          className={`w-11 h-6 rounded-full relative transition-colors ${autoApply ? 'bg-blue-600' : 'bg-slate-700'}`}
        >
          <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${autoApply ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && visible.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <CheckCircle className="w-12 h-12 text-green-400 mb-4" />
          <h3 className="text-white font-semibold text-lg">All done!</h3>
          <p className="text-slate-400 text-sm mt-1">No applications waiting</p>
        </div>
      )}

      {/* Job Cards */}
      {!isLoading && (
        <div className="space-y-4">
          {visible.map(job => (
            <div key={job.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-5">
              <div className="flex items-start justify-between gap-4">

                {/* Job Info */}
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-5 h-5 text-slate-300" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-white font-semibold text-sm">{job.title}</h3>
                    <p className="text-slate-400 text-xs">{job.company}</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-400">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />{job.location || 'Remote'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scores */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400" />
                    <span className={`text-sm font-bold ${matchColor(job.match_score)}`}>
                      {job.match_score.toFixed(0)}%
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${riskColor[getRisk(job.match_score)]}`}>
                    {getRisk(job.match_score)} Risk
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => approve(job)}
                  disabled={applying !== null || applied.has(job.id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-70 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
                >
                  {applying === job.id ? (
                    <><Clock className="w-4 h-4 animate-spin" />Applying...</>
                  ) : (
                    <><Send className="w-4 h-4" />Apply</>
                  )}
                </button>
                <button
                  onClick={() => saveJob(job)}
                  disabled={applying !== null}
                  className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium py-2.5 rounded-lg transition-colors ${
                    saved.has(job.id)
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500'
                      : 'bg-slate-800 hover:bg-blue-500/20 hover:text-blue-400 text-slate-300'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  {saved.has(job.id) ? 'Unsave' : 'Save'}
                </button>
                <button
                  onClick={() => skip(job.id)}
                  disabled={applying === job.id}
                  className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 disabled:opacity-50 text-slate-300 text-sm font-medium py-2.5 px-3 rounded-lg transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}