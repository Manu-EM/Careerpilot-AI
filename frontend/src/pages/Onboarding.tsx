import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Rocket, Upload, ChevronRight, ChevronLeft, Check } from 'lucide-react'

const steps = ['Profile', 'Skills', 'Preferences', 'Done']

const allSkills = ['React', 'TypeScript', 'JavaScript', 'Python', 'Node.js',
  'FastAPI', 'PostgreSQL', 'Docker', 'AWS', 'Tailwind CSS', 'GraphQL',
  'MongoDB', 'Redis', 'Git', 'Figma', 'Vue.js', 'Angular', 'Next.js']

const jobRoles = ['Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'React Developer', 'UI Engineer', 'Software Engineer', 'DevOps Engineer']

const locations = ['Remote', 'New York', 'San Francisco', 'London', 'Berlin', 'Singapore', 'Bangalore']

export default function Onboarding() {
  const navigate    = useNavigate()
  const [step, setStep] = useState(0)

  const [profile, setProfile] = useState({ name: '', email: '', title: '' })
  const [skills, setSkills]   = useState<string[]>([])
  const [roles, setRoles]     = useState<string[]>([])
  const [locs, setLocs]       = useState<string[]>([])
  const [salary, setSalary]   = useState('')
  const [autoApply, setAutoApply] = useState(false)

  const toggleItem = (item: string, list: string[], setList: (l: string[]) => void) =>
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item])

  const next = () => step < steps.length - 1 ? setStep(step + 1) : navigate('/dashboard')
  const prev = () => step > 0 && setStep(step - 1)

  return (
    <div className="h-screen bg-slate-950 flex items-center justify-center p-3 overflow-hidden">
    <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-4">
        <div className="bg-blue-600 p-1.5 rounded-xl">
            <Rocket className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-base font-bold text-white">CareerPilot AI</h1>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-4">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${
                i < step  ? 'bg-green-500 text-white' :
                i === step ? 'bg-blue-600 text-white' :
                             'bg-slate-800 text-slate-500'
              }`}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`mx-2 text-xs hidden sm:block ${i === step ? 'text-white' : 'text-slate-500'}`}>
                {s}
              </span>
              {i < steps.length - 1 && (
                <div className={`w-8 h-px mx-1 ${i < step ? 'bg-green-500' : 'bg-slate-700'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">

          {/* STEP 0 — Profile */}
          {step === 0 && (
            <div className="space-y-3">
                <h2 className="text-white font-semibold text-base">Tell us about yourself</h2>

              {/* Resume Upload */}
              <div className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer transition-colors group">
                <Upload className="w-8 h-8 text-slate-500 group-hover:text-blue-400 mx-auto mb-2" />
                <p className="text-slate-400 text-sm group-hover:text-blue-400">Upload your resume</p>
                <p className="text-slate-600 text-xs mt-1">PDF or DOCX — AI will parse it automatically</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-800" />
                <span className="text-slate-500 text-xs">or fill manually</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>

              {[
                { label: 'Full Name',        key: 'name',  placeholder: 'John Doe'              },
                { label: 'Email',            key: 'email', placeholder: 'john@email.com'         },
                { label: 'Current Job Title',key: 'title', placeholder: 'Frontend Developer'     },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="text-slate-300 text-sm font-medium mb-1.5 block">{label}</label>
                  <input
                    type="text"
                    placeholder={placeholder}
                    value={profile[key as keyof typeof profile]}
                    onChange={e => setProfile({ ...profile, [key]: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              ))}
            </div>
          )}

          {/* STEP 1 — Skills */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-white font-semibold text-base">Select your skills</h2>
              <p className="text-slate-400 text-sm">Pick all that apply — AI uses this to match jobs</p>
              <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
                {allSkills.map(skill => (
                  <button
                    key={skill}
                    onClick={() => toggleItem(skill, skills, setSkills)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      skills.includes(skill)
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {skills.includes(skill) && <Check className="w-3 h-3" />}
                    {skill}
                  </button>
                ))}
              </div>
              {skills.length > 0 && (
                <p className="text-blue-400 text-xs">{skills.length} skills selected</p>
              )}
            </div>
          )}

          {/* STEP 2 — Preferences */}
          {step === 2 && (
           <div className="space-y-3">
                <h2 className="text-white font-semibold text-base">Job Preferences</h2>

              {/* Roles */}
              <div>
                <label className="text-slate-300 text-sm font-medium mb-2 block">Preferred Roles</label>
                <div className="flex flex-wrap gap-2">
                  {jobRoles.map(role => (
                    <button
                      key={role}
                      onClick={() => toggleItem(role, roles, setRoles)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        roles.includes(role)
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Locations */}
              <div>
                <label className="text-slate-300 text-sm font-medium mb-2 block">Preferred Locations</label>
                <div className="flex flex-wrap gap-2">
                  {locations.map(loc => (
                    <button
                      key={loc}
                      onClick={() => toggleItem(loc, locs, setLocs)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        locs.includes(loc)
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Salary */}
              <div>
                <label className="text-slate-300 text-sm font-medium mb-1.5 block">Expected Salary</label>
                <select
                  value={salary}
                  onChange={e => setSalary(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select range</option>
                  <option>$60k - $80k</option>
                  <option>$80k - $100k</option>
                  <option>$100k - $130k</option>
                  <option>$130k - $160k</option>
                  <option>$160k+</option>
                </select>
              </div>

              {/* Auto Apply */}
              <div className="flex items-center justify-between bg-slate-800 rounded-xl p-4">
                <div>
                  <p className="text-white text-sm font-medium">Enable Auto-Apply</p>
                  <p className="text-slate-400 text-xs mt-0.5">AI applies when match score is above 90%</p>
                </div>
                <button
                  onClick={() => setAutoApply(!autoApply)}
                  className={`w-11 h-6 rounded-full relative transition-colors ${autoApply ? 'bg-blue-600' : 'bg-slate-600'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${autoApply ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 — Done */}
          {step === 3 && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-white font-bold text-lg">You're all set!</h2>
              <p className="text-slate-400 text-sm">
                CareerPilot AI is ready to find, match, and apply to jobs for you.
              </p>
              <div className="bg-slate-800 rounded-xl p-4 text-left space-y-2">
                <p className="text-slate-300 text-xs flex items-center gap-2"><Check className="w-3.5 h-3.5 text-green-400" /> Profile created</p>
                <p className="text-slate-300 text-xs flex items-center gap-2"><Check className="w-3.5 h-3.5 text-green-400" /> {skills.length} skills added</p>
                <p className="text-slate-300 text-xs flex items-center gap-2"><Check className="w-3.5 h-3.5 text-green-400" /> Job preferences saved</p>
                <p className="text-slate-300 text-xs flex items-center gap-2"><Check className="w-3.5 h-3.5 text-green-400" /> AI agents activated</p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-4">
            {step > 0 && (
              <button
                onClick={prev}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            )}
            <button
              onClick={next}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
            >
              {step === steps.length - 1 ? 'Go to Dashboard' : 'Continue'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}