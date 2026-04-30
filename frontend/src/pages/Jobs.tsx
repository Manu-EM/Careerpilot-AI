import { useState, useEffect } from 'react'
import { Briefcase, MapPin, DollarSign, Clock, Star, Bookmark, ExternalLink, Search, Filter, RefreshCw } from 'lucide-react'

import { API_URL } from '../config'

const matchColor = (score: number) =>
  score >= 70 ? 'text-green-400 bg-green-400/10' :
  score >= 50 ? 'text-amber-400 bg-amber-400/10' :
               'text-red-400 bg-red-400/10'

export default function Jobs() {
  const [jobs, setJobs]           = useState<any[]>([])
  const [search, setSearch]       = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isScraping, setIsScraping] = useState(false)
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set())
  const [savingJob, setSavingJob] = useState<string | null>(null)

  const fetchJobs = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/v1/scraper/jobs?limit=50&skip=0&min_score=0`)
      const data = await response.json()
      if (Array.isArray(data)) setJobs(data)
    } catch(e) {
      console.log('Error fetching jobs:', e)
    }
    setIsLoading(false)
  }

  const scrapeNewJobs = async () => {
    setIsScraping(true)
    try {
      await fetch(`${API_URL}/api/v1/scraper/scrape-now`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywords: ['react', 'frontend', 'python', 'fullstack', 'engineer'],
          sources: ['greenhouse', 'lever', 'remoteok'],
          resume_text: 'Frontend Developer with React TypeScript Node.js experience'
        })
      })
      await fetchJobs()
    } catch(e) {
      console.log('Scraping error:', e)
    }
    setIsScraping(false)
  }

  useEffect(() => {
    const loadAll = async () => {
      await fetchJobs()
      try {
        const res = await fetch('http://127.0.0.1:8000/api/v1/applications/')
        const data = await res.json()
        if (Array.isArray(data)) {
          const savedIds = new Set(
            data.map((a: any) => a.job_id)
          )
          setSavedJobs(savedIds)
        }
      } catch(e) {
        console.log('Error loading saved:', e)
      }
    }
    loadAll()
  }, [])

  const filtered = jobs.filter(j =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.company.toLowerCase().includes(search.toLowerCase())
  )

  const toggleSave = async (job: any) => {
    if (savingJob === job.id) return

    setSavingJob(job.id)

    if (savedJobs.has(job.id)) {
      // Unsave
      try {
        await fetch(`http://127.0.0.1:8000/api/v1/applications/job/${job.id}`, {
          method: 'DELETE'
        })
        setSavedJobs(prev => {
          const next = new Set(prev)
          next.delete(job.id)
          return next
        })
      } catch(e) {
        console.log('Error unsaving:', e)
      }
    } else {
      // Save
      try {
        const token = localStorage.getItem('access_token')
        const response = await fetch('http://127.0.0.1:8000/api/v1/applications/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            job_id: job.id,
            notes: 'Saved from Jobs page'
          })
        })
        if (response.ok || response.status === 400) {
          setSavedJobs(prev => new Set([...prev, job.id]))
        }
      } catch(e) {
        console.log('Error saving:', e)
      }
    }
    setSavingJob(null)
  }



  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 min-h-screen bg-slate-950">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Job Matches</h1>
          <p className="text-slate-400 text-sm mt-1">
            {isLoading ? 'Loading...' : `${jobs.length} jobs matched to your profile`}
          </p>
        </div>
        <button
          onClick={scrapeNewJobs}
          disabled={isScraping}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isScraping ? 'animate-spin' : ''}`} />
          {isScraping ? 'Scraping...' : 'Find New Jobs'}
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search jobs or companies..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <button className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-300 text-sm hover:border-blue-500 transition-colors">
          <Filter className="w-4 h-4" />
          <span className="hidden sm:block">Filter</span>
        </button>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-5 animate-pulse">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-4 bg-slate-800 rounded mb-2 w-3/4" />
                  <div className="h-3 bg-slate-800 rounded w-1/4" />
                </div>
              </div>
              <div className="h-3 bg-slate-800 rounded mb-2 w-1/2" />
              <div className="h-8 bg-slate-800 rounded mt-4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(job => (
            <div key={job.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-blue-500/50 transition-all">

              {/* Top Row */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-5 h-5 text-slate-300" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm md:text-base">{job.title}</h3>
                    <p className="text-slate-400 text-xs">{job.company}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${matchColor(job.match_score)}`}>
                  <Star className="w-3 h-3" />
                  {job.match_score.toFixed(0)}%
                </div>
              </div>

              {/* Details */}
              <div className="flex flex-wrap gap-3 mb-3 text-xs text-slate-400">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />{job.location || 'Remote'}
                </div>
                {job.salary_min && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" />${job.salary_min}k-${job.salary_max}k
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(job.posted_at).toLocaleDateString()}
                </div>
              </div>

              {/* Source Badge */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-full capitalize">
                  {job.source}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                
                  <a href={job.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Apply Now
                </a>
                <button
                  onClick={() => toggleSave(job)}
                  disabled={savingJob === job.id}
                  className={`p-2 rounded-lg border transition-colors disabled:cursor-not-allowed ${
                    savedJobs.has(job.id)
                      ? 'border-blue-500 text-blue-400 bg-blue-500/10 hover:bg-red-500/10 hover:border-red-500 hover:text-red-400'
                      : savingJob === job.id
                      ? 'border-slate-600 text-slate-500'
                      : 'border-slate-700 text-slate-400 hover:border-blue-500'
                  }`}
                  title={savedJobs.has(job.id) ? 'Click to unsave' : 'Save job'}
                >
                  <Bookmark className={`w-4 h-4 ${savingJob === job.id ? 'animate-pulse' : ''}`} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-20">
          <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-white font-semibold">No jobs found</h3>
          <p className="text-slate-400 text-sm mt-1">Click "Find New Jobs" to scrape latest listings</p>
        </div>
      )}
    </div>
  )
}