import { useState, useEffect } from 'react'
import { Briefcase, Calendar, ExternalLink } from 'lucide-react'
import { API_URL } from '../config'

const columnColors: Record<string, string> = {
  Saved:      'border-slate-500',
  Applied:    'border-blue-500',
  Assessment: 'border-amber-500',
  Interview:  'border-purple-500',
  Offer:      'border-green-500',
  Rejected:   'border-red-500',
}

const tabActive: Record<string, string> = {
  Saved:      'bg-slate-500 text-white',
  Applied:    'bg-blue-500 text-white',
  Assessment: 'bg-amber-500 text-white',
  Interview:  'bg-purple-500 text-white',
  Offer:      'bg-green-500 text-white',
  Rejected:   'bg-red-500 text-white',
}

const badgeColor: Record<string, string> = {
  Saved:      'bg-slate-500',
  Applied:    'bg-blue-500',
  Assessment: 'bg-amber-500',
  Interview:  'bg-purple-500',
  Offer:      'bg-green-500',
  Rejected:   'bg-red-500',
}

const underlineColor: Record<string, string> = {
  Saved:      'bg-slate-400',
  Applied:    'bg-blue-500',
  Assessment: 'bg-amber-500',
  Interview:  'bg-purple-500',
  Offer:      'bg-green-500',
  Rejected:   'bg-red-500',
}

const STAGES = ['Saved', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected']

type Application = {
  id: string
  job_id: string
  status: string
  created_at: string
  job?: any
}

export default function Tracker() {
  const [applications, setApplications] = useState<Application[]>([])
  const [jobs, setJobs]                 = useState<Record<string, any>>({})
  const [isLoading, setIsLoading]       = useState(true)
  const [activeTab, setActiveTab]       = useState('Saved')
  const [desktopTab, setDesktopTab]     = useState('Saved')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [appRes, jobsRes] = await Promise.all([
        fetch(`${API_URL}/api/v1/applications/`),
        fetch(`${API_URL}/api/v1/scraper/jobs?limit=50&skip=0&min_score=0`)
      ])
      const appData  = await appRes.json()
      const jobsData = await jobsRes.json()

      if (Array.isArray(jobsData)) {
        const jobMap: Record<string, any> = {}
        jobsData.forEach((j: any) => { jobMap[j.id] = j })
        setJobs(jobMap)
      }
      if (Array.isArray(appData)) setApplications(appData)

    } catch(e) {
      console.log('Error loading data:', e)
    }
    setIsLoading(false)
  }

  const updateStatus = async (appId: string, newStatus: string) => {
    try {
      await fetch(`${API_URL}/api/v1/applications/${appId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      setApplications(prev =>
        prev.map(a => a.id === appId ? { ...a, status: newStatus } : a)
      )
    } catch(e) {
      console.log('Error updating status:', e)
    }
  }

  // Group applications by status
  const columns: Record<string, Application[]> = {}
  STAGES.forEach(stage => {
    columns[stage] = applications.filter(a => a.status === stage)
  })

  const total = applications.length

  const JobCard = ({ app }: { app: Application }) => {
    const job = jobs[app.job_id]
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 hover:border-slate-600 transition-all">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div>
              <p className="text-white text-xs font-semibold truncate max-w-32">
                {job?.title || 'Loading...'}
              </p>
              <p className="text-slate-400 text-xs">{job?.company || '...'}</p>
            </div>
          </div>
          {job?.source_url && (
            <a href={job.source_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 hover:text-blue-400" />
            </a>
          )}
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1 text-slate-500 text-xs">
            <Calendar className="w-3 h-3" />
            {new Date(app.created_at).toLocaleDateString()}
          </div>
          {/* Status Selector */}
          <select
            value={app.status}
            onChange={e => updateStatus(app.id, e.target.value)}
            className="text-xs bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-slate-300 focus:outline-none"
          >
            {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-950 min-h-screen">
      <div className="p-4 pb-28 md:p-8 md:pb-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Application Tracker</h1>
          <p className="text-slate-400 text-sm mt-1">
            {isLoading ? 'Loading...' : `${total} total applications tracked`}
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* ── MOBILE: Tab View ── */}
            <div className="md:hidden">
              <div className="grid grid-cols-3 gap-2 mb-4">
                {STAGES.map(col => (
                  <button
                    key={col}
                    onClick={() => setActiveTab(col)}
                    className={`flex flex-col items-center justify-center gap-1 py-3 rounded-xl text-xs font-medium transition-all border ${
                      activeTab === col
                        ? `${tabActive[col]} border-transparent`
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    <span className={`text-lg font-bold ${activeTab === col ? 'text-white' : 'text-slate-300'}`}>
                      {columns[col].length}
                    </span>
                    <span className="text-xs">{col}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                {columns[activeTab].length === 0 ? (
                  <div className="border-2 border-dashed border-slate-800 rounded-xl p-8 text-center">
                    <p className="text-slate-500 text-sm">No applications here yet</p>
                  </div>
                ) : (
                  columns[activeTab].map(app => <JobCard key={app.id} app={app} />)
                )}
              </div>
            </div>

            {/* ── DESKTOP: Tab + Grid ── */}
            <div className="hidden md:block">
              <div className="flex overflow-x-auto border-b border-slate-800 mb-6">
                {STAGES.map(col => (
                  <button
                    key={col}
                    onClick={() => setDesktopTab(col)}
                    className={`relative flex-shrink-0 flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all ${
                      desktopTab === col ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{col}</span>
                    <span className={`text-xs text-white font-bold w-5 h-5 rounded-full flex items-center justify-center ${badgeColor[col]}`}>
                      {columns[col].length}
                    </span>
                    {desktopTab === col && (
                      <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${underlineColor[col]}`} />
                    )}
                  </button>
                ))}
              </div>

              {columns[desktopTab].length === 0 ? (
                <div className="border-2 border-dashed border-slate-800 rounded-xl p-12 text-center">
                  <p className="text-slate-500 text-sm">No applications in this stage</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {columns[desktopTab].map(app => <JobCard key={app.id} app={app} />)}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}