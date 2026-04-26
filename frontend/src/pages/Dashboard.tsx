import { Briefcase, Send, BarChart3, TrendingUp, Clock, CheckCircle, XCircle, Star } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const stats = [
  { label: 'Jobs Matched',     value: '124',  icon: Briefcase,   color: 'text-blue-400',   bg: 'bg-blue-400/10'   },
  { label: 'Applications Sent', value: '38',  icon: Send,        color: 'text-green-400',  bg: 'bg-green-400/10'  },
  { label: 'Interviews',        value: '6',   icon: BarChart3,   color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { label: 'Response Rate',     value: '18%', icon: TrendingUp,  color: 'text-amber-400',  bg: 'bg-amber-400/10'  },
]

const recentJobs = [
  { title: 'Frontend Developer',     company: 'Google',    match: 94, status: 'Applied',   time: '2h ago'  },
  { title: 'React Engineer',         company: 'Spotify',   match: 88, status: 'Saved',     time: '5h ago'  },
  { title: 'UI Engineer',            company: 'Airbnb',    match: 82, status: 'Applied',   time: '1d ago'  },
  { title: 'Software Engineer',      company: 'Meta',      match: 76, status: 'Rejected',  time: '2d ago'  },
  { title: 'Full Stack Developer',   company: 'Stripe',    match: 91, status: 'Interview', time: '3d ago'  },
]

const activityData = [
  { day: 'Mon', applications: 4, matches: 12 },
  { day: 'Tue', applications: 7, matches: 18 },
  { day: 'Wed', applications: 3, matches: 9  },
  { day: 'Thu', applications: 8, matches: 22 },
  { day: 'Fri', applications: 5, matches: 15 },
  { day: 'Sat', applications: 2, matches: 7  },
  { day: 'Sun', applications: 6, matches: 19 },
]

const statusColor: Record<string, string> = {
  Applied:   'bg-blue-500/20 text-blue-400',
  Saved:     'bg-slate-500/20 text-slate-400',
  Interview: 'bg-purple-500/20 text-purple-400',
  Rejected:  'bg-red-500/20 text-red-400',
  Offer:     'bg-green-500/20 text-green-400',
}

const matchColor = (score: number) =>
  score >= 90 ? 'text-green-400' :
  score >= 75 ? 'text-amber-400' : 'text-red-400'

export default function Dashboard() {
  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 min-h-screen bg-slate-950">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          Good morning, Manu 👋
        </h1>
        <p className="text-slate-400 mt-1 text-sm md:text-base">
          Your AI agent found 12 new job matches overnight
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-slate-900 rounded-xl p-4 md:p-5 border border-slate-800">
            <div className={`${bg} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-2xl md:text-3xl font-bold text-white">{value}</p>
            <p className="text-slate-400 text-xs md:text-sm mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Chart + Recent Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Activity Chart */}
        <div className="lg:col-span-2 bg-slate-900 rounded-xl p-4 md:p-6 border border-slate-800">
          <h2 className="text-white font-semibold mb-4">Weekly Activity</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={activityData}>
              <defs>
                <linearGradient id="matchGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="appGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#f1f5f9' }}
              />
              <Area type="monotone" dataKey="matches"      stroke="#3b82f6" fill="url(#matchGrad)" strokeWidth={2} name="Matches" />
              <Area type="monotone" dataKey="applications" stroke="#22c55e" fill="url(#appGrad)"   strokeWidth={2} name="Applications" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"/>
              <span className="text-slate-400 text-xs">Matches</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"/>
              <span className="text-slate-400 text-xs">Applications</span>
            </div>
          </div>
        </div>

        {/* Agent Status */}
        <div className="bg-slate-900 rounded-xl p-4 md:p-6 border border-slate-800">
          <h2 className="text-white font-semibold mb-4">Agent Status</h2>
          <div className="space-y-3">
            {[
              { label: 'Search Agent',   status: 'Running',  icon: CheckCircle, color: 'text-green-400'  },
              { label: 'Match Agent',    status: 'Running',  icon: CheckCircle, color: 'text-green-400'  },
              { label: 'Resume Agent',   status: 'Idle',     icon: Clock,       color: 'text-amber-400'  },
              { label: 'Apply Agent',    status: 'Paused',   icon: XCircle,     color: 'text-red-400'    },
              { label: 'Track Agent',    status: 'Running',  icon: CheckCircle, color: 'text-green-400'  },
              { label: 'Optimize Agent', status: 'Running',  icon: CheckCircle, color: 'text-green-400'  },
            ].map(({ label, status, icon: Icon, color }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                <span className="text-slate-300 text-sm">{label}</span>
                <div className="flex items-center gap-1.5">
                  <Icon className={`w-4 h-4 ${color}`} />
                  <span className={`text-xs font-medium ${color}`}>{status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Jobs */}
      <div className="mt-6 bg-slate-900 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-800">
          <h2 className="text-white font-semibold">Recent Job Matches</h2>
          <button className="text-blue-400 text-sm hover:text-blue-300">View all</button>
        </div>
        <div className="divide-y divide-slate-800">
          {recentJobs.map((job) => (
            <div key={job.title + job.company} className="flex items-center justify-between p-4 md:p-5 hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-4 h-4 text-slate-300" />
                </div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium truncate">{job.title}</p>
                  <p className="text-slate-400 text-xs">{job.company} · {job.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                  <span className={`text-sm font-bold ${matchColor(job.match)}`}>{job.match}%</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium hidden sm:block ${statusColor[job.status]}`}>
                  {job.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}