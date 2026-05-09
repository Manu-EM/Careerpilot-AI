import { useState, useEffect } from 'react'
import {
  User, Mail, Phone, Briefcase, GraduationCap,
  Globe, GitBranch, Save, Upload, Loader, Check,
  X, Plus, KeyRound, Eye, EyeOff, Sparkles,
  AlertCircle, FileText, Star, Trash2
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'

const API_URL = 'http://127.0.0.1:8000'

const suggestedSkills = [
  'React', 'TypeScript', 'JavaScript', 'Python', 'Node.js',
  'FastAPI', 'PostgreSQL', 'Docker', 'AWS', 'Tailwind CSS',
  'GraphQL', 'MongoDB', 'Redis', 'Git', 'Figma', 'Vue.js',
  'Angular', 'Next.js', 'Django', 'Flask', 'Java', 'Go',
  'Machine Learning', 'Data Science', 'SQL', 'Linux',
]

const suggestedRoles = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'React Developer', 'Software Engineer', 'DevOps Engineer',
  'Data Scientist', 'ML Engineer', 'Product Manager',
  'UI/UX Designer', 'Mobile Developer', 'Cloud Engineer',
]

const suggestedLocations = [
  'Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur', 'Kannur',
  'Kollam', 'Palakkad', 'Malappuram',
  'Remote', 'Bangalore', 'Mumbai', 'Hyderabad', 'Chennai',
  'Pune', 'Delhi', 'Noida', 'Gurgaon', 'Kolkata', 'Ahmedabad',
  'Singapore', 'Dubai', 'London', 'Remote',
]

type Tab = 'personal' | 'skills' | 'preferences' | 'links' | 'resume' | 'password'

interface ResumeEntry {
  id: string
  filename: string
  uploaded_at: string
  file_size: number
  is_active: boolean
}

export default function Profile() {
  const { user } = useAuthStore()

  const [activeTab, setActiveTab]     = useState<Tab>('personal')
  const [isLoading, setIsLoading]     = useState(true)
  const [isSaving, setIsSaving]       = useState(false)
  const [isParsing, setIsParsing]     = useState(false)
  const [saveSuccess, setSaveSuccess] = useState('')
  const [saveError, setSaveError]     = useState('')

  // Personal
  const [name, setName]           = useState('')
  const [phone, setPhone]         = useState('')
  const [jobTitle, setJobTitle]   = useState('')
  const [education, setEducation] = useState('')
  const [summary, setSummary]     = useState('')
  const [expYears, setExpYears]   = useState('')
  const [city, setCity]       = useState('')
  const [state, setState]     = useState('')
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

  // Resume
  const [resumeText, setResumeText]   = useState('')
  const [parseSuccess, setParseSuccess] = useState(false)
  const [parseError, setParseError]   = useState('')
  const [aiFilled, setAiFilled]       = useState<Record<string, boolean>>({})

  // Resume vault
  const [resumes, setResumes]           = useState<ResumeEntry[]>([])
  const [resumesLoading, setResumesLoading] = useState(false)
  const [deletingId, setDeletingId]     = useState<string | null>(null)
  const [settingActiveId, setSettingActiveId] = useState<string | null>(null)

  // Password
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword]         = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPw, setShowCurrentPw]     = useState(false)
  const [showNewPw, setShowNewPw]             = useState(false)
  const [showConfirmPw, setShowConfirmPw]     = useState(false)
  const [passwordError, setPasswordError]     = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const token = localStorage.getItem('access_token')

  useEffect(() => {
    loadProfile()
    loadResumes()
  }, [])

  const loadProfile = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/v1/profile/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setName(user?.name || '')
        setPhone(data.phone || '')
        setJobTitle(data.job_title || '')
        setEducation(data.education || '')
        setSummary(data.summary || '')
        setExpYears(String(data.experience_years || ''))
        setCity(data.city || '')
        setState(data.state || '')
        setCountry(data.country || 'India')
        setSkills(data.skills || [])
        setRoles(data.preferred_roles || [])
        setLocs(data.preferred_locations || [])
        setSalary(data.salary_range || '')
        setAutoApply(data.auto_apply || false)
        setLinkedin(data.linkedin_url || '')
        setGithub(data.github_url || '')
        setPortfolio(data.portfolio_url || '')
        setResumeText(data.resume_text || '')
      }
    } catch (err) {
      console.error('Failed to load profile:', err)
    }
    setIsLoading(false)
  }

  const loadResumes = async () => {
    setResumesLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/v1/profile/resumes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setResumes(data)
      }
    } catch (err) {
      console.error('Failed to load resumes:', err)
    }
    setResumesLoading(false)
  }

  const saveProfile = async () => {
    setIsSaving(true)
    setSaveSuccess('')
    setSaveError('')
    try {
      const res = await fetch(`${API_URL}/api/v1/profile/`, {
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
      if (res.ok) {
        setSaveSuccess('Profile saved successfully!')
        setTimeout(() => setSaveSuccess(''), 3000)
      } else {
        setSaveError('Failed to save. Please try again.')
      }
    } catch (err) {
      setSaveError('Could not reach server.')
    }
    setIsSaving(false)
  }

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return

  if (resumes.length >= 10) {
    setParseError('You have reached the maximum of 10 saved resumes. Delete one to upload a new one.')
    return
  }

  setIsParsing(true)
  setParseSuccess(false)
  setParseError('')

  try {
    const uploadForm = new FormData()
    uploadForm.append('file', file)

    const res = await fetch(`${API_URL}/api/v1/profile/upload-resume`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: uploadForm
    })

    if (!res.ok) {
      setParseError(`Upload failed (${res.status}). Please try again.`)
      setIsParsing(false)
      return
    }

    setParseSuccess(true)
    await loadResumes()

  } catch (err) {
    setParseError('Upload failed. Check your connection.')
  }

  setIsParsing(false)
}

  const handleDeleteResume = async (id: string) => {
    setDeletingId(id)
    try {
      await fetch(`${API_URL}/api/v1/profile/resumes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      await loadResumes()
    } catch (err) {
      console.error('Delete failed:', err)
    }
    setDeletingId(null)
  }

  const handleSetActive = async (id: string) => {
    setSettingActiveId(id)
    try {
      await fetch(`${API_URL}/api/v1/profile/resumes/${id}/set-active`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      await loadResumes()
    } catch (err) {
      console.error('Set active failed:', err)
    }
    setSettingActiveId(null)
  }

  const handleDownloadResume = async (id: string, filename: string) => {
    const res = await fetch(`${API_URL}/api/v1/profile/resumes/${id}/download`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (res.ok) {
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('en-US', {
        day: 'numeric', month: 'short', year: 'numeric'
      })
    } catch { return iso }
  }

  const handleChangePassword = async () => {
    setPasswordError('')
    setPasswordSuccess(false)
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required.')
      return
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.')
      return
    }
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        })
      })
      if (res.ok) {
        setPasswordSuccess(true)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setTimeout(() => setPasswordSuccess(false), 3000)
      } else {
        const err = await res.json()
        setPasswordError(err.detail || 'Current password is incorrect.')
      }
    } catch {
      setPasswordError('Could not reach server.')
    }
  }

  const addItem = (item: string, list: string[], setList: (l: string[]) => void) => {
    const trimmed = item.trim()
    if (trimmed && !list.includes(trimmed)) setList([...list, trimmed])
  }

  const removeItem = (item: string, list: string[], setList: (l: string[]) => void) =>
    setList(list.filter(i => i !== item))

  const filteredSkills = suggestedSkills.filter(s =>
    s.toLowerCase().includes(skillSearch.toLowerCase()) && !skills.includes(s)
  )

  const inputClass = "w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
  const labelClass = "text-slate-300 text-sm font-medium mb-1.5 flex items-center gap-2"

  const AIBadge = () => (
    <span className="flex items-center gap-1 text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
      <Sparkles className="w-3 h-3" /> AI filled
    </span>
  )

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'personal',    label: 'Personal',    icon: User      },
    { id: 'skills',      label: 'Skills',      icon: Sparkles  },
    { id: 'preferences', label: 'Preferences', icon: Briefcase },
    { id: 'links',       label: 'Links',       icon: Globe     },
    { id: 'resume',      label: 'Resume',      icon: Upload    },
    { id: 'password',    label: 'Password',    icon: KeyRound  },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-8 h-8 text-blue-400 animate-spin" />
          <p className="text-slate-400 text-sm">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
              {(user?.name || name)?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{user?.name || name || 'Your Profile'}</h1>
              <p className="text-slate-400 text-sm">{user?.email}</p>
              {jobTitle && <p className="text-blue-400 text-sm mt-0.5">{jobTitle}</p>}
            </div>
          </div>
          <button
            onClick={saveProfile}
            disabled={isSaving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium px-5 py-2.5 rounded-xl transition-colors text-sm"
          >
            {isSaving
              ? <><Loader className="w-4 h-4 animate-spin" /> Saving...</>
              : <><Save className="w-4 h-4" /> Save Changes</>
            }
          </button>
        </div>

        {/* Save feedback */}
        {saveSuccess && (
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl px-4 py-3 mb-6 text-sm">
            <Check className="w-4 h-4 flex-shrink-0" /> {saveSuccess}
          </div>
        )}
        {saveError && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 mb-6 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {saveError}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-2xl p-1.5 mb-6 overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex-1 justify-center ${
                activeTab === id
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

          {/* ── PERSONAL ── */}
          {activeTab === 'personal' && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-6">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}><User className="w-4 h-4" /> Full Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="John Doe" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}><Mail className="w-4 h-4" /> Email</label>
                  <input type="email" value={user?.email || ''}
                    className={`${inputClass} opacity-60 cursor-not-allowed`} readOnly />
                  <p className="text-slate-500 text-xs mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className={labelClass}>
                    <Phone className="w-4 h-4" /> Phone Number
                    {aiFilled.phone && <AIBadge />}
                  </label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="+1 555 000 0000" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>
                    <Briefcase className="w-4 h-4" /> Job Title
                    {aiFilled.jobTitle && <AIBadge />}
                  </label>
                  <input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)}
                    placeholder="Frontend Developer" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>
                    <GraduationCap className="w-4 h-4" /> Education
                    {aiFilled.education && <AIBadge />}
                  </label>
                  <input type="text" value={education} onChange={e => setEducation(e.target.value)}
                    placeholder="B.Tech Computer Science" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>
                    Years of Experience {aiFilled.expYears && <AIBadge />}
                  </label>
                  <select value={expYears} onChange={e => setExpYears(e.target.value)} className={inputClass}>
                    <option value="">Select years</option>
                    {['0','1','2','3','4','5','6','7','8','9','10','10+'].map(y => (
                      <option key={y} value={y}>{y} {y === '1' ? 'year' : 'years'}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>
                    Professional Summary {aiFilled.summary && <AIBadge />}
                  </label>
                  <textarea value={summary} onChange={e => setSummary(e.target.value)}
                    rows={4} placeholder="Brief professional summary..."
                    className={`${inputClass} resize-none`} />
                </div>
                
                {/* Location */}
                <div className="md:col-span-2">
                  <label className={labelClass}>Your Location</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      placeholder="City (e.g. Kochi)"
                      className={inputClass}
                    />
                    <input
                      type="text"
                      value={state}
                      onChange={e => setState(e.target.value)}
                      placeholder="State (e.g. Kerala)"
                      className={inputClass}
                    />
                    <input
                      type="text"
                      value={country}
                      onChange={e => setCountry(e.target.value)}
                      placeholder="Country (e.g. India)"
                      className={inputClass}
                    />
                  </div>
                  <p className="text-slate-500 text-xs mt-1.5">
                    Jobs matching your location get a higher priority score
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* ── SKILLS ── */}
          {activeTab === 'skills' && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-2">Your Skills</h2>
              <p className="text-slate-400 text-sm mb-6">
                {aiFilled.skills
                  ? <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-blue-400">Skills were auto-filled from your resume.</span>
                    </span>
                  : 'Add your technical and professional skills.'
                }
              </p>
              <div className="mb-6">
                <p className="text-slate-300 text-sm font-medium mb-3">
                  Selected
                  <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                    {skills.length} skills
                  </span>
                </p>
                <div className="min-h-16 bg-slate-800/50 border border-slate-700 rounded-xl p-3 flex flex-wrap gap-2">
                  {skills.length === 0 && <p className="text-slate-500 text-sm">No skills added yet</p>}
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
                <input type="text" placeholder="Type a skill and press Enter" value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { addItem(skillInput, skills, setSkills); setSkillInput('') }}}
                  className={inputClass} />
                <button onClick={() => { addItem(skillInput, skills, setSkills); setSkillInput('') }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-xl transition-colors">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <input type="text" placeholder="Search suggested skills..." value={skillSearch}
                onChange={e => setSkillSearch(e.target.value)} className={`${inputClass} mb-4`} />
              <div className="flex flex-wrap gap-2">
                {filteredSkills.map(skill => (
                  <button key={skill} onClick={() => addItem(skill, skills, setSkills)}
                    className="bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white text-sm px-3 py-1.5 rounded-full transition-colors border border-slate-700">
                    + {skill}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── PREFERENCES ── */}
          {activeTab === 'preferences' && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-6">Job Preferences</h2>

              {/* Roles */}
              <div className="mb-8">
                <p className={labelClass}>Preferred Roles
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">{roles.length} selected</span>
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
                <p className={labelClass}>Preferred Locations
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">{locs.length} selected</span>
                </p>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Expected Salary</label>
                  <select value={salary} onChange={e => setSalary(e.target.value)} className={inputClass}>
                    <option value="">Select range</option>
                    <option>$40k - $60k</option>
                    <option>$60k - $80k</option>
                    <option>$80k - $100k</option>
                    <option>$100k - $130k</option>
                    <option>$130k - $160k</option>
                    <option>$160k+</option>
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

          {/* ── LINKS ── */}
          {activeTab === 'links' && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-6">Professional Links</h2>
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
                  <label className={labelClass}>Portfolio / Website</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="url" value={portfolio} onChange={e => setPortfolio(e.target.value)}
                      placeholder="https://yourportfolio.com" className={`${inputClass} pl-10`} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── RESUME ── */}
          {activeTab === 'resume' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-white">Resume Vault</h2>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  resumes.length >= 10
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-slate-700 text-slate-300'
                }`}>
                  {resumes.length}/10 resumes
                </span>
              </div>
              <p className="text-slate-400 text-sm mb-6">
                Store up to 10 resumes. The active one is used for AI matching and job applications.
              </p>

              {/* Upload area */}
              {resumes.length < 10 ? (
                <label className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center gap-3 mb-6 ${
                  isParsing    ? 'border-blue-500 bg-blue-500/5' :
                  parseSuccess ? 'border-green-500 bg-green-500/5' :
                  parseError   ? 'border-red-500/50 bg-red-500/5' :
                  'border-slate-700 hover:border-blue-500 hover:bg-blue-500/5'
                }`}>
                  {isParsing ? (
                    <>
                      <Loader className="w-10 h-10 text-blue-400 animate-spin" />
                      <p className="text-blue-400 font-medium">Uploading resume...</p>
                    </>
                  ) : parseSuccess ? (
                    <>
                      <Check className="w-10 h-10 text-green-400" />
                      <p className="text-green-400 font-medium">Resume uploaded successfully!</p>
                      <p className="text-slate-500 text-xs">Click here to upload another.</p>
                    </>
                  ) : parseError ? (
                    <>
                      <AlertCircle className="w-10 h-10 text-red-400" />
                      <p className="text-red-400 font-medium text-sm">{parseError}</p>
                      <p className="text-slate-500 text-xs">Click to try again</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-slate-500" />
                      <p className="text-white font-medium">Upload Resume</p>
                      <p className="text-slate-400 text-sm">PDF, TXT, DOC — stored in your resume vault</p>
                      <span className="bg-blue-600 text-white text-xs px-4 py-1.5 rounded-full">Choose File</span>
                    </>
                  )}
                  <input type="file" accept=".pdf,.txt,.doc,.docx" onChange={handleResumeUpload} className="hidden" />
                </label>
              ) : (
                <div className="border border-red-500/30 bg-red-500/5 rounded-2xl p-4 mb-6 text-center">
                  <p className="text-red-400 text-sm font-medium">Maximum 10 resumes reached</p>
                  <p className="text-slate-400 text-xs mt-1">Delete an existing resume to upload a new one</p>
                </div>
              )}

              {/* Resume list */}
              {resumesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader className="w-6 h-6 text-blue-400 animate-spin" />
                </div>
              ) : resumes.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No resumes uploaded yet
                </div>
              ) : (
                <div className="space-y-3">
                  {resumes.map(resume => (
                    <div
                      key={resume.id}
                      className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                        resume.is_active
                          ? 'border-blue-500/50 bg-blue-500/5'
                          : 'border-slate-700 bg-slate-800/30'
                      }`}
                    >
                      {/* File icon */}
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        resume.is_active ? 'bg-blue-500/20' : 'bg-slate-700'
                      }`}>
                        <FileText className={`w-5 h-5 ${resume.is_active ? 'text-blue-400' : 'text-slate-400'}`} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-white text-sm font-medium truncate">{resume.filename}</p>
                          {resume.is_active && (
                            <span className="flex items-center gap-1 text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full flex-shrink-0">
                              <Star className="w-3 h-3" /> Active
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 text-xs mt-0.5">
                          {formatDate(resume.uploaded_at)} · {formatFileSize(resume.file_size)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Download */}
                        <button
                          onClick={() => handleDownloadResume(resume.id, resume.filename)}
                          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
                          title="Download"
                        >
                          <Upload className="w-4 h-4 rotate-180" />
                        </button>

                        {/* Set active */}
                        {!resume.is_active && (
                          <button
                            onClick={() => handleSetActive(resume.id)}
                            disabled={settingActiveId === resume.id}
                            className="text-xs px-3 py-1.5 bg-slate-700 hover:bg-blue-600 text-slate-300 hover:text-white rounded-lg transition-all disabled:opacity-50"
                            title="Set as active resume"
                          >
                            {settingActiveId === resume.id
                              ? <Loader className="w-3 h-3 animate-spin" />
                              : 'Set Active'
                            }
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteResume(resume.id)}
                          disabled={deletingId === resume.id}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
                          title="Delete"
                        >
                          {deletingId === resume.id
                            ? <Loader className="w-4 h-4 animate-spin" />
                            : <Trash2 className="w-4 h-4" />
                          }
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── PASSWORD ── */}
          {activeTab === 'password' && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-2">Change Password</h2>
              <p className="text-slate-400 text-sm mb-6">Choose a strong password with at least 8 characters.</p>
              <div className="max-w-md space-y-4">
                <div>
                  <label className={labelClass}>Current Password</label>
                  <div className="relative">
                    <input type={showCurrentPw ? 'text' : 'password'} value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password" className={`${inputClass} pr-10`} />
                    <button onClick={() => setShowCurrentPw(!showCurrentPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                      {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>New Password</label>
                  <div className="relative">
                    <input type={showNewPw ? 'text' : 'password'} value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Enter new password" className={`${inputClass} pr-10`} />
                    <button onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                      {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Confirm New Password</label>
                  <div className="relative">
                    <input type={showConfirmPw ? 'text' : 'password'} value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password" className={`${inputClass} pr-10`}
                      onKeyDown={e => { if (e.key === 'Enter') handleChangePassword() }} />
                    <button onClick={() => setShowConfirmPw(!showConfirmPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                      {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {passwordError && (
                  <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" /> {passwordError}
                  </div>
                )}
                {passwordSuccess && (
                  <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl px-4 py-3 text-sm">
                    <Check className="w-4 h-4 flex-shrink-0" /> Password changed successfully!
                  </div>
                )}
                <button onClick={handleChangePassword}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-xl transition-colors text-sm">
                  <KeyRound className="w-4 h-4" /> Update Password
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}