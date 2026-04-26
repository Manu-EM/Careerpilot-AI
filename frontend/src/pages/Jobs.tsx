import { useState } from 'react'
import { Briefcase, MapPin, DollarSign, Clock, Star, Bookmark, ExternalLink, Search, Filter } from 'lucide-react'

const jobs = [
  { id: 1, title: 'Frontend Developer',   company: 'Google',    location: 'Remote',       salary: '$120k-$160k', match: 94, posted: '2h ago',  tags: ['React', 'TypeScript', 'GraphQL'],  saved: false },
  { id: 2, title: 'React Engineer',       company: 'Spotify',   location: 'New York',     salary: '$110k-$150k', match: 88, posted: '5h ago',  tags: ['React', 'Node.js', 'AWS'],         saved: true  },
  { id: 3, title: 'UI Engineer',          company: 'Airbnb',    location: 'Remote',       salary: '$130k-$170k', match: 82, posted: '1d ago',  tags: ['React', 'CSS', 'Figma'],           saved: false },
  { id: 4, title: 'Full Stack Developer', company: 'Stripe',    location: 'San Francisco', salary: '$140k-$180k', match: 91, posted: '1d ago',  tags: ['React', 'Python', 'PostgreSQL'],   saved: false },
  { id: 5, title: 'Software Engineer',    company: 'Notion',    location: 'Remote',       salary: '$100k-$140k', match: 79, posted: '2d ago',  tags: ['TypeScript', 'React', 'Node.js'],  saved: true  },
  { id: 6, title: 'React Native Dev',     company: 'Uber',      location: 'Chicago',      salary: '$115k-$155k', match: 85, posted: '2d ago',  tags: ['React Native', 'iOS', 'Android'], saved: false },
]

const matchColor = (score: number) =>
  score >= 90 ? 'text-green-400 bg-green-400/10' :
  score >= 80 ? 'text-amber-400 bg-amber-400/10' :
               'text-red-400 bg-red-400/10'

export default function Jobs() {
  const [search, setSearch] = useState('')
  const [savedJobs, setSavedJobs] = useState<number[]>(jobs.filter(j => j.saved).map(j => j.id))

  const filtered = jobs.filter(j =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.company.toLowerCase().includes(search.toLowerCase())
  )

  const toggleSave = (id: number) =>
    setSavedJobs(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 min-h-screen bg-slate-950">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Job Matches</h1>
        <p className="text-slate-400 text-sm mt-1">124 jobs matched to your profile</p>
      </div>

      {/* Search + Filter */}
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

      {/* Job Cards */}
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
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${matchColor(job.match)}`}>
                <Star className="w-3 h-3" />
                {job.match}% match
              </div>
            </div>

            {/* Details */}
            <div className="flex flex-wrap gap-3 mb-3 text-xs text-slate-400">
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />{job.location}
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" />{job.salary}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />{job.posted}
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {job.tags.map(tag => (
                <span key={tag} className="bg-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Quick Apply
              </button>
              <button
                onClick={() => toggleSave(job.id)}
                className={`p-2 rounded-lg border transition-colors ${
                  savedJobs.includes(job.id)
                    ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                    : 'border-slate-700 text-slate-400 hover:border-blue-500'
                }`}
              >
                <Bookmark className="w-4 h-4" />
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  )
}