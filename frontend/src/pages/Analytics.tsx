import { useEffect, useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'
import { TrendingUp, Send, BarChart3, Star } from 'lucide-react'
import { API_URL } from '../config'

const COLORS: Record<string, string> = {
  Saved:      '#64748b',
  Applied:    '#3b82f6',
  Assessment: '#f59e0b',
  Interview:  '#a855f7',
  Offer:      '#22c55e',
  Rejected:   '#ef4444',
}

const tooltipStyle = {
  contentStyle: { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' },
  labelStyle: { color: '#f1f5f9' },
}

const weeklyData = [
  { day: 'Mon', applications: 4, interviews: 1 },
  { day: 'Tue', applications: 7, interviews: 2 },
  { day: 'Wed', applications: 3, interviews: 0 },
  { day: 'Thu', applications: 8, interviews: 3 },
  { day: 'Fri', applications: 5, interviews: 1 },
  { day: 'Sat', applications: 2, interviews: 0 },
  { day: 'Sun', applications: 6, interviews: 2 },
]

export default function Analytics() {
  const [applications, setApplications] = useState<any[]>([])
  const [jobs, setJobs]                 = useState<any[]>([])
  const [isLoading, setIsLoading]       = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [appRes, jobRes] = await Promise.all([
          fetch(`${API_URL}/api/v1/applications/`),
          fetch(`${API_URL}/api/v1/scraper/jobs?limit=50&skip=0&min_score=0`)
        ])
        const appData = await appRes.json()
        const jobData = await jobRes.json()
        if (Array.isArray(appData)) setApplications(appData)
        if (Array.isArray(jobData)) setJobs(jobData)
      } catch(e) {
        console.log('Error loading analytics:', e)
      }
      setIsLoading(false)
    }
    loadData()
  }, [])

  // Calculate real stats
  const totalApplied    = applications.filter(a => a.status === 'Applied').length
  const totalInterviews = applications.filter(a => a.status === 'Interview').length
  const totalOffers     = applications.filter(a => a.status === 'Offer').length
  const responseRate    = applications.length > 0
    ? Math.round((totalInterviews / applications.length) * 100)
    : 0
  const avgMatchScore   = jobs.length > 0
    ? Math.round(jobs.reduce((sum, j) => sum + j.match_score, 0) / jobs.length)
    : 0

  const stats = [
    { label: 'Total Applied',   value: totalApplied.toString(),   icon: Send,       color: 'text-blue-400',   bg: 'bg-blue-400/10'   },
    { label: 'Response Rate',   value: `${responseRate}%`,        icon: TrendingUp, color: 'text-green-400',  bg: 'bg-green-400/10'  },
    { label: 'Interviews',      value: totalInterviews.toString(), icon: BarChart3,  color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: 'Avg Match Score', value: `${avgMatchScore}%`,       icon: Star,       color: 'text-amber-400',  bg: 'bg-amber-400/10'  },
  ]

  // Status breakdown for pie chart
  const statusCounts: Record<string, number> = {}
  applications.forEach(a => {
    statusCounts[a.status] = (statusCounts[a.status] || 0) + 1
  })
  const pieData = Object.entries(statusCounts).map(([name, value]) => ({
    name, value, color: COLORS[name] || '#64748b'
  }))

  // Top jobs for bar chart
  const resumeData = jobs.slice(0, 5).map(j => ({
    name: j.company,
    score: Math.round(j.match_score)
  }))

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 min-h-screen bg-slate-950">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Analytics</h1>
        <p className="text-slate-400 text-sm mt-1">Track your job search performance</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                <div className={`${bg} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-slate-400 text-xs mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

            {/* Weekly Activity */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h2 className="text-white font-semibold mb-4">Weekly Activity</h2>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="appGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="intGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#a855f7" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip {...tooltipStyle} />
                  <Area type="monotone" dataKey="applications" stroke="#3b82f6" fill="url(#appGrad)" strokeWidth={2} name="Applications" />
                  <Area type="monotone" dataKey="interviews"   stroke="#a855f7" fill="url(#intGrad)" strokeWidth={2} name="Interviews" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"/>
                  <span className="text-slate-400 text-xs">Applications</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"/>
                  <span className="text-slate-400 text-xs">Interviews</span>
                </div>
              </div>
            </div>

            {/* Status Pie */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h2 className="text-white font-semibold mb-4">Application Status</h2>
              {pieData.length === 0 ? (
                <div className="flex items-center justify-center h-40">
                  <p className="text-slate-500 text-sm">No applications yet</p>
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" strokeWidth={0}>
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip {...tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-2">
                    {pieData.map(({ name, value, color }) => (
                      <div key={name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                          <span className="text-slate-400 text-xs">{name}</span>
                        </div>
                        <span className="text-white text-xs font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Top Companies Match Score */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4">Top Companies by Match Score</h2>
            {resumeData.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">No jobs scraped yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={resumeData} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 11 }} width={60} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                    {resumeData.map((entry, i) => (
                      <Cell key={i} fill={entry.score >= 70 ? '#22c55e' : entry.score >= 50 ? '#f59e0b' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </div>
  )
}