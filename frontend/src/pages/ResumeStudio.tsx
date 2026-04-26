import { useState } from 'react'
import { FileText, Upload, Sparkles, Download, CheckCircle, AlertCircle } from 'lucide-react'

const resumes = [
  { id: 1, name: 'Frontend Developer Resume', job: 'Google - Frontend Dev',   score: 94, date: '2 hours ago',  status: 'optimized' },
  { id: 2, name: 'React Engineer Resume',     job: 'Spotify - React Engineer', score: 88, date: '5 hours ago',  status: 'optimized' },
  { id: 3, name: 'Base Resume',               job: 'General Purpose',          score: 72, date: '3 days ago',   status: 'needs-work' },
]

const skills = {
  matched:  ['React', 'TypeScript', 'Node.js', 'REST APIs', 'Git', 'Tailwind CSS'],
  missing:  ['GraphQL', 'AWS', 'Docker', 'Kubernetes'],
}

export default function ResumeStudio() {
  const [selected, setSelected] = useState(resumes[0])
  const [generating, setGenerating] = useState(false)

  const handleGenerate = () => {
    setGenerating(true)
    setTimeout(() => setGenerating(false), 2500)
  }

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 min-h-screen bg-slate-950">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Resume Studio</h1>
        <p className="text-slate-400 text-sm mt-1">AI tailored resumes for every job</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Resume List */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-slate-300 text-sm font-semibold uppercase tracking-wider mb-3">Your Resumes</h2>

          {resumes.map(resume => (
            <div
              key={resume.id}
              onClick={() => setSelected(resume)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selected.id === resume.id
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-slate-800 bg-slate-900 hover:border-slate-600'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <p className="text-white text-sm font-medium">{resume.name}</p>
                </div>
                {resume.status === 'optimized'
                  ? <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  : <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                }
              </div>
              <p className="text-slate-400 text-xs mb-2">{resume.job}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">{resume.date}</span>
                <span className={`text-xs font-bold ${
                  resume.score >= 90 ? 'text-green-400' :
                  resume.score >= 80 ? 'text-amber-400' : 'text-red-400'
                }`}>{resume.score}% ATS</span>
              </div>
            </div>
          ))}

          {/* Upload Button */}
          <button className="w-full border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl p-4 flex flex-col items-center gap-2 transition-colors group">
            <Upload className="w-5 h-5 text-slate-500 group-hover:text-blue-400" />
            <span className="text-slate-500 group-hover:text-blue-400 text-sm">Upload New Resume</span>
          </button>
        </div>

        {/* Resume Detail */}
        <div className="lg:col-span-2 space-y-4">

          {/* ATS Score */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold">{selected.name}</h2>
              <span className="text-slate-400 text-xs">{selected.job}</span>
            </div>

            {/* Score Bar */}
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-slate-400 text-sm">ATS Score</span>
                <span className={`text-sm font-bold ${
                  selected.score >= 90 ? 'text-green-400' :
                  selected.score >= 80 ? 'text-amber-400' : 'text-red-400'
                }`}>{selected.score}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    selected.score >= 90 ? 'bg-green-500' :
                    selected.score >= 80 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${selected.score}%` }}
                />
              </div>
            </div>

            {/* Skills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-green-400 text-xs font-semibold mb-2 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Matched Skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {skills.matched.map(s => (
                    <span key={s} className="bg-green-500/10 text-green-400 text-xs px-2.5 py-1 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-red-400 text-xs font-semibold mb-2 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Missing Skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {skills.missing.map(s => (
                    <span key={s} className="bg-red-500/10 text-red-400 text-xs px-2.5 py-1 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* AI Actions */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4">AI Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white text-sm font-medium py-3 rounded-lg transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                {generating ? 'Generating...' : 'Tailor for This Job'}
              </button>
              <button className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium py-3 rounded-lg transition-colors">
                <FileText className="w-4 h-4" />
                Generate Cover Letter
              </button>
              <button className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium py-3 rounded-lg transition-colors">
                <Sparkles className="w-4 h-4" />
                Optimize Keywords
              </button>
              <button className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium py-3 rounded-lg transition-colors">
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}