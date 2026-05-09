import { useState } from 'react'
import {
  Bell, Shield, Sliders, Trash2, AlertCircle,
  Check, Moon, Sun, Monitor, Save, Loader,
  BellOff, BellRing, Mail, Smartphone, LogOut
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useTheme } from '../hooks/useTheme'
import { useNavigate } from 'react-router-dom'

const API_URL = 'http://127.0.0.1:8000'

type Tab = 'appearance' | 'notifications' | 'autoapply' | 'privacy' | 'danger'

export default function Settings() {
  const { user, logout } = useAuthStore()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<Tab>('appearance')
  const [saveSuccess, setSaveSuccess] = useState('')
  const [isSaving, setIsSaving]       = useState(false)

  // Notifications — stored in localStorage
  const [emailAlerts, setEmailAlerts]       = useState(() => localStorage.getItem('notif_email') !== 'false')
  const [jobMatchAlerts, setJobMatchAlerts] = useState(() => localStorage.getItem('notif_match') !== 'false')
  const [weeklyReport, setWeeklyReport]     = useState(() => localStorage.getItem('notif_weekly') !== 'false')
  const [appUpdates, setAppUpdates]         = useState(() => localStorage.getItem('notif_updates') !== 'false')

  // Auto-apply rules — stored in localStorage
  const [minMatchScore, setMinMatchScore]   = useState(() => parseInt(localStorage.getItem('auto_min_score') || '70'))
  const [dailyLimit, setDailyLimit]         = useState(() => parseInt(localStorage.getItem('auto_daily_limit') || '10'))
  const [applyRemote, setApplyRemote]       = useState(() => localStorage.getItem('auto_remote') !== 'false')
  const [applyOnsite, setApplyOnsite]       = useState(() => localStorage.getItem('auto_onsite') === 'true')

  // Privacy
  const [shareData, setShareData]           = useState(() => localStorage.getItem('privacy_share') !== 'false')
  const [analytics, setAnalyticsOpt]        = useState(() => localStorage.getItem('privacy_analytics') !== 'false')

  // Danger zone
  const [deleteConfirm, setDeleteConfirm]   = useState('')
  const [isDeleting, setIsDeleting]         = useState(false)
  const [deleteError, setDeleteError]       = useState('')

  const showSuccess = (msg: string) => {
    setSaveSuccess(msg)
    setTimeout(() => setSaveSuccess(''), 3000)
  }

  const saveNotifications = () => {
    localStorage.setItem('notif_email',   String(emailAlerts))
    localStorage.setItem('notif_match',   String(jobMatchAlerts))
    localStorage.setItem('notif_weekly',  String(weeklyReport))
    localStorage.setItem('notif_updates', String(appUpdates))
    showSuccess('Notification preferences saved!')
  }

  const saveAutoApply = () => {
    localStorage.setItem('auto_min_score',   String(minMatchScore))
    localStorage.setItem('auto_daily_limit', String(dailyLimit))
    localStorage.setItem('auto_remote',      String(applyRemote))
    localStorage.setItem('auto_onsite',      String(applyOnsite))
    showSuccess('Auto-apply rules saved!')
  }

  const savePrivacy = () => {
    localStorage.setItem('privacy_share',     String(shareData))
    localStorage.setItem('privacy_analytics', String(analytics))
    showSuccess('Privacy settings saved!')
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== user?.email) {
      setDeleteError(`Type your email exactly: ${user?.email}`)
      return
    }
    setIsDeleting(true)
    setDeleteError('')
    try {
      const token = localStorage.getItem('access_token')
      const res = await fetch(`${API_URL}/api/v1/auth/delete-account`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        logout()
        navigate('/')
      } else {
        setDeleteError('Failed to delete account. Please try again.')
      }
    } catch {
      setDeleteError('Could not reach server.')
    }
    setIsDeleting(false)
  }

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`w-11 h-6 rounded-full relative transition-colors flex-shrink-0 ${value ? 'bg-blue-600' : 'bg-slate-600'}`}
    >
      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  )

  const inputClass = "w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'appearance',    label: 'Appearance',    icon: Monitor  },
    { id: 'notifications', label: 'Notifications', icon: Bell     },
    { id: 'autoapply',     label: 'Auto-Apply',    icon: Sliders  },
    { id: 'privacy',       label: 'Privacy',       icon: Shield   },
    { id: 'danger',        label: 'Delete Account',   icon: Trash2   },
  ]

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Header */}
<div className="mb-8 flex items-start justify-between">
  <div>
    <h1 className="text-2xl font-bold text-white">Settings</h1>
    <p className="text-slate-400 text-sm mt-1">
      Manage your app preferences and account settings
    </p>
  </div>

  {/* Logout Button */}
  <button
    onClick={() => {
      logout()
      navigate('/')
    }}
    className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/5 transition-all"
  >
    <LogOut className="w-5 h-5" />
    <span className="text-xs font-medium">Logout</span>
  </button>
</div>

        {/* Save success */}
        {saveSuccess && (
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl px-4 py-3 mb-6 text-sm">
            <Check className="w-4 h-4 flex-shrink-0" /> {saveSuccess}
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
                  ? id === 'danger'
                    ? 'bg-red-600 text-white shadow'
                    : 'bg-blue-600 text-white shadow'
                  : id === 'danger'
                    ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
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

          {/* ── APPEARANCE ── */}
          {activeTab === 'appearance' && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-2">Appearance</h2>
              <p className="text-slate-400 text-sm mb-6">Choose how CareerPilot AI looks for you.</p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {/* Dark mode card */}
                <button
                  onClick={() => theme === 'light' && toggleTheme()}
                  className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                    theme === 'dark'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  }`}
                >
                  <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700">
                    <Moon className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-white text-sm font-medium">Dark Mode</p>
                    <p className="text-slate-400 text-xs mt-0.5">Easy on the eyes</p>
                  </div>
                  {theme === 'dark' && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>

                {/* Light mode card */}
                <button
                  onClick={() => theme === 'dark' && toggleTheme()}
                  className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                    theme === 'light'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  }`}
                >
                  <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-500/30">
                    <Sun className="w-6 h-6 text-amber-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-white text-sm font-medium">Light Mode</p>
                    <p className="text-slate-400 text-xs mt-0.5">Bright and clean</p>
                  </div>
                  {theme === 'light' && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              </div>

              {/* Quick toggle */}
              <div className="flex items-center justify-between bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  {theme === 'dark'
                    ? <Moon className="w-5 h-5 text-blue-400" />
                    : <Sun className="w-5 h-5 text-amber-400" />
                  }
                  <div>
                    <p className="text-white text-sm font-medium">
                      Currently: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                    </p>
                    <p className="text-slate-400 text-xs mt-0.5">Click to switch</p>
                  </div>
                </div>
                <Toggle value={theme === 'light'} onChange={toggleTheme} />
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-2">Notifications</h2>
              <p className="text-slate-400 text-sm mb-6">Control what alerts you receive.</p>

              <div className="space-y-3 mb-6">
                {[
                  {
                    icon: Mail, label: 'Email Alerts',
                    desc: 'Receive email notifications for important updates',
                    value: emailAlerts, onChange: () => setEmailAlerts(!emailAlerts)
                  },
                  {
                    icon: BellRing, label: 'Job Match Alerts',
                    desc: 'Get notified when new jobs match your profile above 70%',
                    value: jobMatchAlerts, onChange: () => setJobMatchAlerts(!jobMatchAlerts)
                  },
                  {
                    icon: BarChart3 ?? Bell, label: 'Weekly Report',
                    desc: 'Receive a weekly summary of your job search activity',
                    value: weeklyReport, onChange: () => setWeeklyReport(!weeklyReport)
                  },
                  {
                    icon: Smartphone, label: 'App Updates',
                    desc: 'Notifications about new features and improvements',
                    value: appUpdates, onChange: () => setAppUpdates(!appUpdates)
                  },
                ].map(({ icon: Icon, label, desc, value, onChange }) => (
                  <div key={label} className="flex items-center justify-between bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-slate-300" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{label}</p>
                        <p className="text-slate-400 text-xs mt-0.5">{desc}</p>
                      </div>
                    </div>
                    <Toggle value={value} onChange={onChange} />
                  </div>
                ))}
              </div>

              <button
                onClick={saveNotifications}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl transition-colors text-sm"
              >
                <Save className="w-4 h-4" /> Save Preferences
              </button>
            </div>
          )}

          {/* ── AUTO-APPLY ── */}
          {activeTab === 'autoapply' && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-2">Auto-Apply Rules</h2>
              <p className="text-slate-400 text-sm mb-6">
                Control how CareerPilot automatically applies to jobs on your behalf.
              </p>

              <div className="space-y-5 mb-6">

                {/* Min match score */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-slate-300 text-sm font-medium">
                      Minimum Match Score
                    </label>
                    <span className="text-blue-400 font-bold text-sm">{minMatchScore}%</span>
                  </div>
                  <input
                    type="range"
                    min="50" max="95" step="5"
                    value={minMatchScore}
                    onChange={e => setMinMatchScore(parseInt(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>50% (more jobs)</span>
                    <span>95% (fewer, better fits)</span>
                  </div>
                </div>

                {/* Daily limit */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-slate-300 text-sm font-medium">
                      Daily Application Limit
                    </label>
                    <span className="text-blue-400 font-bold text-sm">{dailyLimit}</span>
                  </div>
                  <input
                    type="range"
                    min="1" max="25" step="1"
                    value={dailyLimit}
                    onChange={e => setDailyLimit(parseInt(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>1 per day</span>
                    <span>25 per day</span>
                  </div>
                </div>

                {/* Job types */}
                <div className="space-y-3">
                  <p className="text-slate-300 text-sm font-medium">Apply To</p>
                  {[
                    { label: 'Remote Jobs', desc: 'Apply to fully remote positions', value: applyRemote, onChange: () => setApplyRemote(!applyRemote) },
                    { label: 'On-site Jobs', desc: 'Apply to in-office positions', value: applyOnsite, onChange: () => setApplyOnsite(!applyOnsite) },
                  ].map(({ label, desc, value, onChange }) => (
                    <div key={label} className="flex items-center justify-between bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                      <div>
                        <p className="text-white text-sm font-medium">{label}</p>
                        <p className="text-slate-400 text-xs mt-0.5">{desc}</p>
                      </div>
                      <Toggle value={value} onChange={onChange} />
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={saveAutoApply}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl transition-colors text-sm"
              >
                <Save className="w-4 h-4" /> Save Rules
              </button>
            </div>
          )}

          {/* ── PRIVACY ── */}
          {activeTab === 'privacy' && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-2">Privacy</h2>
              <p className="text-slate-400 text-sm mb-6">Control how your data is used.</p>

              <div className="space-y-3 mb-6">
                {[
                  {
                    label: 'Usage Analytics',
                    desc: 'Help improve CareerPilot by sharing anonymous usage data',
                    value: analytics, onChange: () => setAnalyticsOpt(!analytics)
                  },
                  {
                    label: 'Profile Visibility',
                    desc: 'Allow CareerPilot AI to use your profile for better job recommendations',
                    value: shareData, onChange: () => setShareData(!shareData)
                  },
                ].map(({ label, desc, value, onChange }) => (
                  <div key={label} className="flex items-center justify-between bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <div>
                      <p className="text-white text-sm font-medium">{label}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{desc}</p>
                    </div>
                    <Toggle value={value} onChange={onChange} />
                  </div>
                ))}
              </div>

              {/* Data info */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-blue-300 text-sm font-medium">Your data is secure</p>
                    <p className="text-blue-400/70 text-xs mt-1 leading-relaxed">
                      Your resume and personal information are stored securely and never shared with third parties.
                      All AI processing happens on our servers.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={savePrivacy}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl transition-colors text-sm"
              >
                <Save className="w-4 h-4" /> Save Privacy Settings
              </button>
            </div>
          )}

          {/* ── DANGER ZONE ── */}
          {activeTab === 'danger' && (
            <div>
              <h2 className="text-lg font-semibold text-red-400 mb-2">Remove Account</h2>
              <p className="text-slate-400 text-sm mb-6">
                These actions are permanent and cannot be undone.
              </p>

              <div className="border border-red-500/30 rounded-2xl p-6 bg-red-500/5">
                <div className="flex items-start gap-3 mb-6">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    {/* <p className="text-red-300 text-sm font-medium">Delete Account</p> */}
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                      This will permanently delete your account, profile, all job applications,
                      saved jobs, and resume data. This action cannot be undone.
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-slate-300 text-sm font-medium mb-2 block">
                    Type your email to confirm: <span className="text-red-400">{user?.email}</span>
                  </label>
                  <input
                    type="email"
                    value={deleteConfirm}
                    onChange={e => { setDeleteConfirm(e.target.value); setDeleteError('') }}
                    placeholder={user?.email || 'your@email.com'}
                    className="w-full bg-slate-800/50 border border-red-500/30 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>

                {deleteError && (
                  <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm mb-4">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" /> {deleteError}
                  </div>
                )}

                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || deleteConfirm !== user?.email}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium px-5 py-2.5 rounded-xl transition-colors text-sm"
                >
                  {isDeleting
                    ? <><Loader className="w-4 h-4 animate-spin" /> Deleting account...</>
                    : <><Trash2 className="w-4 h-4" /> Permanently Delete Account</>
                  }
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}