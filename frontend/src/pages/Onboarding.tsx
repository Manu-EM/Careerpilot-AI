import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Rocket, Upload, ChevronRight, ChevronLeft, Check, X,
  Plus, Loader, User, Mail, Phone, Briefcase,
  GraduationCap, Globe, GitBranch, Sparkles
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'

const API_URL = 'http://127.0.0.1:8000'

const steps = ['Profile', 'Skills', 'Preferences', 'Links', 'Done']

const suggestedSkills = [
  'React', 'TypeScript', 'JavaScript', 'Python', 'Node.js',
  'FastAPI', 'PostgreSQL', 'Docker', 'AWS', 'Tailwind CSS',
  'GraphQL', 'MongoDB', 'Redis', 'Git', 'Figma', 'Vue.js',
  'Angular', 'Next.js', 'Django', 'Flask', 'Java', 'Kotlin',
  'Swift', 'Flutter', 'React Native', 'C++', 'Go', 'Rust',
  'Machine Learning', 'Data Science', 'SQL', 'NoSQL', 'Linux',
]

const suggestedRoles = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'React Developer', 'UI Engineer', 'Software Engineer',
  'DevOps Engineer', 'Data Scientist', 'ML Engineer',
  'Product Manager', 'UI/UX Designer', 'Mobile Developer',
  'Cloud Engineer', 'Security Engineer', 'QA Engineer',
]

const suggestedLocations = [
  // Kerala cities first
  'Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur', 'Kannur',
  'Kollam', 'Palakkad', 'Malappuram',
  // Other India cities
  'Remote', 'Bangalore', 'Mumbai', 'Hyderabad', 'Chennai',
  'Pune', 'Delhi', 'Noida', 'Gurgaon', 'Kolkata', 'Ahmedabad',
  // International (few)
  'Singapore', 'Dubai', 'London', 'Remote (Worldwide)',
]

// Converts a number like 3 to the closest valid select option string
const toExpYearsOption = (years: number): string => {
  if (!years || years <= 0) return '0'
  if (years >= 10) return '10+'
  return String(Math.min(Math.round(years), 10))
}

export default function Onboarding() {
  const navigate     = useNavigate()
  const { user }     = useAuthStore()
  const [step, setStep] = useState(0)
  const [isSaving, setIsSaving]     = useState(false)
  const [isParsing, setIsParsing]   = useState(false)
  const [parseSuccess, setParseSuccess] = useState(false)
  const [parseError, setParseError]     = useState('')
  const [errors, setErrors]             = useState<string[]>([])
  const [aiFilled, setAiFilled]         = useState<Record<string, boolean>>({})

  // Profile fields
  const [name, setName]           = useState('')
  const [email, setEmail]         = useState('')
  const [phone, setPhone]         = useState('')
  const [jobTitle, setJobTitle]   = useState('')
  const [education, setEducation] = useState('')
  const [summary, setSummary]     = useState('')
  const [resumeText, setResumeText] = useState('')
  const [expYears, setExpYears]   = useState('')
  const [city, setCity]       = useState('')
  const [state, setState]     = useState('Kerala')
  const [country, setCountry] = useState('India')

  // Skills
  const [skills, setSkills]           = useState<string[]>([])
  const [skillInput, setSkillInput]   = useState('')
  const [skillSearch, setSkillSearch] = useState('')

  // Preferences
  const [roles, setRoles]         = useState<string[]>([])
  const [roleInput, setRoleInput] = useState('')
  const [locs, setLocs]           = useState<string[]>([])
  const [locInput, setLocInput]   = useState('')
  const [salary, setSalary]       = useState('')
  const [autoApply, setAutoApply] = useState(false)

  // Links
  const [linkedin, setLinkedin]   = useState('')
  const [github, setGithub]       = useState('')
  const [portfolio, setPortfolio] = useState('')

  // Auto-fill name and email from auth store
  useEffect(() => {
    if (user?.name)  setName(user.name)
    if (user?.email) setEmail(user.email)
  }, [user])

  const addItem = (item: string, list: string[], setList: (l: string[]) => void) => {
    const trimmed = item.trim()
    if (trimmed && !list.includes(trimmed)) setList([...list, trimmed])
  }

  const removeItem = (item: string, list: string[], setList: (l: string[]) => void) =>
    setList(list.filter(i => i !== item))

  const filteredSkills = suggestedSkills.filter(s =>
    s.toLowerCase().includes(skillSearch.toLowerCase()) && !skills.includes(s)
  )

  const markEdited = (field: string) =>
    setAiFilled(prev => ({ ...prev, [field]: false }))

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsParsing(true)
    setParseSuccess(false)
    setParseError('')
    setAiFilled({})

    const token = localStorage.getItem('access_token')

    try {
      // ── Step 1: Store the actual file in resume vault ──
      const uploadForm = new FormData()
      uploadForm.append('file', file)
      await fetch(`${API_URL}/api/v1/profile/upload-resume`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: uploadForm
      })

      // ── Step 2: Parse with AI ──
      const parseForm = new FormData()
      parseForm.append('file', file)

      const response = await fetch(`${API_URL}/api/v1/ai/parse-resume`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: parseForm
      })

      if (!response.ok) {
        const errText = await response.text()
        console.error('Parse error:', response.status, errText)
        setParseError(`Server error ${response.status}. File was saved but could not be parsed.`)
        setIsParsing(false)
        return
      }

      const result = await response.json()
      console.log('Parse result:', result)

      if (result.status === 'error') {
        setParseError(result.message || 'Could not parse resume')
        setIsParsing(false)
        return
      }

      const d = result.data
      console.log('Fields from Gemini:', {
      name: d.name,
      email: d.email,
      phone: d.phone,
      current_title: d.current_title,
      education: d.education,
      summary: d.summary,
      experience_years: d.experience_years,
      skills_count: d.skills?.length
      })
      if (!d) {
        setParseError('Unexpected response from server. Please try again.')
        setIsParsing(false)
        return
      }

      // ── Step 3: Auto-fill fields ──
      const filled: Record<string, boolean> = {}

      if (d.name && !user?.name)   { setName(d.name);                          filled.name     = true }
      if (d.email && !user?.email) { setEmail(d.email);                        filled.email    = true }
      if (d.phone)                 { setPhone(d.phone);                        filled.phone    = true }
      if (d.current_title)         { setJobTitle(d.current_title);             filled.jobTitle = true }
      if (d.education)             { setEducation(d.education);                filled.education = true }
      if (d.summary)               { setSummary(d.summary);                   filled.summary  = true }
      if (d.experience_years)      { setExpYears(toExpYearsOption(d.experience_years)); filled.expYears = true }
      if (d.skills?.length)        { setSkills(d.skills);                      filled.skills   = true }

      if (result.extracted_text)   { setResumeText(result.extracted_text) }

      setAiFilled(filled)
      setParseSuccess(true)

    } catch (err) {
      console.error('Resume upload error:', err)
      setParseError('Could not reach the server. Make sure the backend is running.')
    }

    setIsParsing(false)
  }

  const validateStep = (): boolean => {
    const errs: string[] = []
    if (step === 1 && skills.length < 5) errs.push('Please select at least 5 skills')
    if (step === 2 && roles.length < 3)  errs.push('Please select at least 3 preferred roles')
    if (step === 2 && locs.length < 1)   errs.push('Please select at least 1 preferred location')
    setErrors(errs)
    return errs.length === 0
  }

  const next = async () => {
    if (!validateStep()) return
    if (step < steps.length - 1) {
      setStep(step + 1)
      setErrors([])
    } else {
      setIsSaving(true)
      try {
        const token = localStorage.getItem('access_token')
        await fetch(`${API_URL}/api/v1/profile/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            job_title:           jobTitle,
            phone,
            resume_text:         resumeText,
            skills,
            preferred_roles:     roles,
            preferred_locations: locs,
            salary_range:        salary,
            auto_apply:          autoApply,
            experience_years:    parseInt(expYears) || 0,
            education,
            summary,
            linkedin_url:        linkedin,
            github_url:          github,
            portfolio_url:       portfolio,
            city,
            state,
            country,
          })
        })
      } catch (err) {
        console.error('Profile save error:', err)
      }
      setIsSaving(false)
      navigate('/app/dashboard')
    }
  }

  const prev = () => { setErrors([]); step > 0 && setStep(step - 1) }

  const inputClass = "w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
  const labelClass = "text-slate-300 text-sm font-medium mb-1.5 flex items-center gap-2"

  const AIBadge = () => (
    <span className="flex items-center gap-1 text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
      <Sparkles className="w-3 h-3" /> AI filled
    </span>
  )

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">

      {/* Top Nav */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold">CareerPilot AI</span>
        </div>
        <p className="text-slate-400 text-sm">Step {step + 1} of {steps.length}</p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 h-1">
        <div
          className="bg-blue-600 h-1 transition-all duration-500"
          style={{ width: `${((step + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* Step Tabs */}
      <div className="flex border-b border-slate-800 px-6">
        {steps.map((s, i) => (
          <div
            key={s}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              i === step
                ? 'border-blue-500 text-white'
                : i < step
                ? 'border-transparent text-green-400'
                : 'border-transparent text-slate-500'
            }`}
          >
            {i < step
              ? <Check className="w-4 h-4" />
              : <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-xs">{i + 1}</span>
            }
            <span className="hidden sm:block">{s}</span>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">

          {/* Validation Errors */}
          {errors.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
              {errors.map(e => (
                <p key={e} className="text-red-400 text-sm flex items-center gap-2">
                  <X className="w-4 h-4 flex-shrink-0" />{e}
                </p>
              ))}
            </div>
          )}

          {/* ── STEP 0: Profile ── */}
          {step === 0 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Your Profile</h2>
              <p className="text-slate-400 mb-8">
                Upload your resume and AI will fill everything automatically.
              </p>

              {/* Resume Upload */}
              <div className="mb-8">
                <label className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center gap-3 ${
                  isParsing    ? 'border-blue-500 bg-blue-500/5' :
                  parseSuccess ? 'border-green-500 bg-green-500/5' :
                  parseError   ? 'border-red-500 bg-red-500/5' :
                  'border-slate-700 hover:border-blue-500 hover:bg-blue-500/5'
                }`}>
                  {isParsing ? (
                    <>
                      <Loader className="w-10 h-10 text-blue-400 animate-spin" />
                      <p className="text-blue-400 font-medium">AI is reading your resume...</p>
                      <p className="text-slate-500 text-sm">Extracting skills, experience and details</p>
                    </>
                  ) : parseSuccess ? (
                    <>
                      <Check className="w-10 h-10 text-green-400" />
                      <p className="text-green-400 font-medium">Resume parsed successfully!</p>
                      <p className="text-slate-400 text-sm">All fields have been auto-filled. Review and edit below.</p>
                      <p className="text-slate-500 text-xs">Click to upload a different resume</p>
                    </>
                  ) : parseError ? (
                    <>
                      <X className="w-10 h-10 text-red-400" />
                      <p className="text-red-400 font-medium">Could not parse resume</p>
                      <p className="text-slate-400 text-sm">{parseError}</p>
                      <p className="text-slate-500 text-xs">Click to try again</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-slate-500" />
                      <p className="text-white font-medium">Upload Your Resume</p>
                      <p className="text-slate-400 text-sm">PDF, TXT, DOC — AI will extract all your details</p>
                      <span className="bg-blue-600 text-white text-xs px-4 py-1.5 rounded-full">
                        Choose File
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept=".pdf,.txt,.doc,.docx"
                    onChange={handleResumeUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Profile Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <label className={labelClass}>
                    Full Name {aiFilled.name && <AIBadge />}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" value={name}
                      onChange={e => { setName(e.target.value); markEdited('name') }}
                      placeholder="John Doe" className={`${inputClass} pl-10`} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="email" value={email} placeholder="john@email.com"
                      className={`${inputClass} pl-10 opacity-60 cursor-not-allowed`} readOnly />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>
                    Phone Number {aiFilled.phone && <AIBadge />}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="tel" value={phone}
                      onChange={e => { setPhone(e.target.value); markEdited('phone') }}
                      placeholder="+1 555 000 0000" className={`${inputClass} pl-10`} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>
                    Current Job Title {aiFilled.jobTitle && <AIBadge />}
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" value={jobTitle}
                      onChange={e => { setJobTitle(e.target.value); markEdited('jobTitle') }}
                      placeholder="Frontend Developer" className={`${inputClass} pl-10`} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>
                    Years of Experience {aiFilled.expYears && <AIBadge />}
                  </label>
                  <select value={expYears}
                    onChange={e => { setExpYears(e.target.value); markEdited('expYears') }}
                    className={inputClass}>
                    <option value="">Select years</option>
                    {['0','1','2','3','4','5','6','7','8','9','10','10+'].map(y => (
                      <option key={y} value={y}>{y} {y === '1' ? 'year' : 'years'}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    Education {aiFilled.education && <AIBadge />}
                  </label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" value={education}
                      onChange={e => { setEducation(e.target.value); markEdited('education') }}
                      placeholder="B.Tech Computer Science" className={`${inputClass} pl-10`} />
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="mt-4">
                <label className={labelClass}>
                  Professional Summary {aiFilled.summary && <AIBadge />}
                </label>
                <textarea value={summary}
                  onChange={e => { setSummary(e.target.value); markEdited('summary') }}
                  rows={3} placeholder="Brief professional summary..."
                  className={`${inputClass} resize-none`} />
              </div>

              {/* Location */}
              <div className="mt-4">
                <label className={labelClass}>Your Location</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <input
                      type="text"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      placeholder="City (e.g. Kochi)"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={state}
                      onChange={e => setState(e.target.value)}
                      placeholder="State (e.g. Kerala)"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={country}
                      onChange={e => setCountry(e.target.value)}
                      placeholder="Country (e.g. India)"
                      className={inputClass}
                    />
                  </div>
                </div>
                <p className="text-slate-500 text-xs mt-1.5">
                  Used to prioritise nearby jobs in search results
                </p>
              </div>
            </div>
          )}

          {/* ── STEP 1: Skills ── */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Your Skills</h2>
              <p className="text-slate-400 mb-8">
                Select or add your technical skills.
                <span className="text-amber-400"> Minimum 5 skills required.</span>
                {aiFilled.skills && (
                  <span className="ml-2 inline-flex items-center gap-1 text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                    <Sparkles className="w-3 h-3" /> Pre-filled from your resume
                  </span>
                )}
              </p>

              <div className="mb-6">
                <p className="text-slate-300 text-sm font-medium mb-3">
                  Selected Skills
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                    skills.length >= 5
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {skills.length}/5 minimum
                  </span>
                </p>
                <div className="min-h-16 bg-slate-800/50 border border-slate-700 rounded-xl p-3 flex flex-wrap gap-2">
                  {skills.length === 0 && <p className="text-slate-500 text-sm">No skills selected yet</p>}
                  {skills.map(skill => (
                    <span key={skill} className="flex items-center gap-1.5 bg-blue-600 text-white text-sm px-3 py-1 rounded-full">
                      {skill}
                      <button onClick={() => removeItem(skill, skills, setSkills)}>
                        <X className="w-3 h-3 hover:text-red-300" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 mb-4">
                <input type="text" placeholder="Type a skill and press Enter or +"
                  value={skillInput} onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { addItem(skillInput, skills, setSkills); setSkillInput('') }}}
                  className={inputClass} />
                <button onClick={() => { addItem(skillInput, skills, setSkills); setSkillInput('') }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-xl transition-colors">
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <input type="text" placeholder="Search suggested skills..."
                value={skillSearch} onChange={e => setSkillSearch(e.target.value)}
                className={`${inputClass} mb-4`} />

              <div>
                <p className="text-slate-400 text-sm mb-3">Suggested Skills</p>
                <div className="flex flex-wrap gap-2">
                  {filteredSkills.map(skill => (
                    <button key={skill} onClick={() => addItem(skill, skills, setSkills)}
                      className="bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white text-sm px-3 py-1.5 rounded-full transition-colors border border-slate-700 hover:border-blue-500">
                      + {skill}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Preferences ── */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Job Preferences</h2>
              <p className="text-slate-400 mb-8">
                Set your preferences.
                <span className="text-amber-400"> Minimum 3 roles and 1 location required.</span>
              </p>

              {/* Roles */}
              <div className="mb-8">
                <p className={labelClass}>
                  Preferred Roles
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                    roles.length >= 3 ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {roles.length}/3 minimum
                  </span>
                </p>
                <div className="min-h-12 bg-slate-800/50 border border-slate-700 rounded-xl p-3 flex flex-wrap gap-2 mb-3">
                  {roles.length === 0 && <p className="text-slate-500 text-sm">No roles selected</p>}
                  {roles.map(role => (
                    <span key={role} className="flex items-center gap-1.5 bg-blue-600 text-white text-sm px-3 py-1 rounded-full">
                      {role}
                      <button onClick={() => removeItem(role, roles, setRoles)}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 mb-3">
                  <input type="text" placeholder="Add custom role..." value={roleInput}
                    onChange={e => setRoleInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { addItem(roleInput, roles, setRoles); setRoleInput('') }}}
                    className={inputClass} />
                  <button onClick={() => { addItem(roleInput, roles, setRoles); setRoleInput('') }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-xl transition-colors">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestedRoles.filter(r => !roles.includes(r)).map(role => (
                    <button key={role} onClick={() => addItem(role, roles, setRoles)}
                      className="bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white text-sm px-3 py-1.5 rounded-full transition-colors border border-slate-700">
                      + {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Locations */}
              <div className="mb-8">
                <p className={labelClass}>Preferred Locations</p>
                <div className="min-h-12 bg-slate-800/50 border border-slate-700 rounded-xl p-3 flex flex-wrap gap-2 mb-3">
                  {locs.length === 0 && <p className="text-slate-500 text-sm">No locations selected</p>}
                  {locs.map(loc => (
                    <span key={loc} className="flex items-center gap-1.5 bg-purple-600 text-white text-sm px-3 py-1 rounded-full">
                      {loc}
                      <button onClick={() => removeItem(loc, locs, setLocs)}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 mb-3">
                  <input type="text" placeholder="Add custom location..." value={locInput}
                    onChange={e => setLocInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { addItem(locInput, locs, setLocs); setLocInput('') }}}
                    className={inputClass} />
                  <button onClick={() => { addItem(locInput, locs, setLocs); setLocInput('') }}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 rounded-xl transition-colors">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestedLocations.filter(l => !locs.includes(l)).map(loc => (
                    <button key={loc} onClick={() => addItem(loc, locs, setLocs)}
                      className="bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white text-sm px-3 py-1.5 rounded-full transition-colors border border-slate-700">
                      + {loc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Salary + Auto Apply */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Expected Salary</label>
                  <select value={salary} onChange={e => setSalary(e.target.value)} className={inputClass}>
                    <option value="">Select range</option>
                    <option>₹40k - ₹60k</option>
                    <option>₹60k - ₹80k</option>
                    <option>₹80k - ₹100k</option>
                    <option>₹100k - ₹130k</option>
                    <option>₹130k - ₹160k</option>
                    <option>₹160k+</option>
                  </select>
                </div>
                <div className="flex items-center justify-between bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                  <div>
                    <p className="text-white text-sm font-medium">Auto-Apply</p>
                    <p className="text-slate-400 text-xs mt-0.5">Apply when match &gt; 90%</p>
                  </div>
                  <button onClick={() => setAutoApply(!autoApply)}
                    className={`w-11 h-6 rounded-full relative transition-colors ${autoApply ? 'bg-blue-600' : 'bg-slate-600'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${autoApply ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: Links ── */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Professional Links</h2>
              <p className="text-slate-400 mb-8">Add your professional profiles. All optional but recommended.</p>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>LinkedIn Profile URL</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-blue-400">in</span>
                    <input type="url" value={linkedin} onChange={e => setLinkedin(e.target.value)}
                      placeholder="https://linkedin.com/in/yourname" className={`${inputClass} pl-10`} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>GitHub Profile URL</label>
                  <div className="relative">
                    <GitBranch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="url" value={github} onChange={e => setGithub(e.target.value)}
                      placeholder="https://github.com/yourusername" className={`${inputClass} pl-10`} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Portfolio / Website URL</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="url" value={portfolio} onChange={e => setPortfolio(e.target.value)}
                      placeholder="https://yourportfolio.com" className={`${inputClass} pl-10`} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 4: Done ── */}
          {step === 4 && (
            <div className="text-center py-8">
              <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-12 h-12 text-green-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">You're All Set!</h2>
              <p className="text-slate-400 text-lg mb-8">CareerPilot AI is ready to find your dream job.</p>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-left max-w-sm mx-auto space-y-3">
                {[
                  `Profile created for ${name || 'you'}`,
                  `${skills.length} skills added`,
                  `${roles.length} preferred roles set`,
                  `${locs.length} locations selected`,
                  resumeText ? 'Resume saved for AI matching' : 'No resume uploaded',
                  autoApply ? 'Auto-apply enabled' : 'Manual apply mode',
                ].map(item => (
                  <p key={item} className="text-slate-300 text-sm flex items-center gap-3">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0" />{item}
                  </p>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="border-t border-slate-800 px-6 py-4 bg-slate-950">
        <div className="max-w-3xl mx-auto flex gap-3">
          {step > 0 && (
            <button onClick={prev}
              className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-xl transition-colors">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          )}
          <button onClick={next} disabled={isSaving}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-medium py-3 px-8 rounded-xl transition-colors ml-auto">
            {isSaving ? (
              <><Loader className="w-4 h-4 animate-spin" /> Saving your profile...</>
            ) : step === steps.length - 1 ? (
              <><Rocket className="w-4 h-4" /> Launch CareerPilot AI</>
            ) : (
              <>Continue <ChevronRight className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </div>

    </div>
  )
}