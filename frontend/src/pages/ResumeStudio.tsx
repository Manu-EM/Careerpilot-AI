import { useState } from 'react'
import { FileText, Sparkles, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { API_URL } from '../config'


const DEFAULT_RESUME = `John Doe | Frontend Developer
Email: john@email.com | Phone: +1-555-0123

EXPERIENCE
Frontend Developer - TechCorp (2021-2024)
- Built React applications with TypeScript and Tailwind CSS
- Developed REST API integrations with Node.js
- Improved app performance by 40% using code splitting

SKILLS
React, TypeScript, JavaScript, Node.js, REST APIs, Git, Tailwind CSS, HTML, CSS

EDUCATION
B.Tech Computer Science - 2021`

export default function ResumeStudio() {
  const [resumeText, setResumeText]       = useState(DEFAULT_RESUME)
  const [jobDescription, setJobDescription] = useState('')
  const [jobTitle, setJobTitle]           = useState('')
  const [company, setCompany]             = useState('')
  const [result, setResult]               = useState<any>(null)
  const [coverLetter, setCoverLetter]     = useState('')
  const [isLoading, setIsLoading]         = useState(false)
  const [activeTab, setActiveTab]         = useState<'tailor' | 'cover' | 'skills'>('tailor')

  const tailorResume = async () => {
    if (!jobDescription || !jobTitle || !company) {
      alert('Please fill in job title, company and job description')
      return
    }
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/v1/ai/tailor-resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume_text: resumeText, job_description: jobDescription, job_title: jobTitle, company })
      })
      const data = await response.json()
      setResult(data.data)
      setActiveTab('tailor')
    } catch(e) {
      console.log('Error:', e)
    }
    setIsLoading(false)
  }

  const generateCoverLetter = async () => {
    if (!jobDescription || !jobTitle || !company) {
      alert('Please fill in job title, company and job description')
      return
    }
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/v1/ai/cover-letter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume_text: resumeText, job_description: jobDescription, job_title: jobTitle, company, candidate_name: 'Manu EM' })
      })
      const data = await response.json()
      setCoverLetter(data.data?.cover_letter || '')
      setActiveTab('cover')
    } catch(e) {
      console.log('Error:', e)
    }
    setIsLoading(false)
  }

  const extractSkills = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/v1/ai/extract-skills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume_text: resumeText })
      })
      const data = await response.json()
      setResult(data.data)
      setActiveTab('skills')
    } catch(e) {
      console.log('Error:', e)
    }
    setIsLoading(false)
  }

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 min-h-screen bg-slate-950">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Resume Studio</h1>
        <p className="text-slate-400 text-sm mt-1">AI powered resume tailoring</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left — Input */}
        <div className="space-y-4">

          {/* Resume Input */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              Your Resume
            </h2>
            <textarea
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
              rows={8}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
              placeholder="Paste your resume here..."
            />
          </div>

          {/* Job Details */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Target Job
            </h2>
            <input
              type="text"
              placeholder="Job Title (e.g. Frontend Developer)"
              value={jobTitle}
              onChange={e => setJobTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="Company (e.g. Google)"
              value={company}
              onChange={e => setCompany(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <textarea
              placeholder="Paste the job description here..."
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              rows={5}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={tailorResume}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
            >
              {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Tailor Resume
            </button>
            <button
              onClick={generateCoverLetter}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-70 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
            >
              {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              Cover Letter
            </button>
            <button
              onClick={extractSkills}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-70 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
            >
              {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Extract Skills
            </button>
          </div>
        </div>

        {/* Right — Output */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">

          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            {(['tailor', 'cover', 'skills'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                  activeTab === tab ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {tab === 'tailor' ? 'Tailored Resume' : tab === 'cover' ? 'Cover Letter' : 'Skills'}
              </button>
            ))}
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader className="w-8 h-8 text-blue-400 animate-spin" />
              <p className="text-slate-400 text-sm">Gemini AI is working...</p>
            </div>
          )}

          {/* Tailored Resume */}
          {!isLoading && activeTab === 'tailor' && result?.tailored_resume && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-green-400 text-xs font-medium">✓ Resume tailored successfully</p>
                <button
                  onClick={() => navigator.clipboard.writeText(result.tailored_resume)}
                  className="text-blue-400 text-xs hover:text-blue-300"
                >
                  Copy
                </button>
              </div>
              <textarea
                value={result.tailored_resume}
                readOnly
                rows={12}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white text-xs font-mono resize-none focus:outline-none"
              />
              {result.missing_keywords?.length > 0 && (
                <div>
                  <p className="text-red-400 text-xs font-medium mb-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Missing Keywords
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {result.missing_keywords.map((kw: string) => (
                      <span key={kw} className="bg-red-500/10 text-red-400 text-xs px-2 py-1 rounded-full">{kw}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cover Letter */}
          {!isLoading && activeTab === 'cover' && coverLetter && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-green-400 text-xs font-medium">✓ Cover letter generated</p>
                <button
                  onClick={() => navigator.clipboard.writeText(coverLetter)}
                  className="text-blue-400 text-xs hover:text-blue-300"
                >
                  Copy
                </button>
              </div>
              <textarea
                value={coverLetter}
                readOnly
                rows={12}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white text-sm resize-none focus:outline-none"
              />
            </div>
          )}

          {/* Skills */}
          {!isLoading && activeTab === 'skills' && result?.skills && (
            <div className="space-y-4">
              <p className="text-green-400 text-xs font-medium">✓ Skills extracted</p>
              <div>
                <p className="text-slate-400 text-xs mb-1">Name</p>
                <p className="text-white text-sm">{result.name}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">Current Title</p>
                <p className="text-white text-sm">{result.current_title}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">Experience</p>
                <p className="text-white text-sm">{result.experience_years} years</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-2">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {result.skills?.map((s: string) => (
                    <span key={s} className="bg-blue-500/10 text-blue-400 text-xs px-2.5 py-1 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">Summary</p>
                <p className="text-white text-sm">{result.summary}</p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !result && !coverLetter && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Sparkles className="w-10 h-10 text-slate-600 mb-3" />
              <p className="text-slate-400 text-sm">Fill in job details and click an action button</p>
              <p className="text-slate-500 text-xs mt-1">Powered by Gemini AI</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}