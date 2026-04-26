import { useState } from 'react'
import { Briefcase, MapPin, DollarSign, Star, CheckCircle, XCircle, Clock, Send } from 'lucide-react'

const queue = [
  { id: 1, title: 'Frontend Developer',   company: 'Google',  location: 'Remote',        salary: '$120k-$160k', match: 94, risk: 'Low',    time: '2h ago'  },
  { id: 2, title: 'React Engineer',       company: 'Spotify', location: 'New York',      salary: '$110k-$150k', match: 88, risk: 'Low',    time: '5h ago'  },
  { id: 3, title: 'UI Engineer',          company: 'Airbnb',  location: 'Remote',        salary: '$130k-$170k', match: 82, risk: 'Medium', time: '1d ago'  },
  { id: 4, title: 'Full Stack Developer', company: 'Stripe',  location: 'San Francisco', salary: '$140k-$180k', match: 91, risk: 'Low',    time: '1d ago'  },
  { id: 5, title: 'Software Engineer',    company: 'Notion',  location: 'Remote',        salary: '$100k-$140k', match: 79, risk: 'Medium', time: '2d ago'  },
]

const riskColor: Record<string, string> = {
  Low:    'text-green-400 bg-green-400/10',
  Medium: 'text-amber-400 bg-amber-400/10',
  High:   'text-red-400 bg-red-400/10',
}

const matchColor = (score: number) =>
  score >= 90 ? 'text-green-400' :
  score >= 80 ? 'text-amber-400' : 'text-red-400'

export default function ApplyQueue() {
  const [items, setItems] = useState(queue)
  const [applying, setApplying] = useState<number | null>(null)

  const approve = (id: number) => {
    setApplying(id)
    setTimeout(() => {
      setItems(prev => prev.filter(i => i.id !== id))
      setApplying(null)
    }, 1500)
  }

  const reject = (id: number) =>
    setItems(prev => prev.filter(i => i.id !== id))

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 min-h-screen bg-slate-950">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Apply Queue</h1>
        <p className="text-slate-400 text-sm mt-1">{items.length} applications waiting for your approval</p>
      </div>

      {/* Auto Apply Toggle */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6 flex items-center justify-between">
        <div>
          <p className="text-white font-medium text-sm">Autonomous Mode</p>
          <p className="text-slate-400 text-xs mt-0.5">Auto-apply when match score is above 90%</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-xs">Off</span>
          <div className="w-11 h-6 bg-slate-700 rounded-full relative cursor-pointer">
            <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform" />
          </div>
          <span className="text-slate-400 text-xs">On</span>
        </div>
      </div>

      {/* Queue Items */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <CheckCircle className="w-12 h-12 text-green-400 mb-4" />
          <h3 className="text-white font-semibold text-lg">All done!</h3>
          <p className="text-slate-400 text-sm mt-1">No applications waiting for approval</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(job => (
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
                        <MapPin className="w-3 h-3" />{job.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />{job.salary}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />{job.time}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scores */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400" />
                    <span className={`text-sm font-bold ${matchColor(job.match)}`}>{job.match}%</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${riskColor[job.risk]}`}>
                    {job.risk} Risk
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => approve(job.id)}
                  disabled={applying === job.id}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-70 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
                >
                  {applying === job.id ? (
                    <><Clock className="w-4 h-4 animate-spin" /> Applying...</>
                  ) : (
                    <><Send className="w-4 h-4" /> Approve & Apply</>
                  )}
                </button>
                <button
                  onClick={() => reject(job.id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-300 text-sm font-medium py-2.5 rounded-lg transition-colors"
                >
                  <XCircle className="w-4 h-4" /> Skip
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}