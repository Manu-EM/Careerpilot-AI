// import { useState } from 'react'
// import { Briefcase, Calendar, ExternalLink } from 'lucide-react'

// const initialColumns = {
//   Saved:      [
//     { id: 1, title: 'React Engineer',       company: 'Spotify', date: 'Jun 12', salary: '$110k-$150k' },
//     { id: 2, title: 'UI Engineer',          company: 'Airbnb',  date: 'Jun 11', salary: '$130k-$170k' },
//   ],
//   Applied:    [
//     { id: 3, title: 'Frontend Developer',   company: 'Google',  date: 'Jun 10', salary: '$120k-$160k' },
//     { id: 4, title: 'Full Stack Developer', company: 'Stripe',  date: 'Jun 9',  salary: '$140k-$180k' },
//   ],
//   Assessment: [
//     { id: 5, title: 'Software Engineer',    company: 'Notion',  date: 'Jun 8',  salary: '$100k-$140k' },
//   ],
//   Interview:  [
//     { id: 6, title: 'React Native Dev',     company: 'Uber',    date: 'Jun 7',  salary: '$115k-$155k' },
//   ],
//   Offer:      [
//     { id: 7, title: 'Senior Developer',     company: 'Netflix', date: 'Jun 5',  salary: '$160k-$200k' },
//   ],
//   Rejected:   [
//     { id: 8, title: 'Backend Engineer',     company: 'Meta',    date: 'Jun 3',  salary: '$130k-$170k' },
//   ],
// }

// const columnColors: Record<string, string> = {
//   Saved:      'border-slate-500',
//   Applied:    'border-blue-500',
//   Assessment: 'border-amber-500',
//   Interview:  'border-purple-500',
//   Offer:      'border-green-500',
//   Rejected:   'border-red-500',
// }

// const columnBadge: Record<string, string> = {
//   Saved:      'bg-slate-500/20 text-slate-400',
//   Applied:    'bg-blue-500/20 text-blue-400',
//   Assessment: 'bg-amber-500/20 text-amber-400',
//   Interview:  'bg-purple-500/20 text-purple-400',
//   Offer:      'bg-green-500/20 text-green-400',
//   Rejected:   'bg-red-500/20 text-red-400',
// }

// const tabActive: Record<string, string> = {
//   Saved:      'bg-slate-500 text-white',
//   Applied:    'bg-blue-500 text-white',
//   Assessment: 'bg-amber-500 text-white',
//   Interview:  'bg-purple-500 text-white',
//   Offer:      'bg-green-500 text-white',
//   Rejected:   'bg-red-500 text-white',
// }

// type Job = { id: number; title: string; company: string; date: string; salary: string }
// type Columns = Record<string, Job[]>

// export default function Tracker() {
//   const [columns, setColumns]       = useState<Columns>(initialColumns)
//   const [dragging, setDragging]     = useState<{ job: Job; from: string } | null>(null)
//   const [activeTab, setActiveTab]   = useState('Applied')

//   const onDragStart = (job: Job, from: string) => setDragging({ job, from })

//   const onDrop = (to: string) => {
//     if (!dragging || dragging.from === to) return
//     setColumns(prev => ({
//       ...prev,
//       [dragging.from]: prev[dragging.from].filter(j => j.id !== dragging.job.id),
//       [to]: [...prev[to], dragging.job],
//     }))
//     setDragging(null)
//   }

//   const total = Object.values(columns).flat().length

//   return (
//     <div className="p-4 md:p-8 pb-24 md:pb-8 min-h-screen bg-slate-950">

//       {/* Header */}
//       <div className="mb-6">
//         <h1 className="text-2xl md:text-3xl font-bold text-white">Application Tracker</h1>
//         <p className="text-slate-400 text-sm mt-1">{total} total applications tracked</p>
//       </div>

//       {/* ── MOBILE: Tab View ── */}
//       <div className="md:hidden">
//         {/* Tab Buttons */}
//         <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
//           {Object.keys(columns).map(col => (
//             <button
//               key={col}
//               onClick={() => setActiveTab(col)}
//               className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
//                 activeTab === col
//                   ? tabActive[col]
//                   : 'bg-slate-800 text-slate-400'
//               }`}
//             >
//               {col}
//               <span className="bg-white/20 px-1.5 rounded-full">{columns[col].length}</span>
//             </button>
//           ))}
//         </div>

//         {/* Active Tab Cards */}
//         <div className="space-y-3">
//           {columns[activeTab].length === 0 ? (
//             <div className="border-2 border-dashed border-slate-800 rounded-xl p-8 text-center">
//               <p className="text-slate-500 text-sm">No applications here yet</p>
//             </div>
//           ) : (
//             columns[activeTab].map(job => (
//               <div key={job.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
//                 <div className="flex items-start justify-between">
//                   <div className="flex items-center gap-3">
//                     <div className="w-9 h-9 rounded-lg bg-slate-700 flex items-center justify-center">
//                       <Briefcase className="w-4 h-4 text-slate-300" />
//                     </div>
//                     <div>
//                       <p className="text-white text-sm font-semibold">{job.title}</p>
//                       <p className="text-slate-400 text-xs">{job.company}</p>
//                     </div>
//                   </div>
//                   <ExternalLink className="w-4 h-4 text-slate-500" />
//                 </div>
//                 <div className="flex items-center justify-between mt-3">
//                   <div className="flex items-center gap-1 text-slate-500 text-xs">
//                     <Calendar className="w-3 h-3" />{job.date}
//                   </div>
//                   <span className="text-slate-400 text-xs">{job.salary}</span>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       </div>

//       {/* ── DESKTOP: Kanban Board ── */}
//       <div className="hidden md:flex gap-4 overflow-x-auto pb-4">
//         {Object.entries(columns).map(([col, jobs]) => (
//           <div
//             key={col}
//             onDragOver={e => e.preventDefault()}
//             onDrop={() => onDrop(col)}
//             className="flex-shrink-0 w-72"
//           >
//             <div className={`flex items-center justify-between mb-3 pb-3 border-b-2 ${columnColors[col]}`}>
//               <h3 className="text-white font-semibold text-sm">{col}</h3>
//               <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${columnBadge[col]}`}>
//                 {jobs.length}
//               </span>
//             </div>
//             <div className="space-y-3 min-h-24">
//               {jobs.map(job => (
//                 <div
//                   key={job.id}
//                   draggable
//                   onDragStart={() => onDragStart(job, col)}
//                   className="bg-slate-900 border border-slate-800 rounded-xl p-4 cursor-grab active:cursor-grabbing hover:border-slate-600 transition-all"
//                 >
//                   <div className="flex items-start justify-between mb-2">
//                     <div className="flex items-center gap-2">
//                       <div className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center">
//                         <Briefcase className="w-3.5 h-3.5 text-slate-300" />
//                       </div>
//                       <div>
//                         <p className="text-white text-xs font-semibold">{job.title}</p>
//                         <p className="text-slate-400 text-xs">{job.company}</p>
//                       </div>
//                     </div>
//                     <ExternalLink className="w-3.5 h-3.5 text-slate-500 hover:text-blue-400 cursor-pointer" />
//                   </div>
//                   <div className="flex items-center justify-between mt-3">
//                     <div className="flex items-center gap-1 text-slate-500 text-xs">
//                       <Calendar className="w-3 h-3" />{job.date}
//                     </div>
//                     <span className="text-slate-400 text-xs">{job.salary}</span>
//                   </div>
//                 </div>
//               ))}
//               {jobs.length === 0 && (
//                 <div className="border-2 border-dashed border-slate-800 rounded-xl p-4 text-center">
//                   <p className="text-slate-600 text-xs">Drop here</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         ))}
//       </div>

//     </div>
//   )
// }


import { useState } from 'react'
import { Briefcase, Calendar, ExternalLink } from 'lucide-react'

const initialColumns = {
  Saved:      [
    { id: 1, title: 'React Engineer',       company: 'Spotify', date: 'Jun 12', salary: '$110k-$150k' },
    { id: 2, title: 'UI Engineer',          company: 'Airbnb',  date: 'Jun 11', salary: '$130k-$170k' },
  ],
  Applied:    [
    { id: 3, title: 'Frontend Developer',   company: 'Google',  date: 'Jun 10', salary: '$120k-$160k' },
    { id: 4, title: 'Full Stack Developer', company: 'Stripe',  date: 'Jun 9',  salary: '$140k-$180k' },
  ],
  Assessment: [
    { id: 5, title: 'Software Engineer',    company: 'Notion',  date: 'Jun 8',  salary: '$100k-$140k' },
  ],
  Interview:  [
    { id: 6, title: 'React Native Dev',     company: 'Uber',    date: 'Jun 7',  salary: '$115k-$155k' },
  ],
  Offer:      [
    { id: 7, title: 'Senior Developer',     company: 'Netflix', date: 'Jun 5',  salary: '$160k-$200k' },
  ],
  Rejected:   [
    { id: 8, title: 'Backend Engineer',     company: 'Meta',    date: 'Jun 3',  salary: '$130k-$170k' },
  ],
}

const underlineColor: Record<string, string> = {
  Saved:      'bg-slate-400',
  Applied:    'bg-blue-500',
  Assessment: 'bg-amber-500',
  Interview:  'bg-purple-500',
  Offer:      'bg-green-500',
  Rejected:   'bg-red-500',
}

const badgeColor: Record<string, string> = {
  Saved:      'bg-slate-500',
  Applied:    'bg-blue-500',
  Assessment: 'bg-amber-500',
  Interview:  'bg-purple-500',
  Offer:      'bg-green-500',
  Rejected:   'bg-red-500',
}

const tabActive: Record<string, string> = {
  Saved:      'bg-slate-500 text-white',
  Applied:    'bg-blue-500 text-white',
  Assessment: 'bg-amber-500 text-white',
  Interview:  'bg-purple-500 text-white',
  Offer:      'bg-green-500 text-white',
  Rejected:   'bg-red-500 text-white',
}

type Job = { id: number; title: string; company: string; date: string; salary: string }
type Columns = Record<string, Job[]>

export default function Tracker() {
  const [columns, setColumns]       = useState<Columns>(initialColumns)
  const [dragging, setDragging]     = useState<{ job: Job; from: string } | null>(null)
  const [activeTab, setActiveTab]   = useState('Saved')
  const [desktopTab, setDesktopTab] = useState('Saved')

  const onDragStart = (job: Job, from: string) => setDragging({ job, from })

  const onDrop = (to: string) => {
    if (!dragging || dragging.from === to) return
    setColumns(prev => ({
      ...prev,
      [dragging.from]: prev[dragging.from].filter(j => j.id !== dragging.job.id),
      [to]: [...prev[to], dragging.job],
    }))
    setDragging(null)
  }

  const total = Object.values(columns).flat().length
  const desktopCards = columns[desktopTab] ?? []

  return (
    <div className="bg-slate-950 h-full">
      <div className="p-4 pb-20 md:p-8 md:pb-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Application Tracker</h1>
          <p className="text-slate-400 text-sm mt-1">{total} total applications tracked</p>
        </div>

        {/* ── MOBILE: Tab View ── */}
        <div className="md:hidden">
          {/* Tab Buttons */}
          {/* 2x3 Grid Stage Selector */}
<div className="grid grid-cols-3 gap-2 mb-4">
  {Object.keys(columns).map(col => (
    <button
      key={col}
      onClick={() => setActiveTab(col)}
      className={`flex flex-col items-center justify-center gap-1 py-3 rounded-xl text-xs font-medium transition-all border ${
        activeTab === col
          ? `${tabActive[col]} border-transparent`
          : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-600'
      }`}
    >
      <span className={`text-lg font-bold ${activeTab === col ? 'text-white' : 'text-slate-300'}`}>
        {columns[col].length}
      </span>
      <span className="text-xs">{col}</span>
    </button>
  ))}
</div>

          {/* Active Tab Cards */}
          <div className="space-y-2">
            {columns[activeTab].length === 0 ? (
              <div className="border-2 border-dashed border-slate-800 rounded-xl p-8 text-center">
                <p className="text-slate-500 text-sm">No applications here yet</p>
              </div>
            ) : (
              columns[activeTab].map(job => (
                <div key={job.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-700 flex items-center justify-center">
                        <Briefcase className="w-4 h-4 text-slate-300" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-semibold">{job.title}</p>
                        <p className="text-slate-400 text-xs">{job.company}</p>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1 text-slate-500 text-xs">
                      <Calendar className="w-3 h-3" />{job.date}
                    </div>
                    <span className="text-slate-400 text-xs">{job.salary}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── DESKTOP: Tab + Grid ── */}
        <div className="hidden md:block">

          {/* Desktop Stage Tabs */}
          <div className="flex overflow-x-auto border-b border-slate-800 mb-6 scrollbar-hide">
            {Object.keys(columns).map(col => (
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

          {/* Desktop Cards Grid */}
          {desktopCards.length === 0 ? (
            <div className="border-2 border-dashed border-slate-800 rounded-xl p-12 text-center">
              <p className="text-slate-500 text-sm">No applications in this stage</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {desktopCards.map(job => (
                <div
                  key={job.id}
                  draggable
                  onDragStart={() => onDragStart(job, desktopTab)}
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => onDrop(desktopTab)}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-600 transition-colors cursor-grab active:cursor-grabbing"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
                      <Briefcase className="w-4 h-4 text-slate-400" />
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-600 hover:text-slate-300 transition-colors" />
                  </div>
                  <p className="text-white font-semibold text-sm leading-tight">{job.title}</p>
                  <p className="text-slate-400 text-xs mt-0.5 mb-4">{job.company}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                      <Calendar className="w-3.5 h-3.5" />
                      {job.date}
                    </div>
                    <span className="text-slate-300 text-xs font-medium">{job.salary}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}