import { useNavigate } from 'react-router-dom'
import { Rocket, Search, Brain, FileText, Send, BarChart3, CheckCircle, Star, Zap } from 'lucide-react'

const features = [
  { icon: Search,    title: 'Auto Job Discovery',    desc: 'Scrapes 50+ job boards including Greenhouse, Lever and RemoteOK automatically' },
  { icon: Brain,     title: 'AI Match Scoring',      desc: 'Gemini AI analyzes your resume against each job and gives a match score' },
  { icon: FileText,  title: 'Resume Tailoring',      desc: 'Automatically rewrites your resume for each job to maximize ATS score' },
  { icon: Send,      title: 'Auto Apply',            desc: 'One click to apply or let the AI agent apply autonomously on your behalf' },
  { icon: BarChart3, title: 'Application Tracker',   desc: 'Kanban pipeline to track every application from Saved to Offer' },
  { icon: Star,      title: 'Analytics Dashboard',   desc: 'Track response rates, interview conversions and resume performance' },
]

const steps = [
  { num: '01', title: 'Upload Your Resume',    desc: 'Paste your resume and set your job preferences and salary expectations' },
  { num: '02', title: 'AI Finds Jobs',         desc: 'Our agents scrape fresh jobs from 50+ sources and score them against your profile' },
  { num: '03', title: 'Review & Apply',        desc: 'Review AI-tailored resumes and cover letters then apply with one click' },
  { num: '04', title: 'Track & Improve',       desc: 'Track all applications and let AI learn from outcomes to improve over time' },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg">CareerPilot AI</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="text-slate-300 hover:text-white text-sm font-medium transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Get Started 
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-6">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-blue-400 text-xs font-medium">Autonomous AI Career Agent</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Your AI Agent That
            <span className="text-blue-400"> Finds, Applies</span>
            <br />& Tracks Jobs For You
          </h1>
          <p className="text-slate-400 text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
            CareerPilot AI works 24/7 to search jobs, tailor your resume,
            generate cover letters and apply — so you can focus on interviews.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-base"
            >
              <Rocket className="w-5 h-5" />
              Sign Up
            </button>
            <button
              onClick={() => navigate('/login')}
              className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-base"
            >
              Sign In
            </button>
          </div>
          <p className="text-slate-500 text-sm mt-4">No credit card required · Free forever</p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 border-y border-slate-800">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '50+',  label: 'Job Sources' },
            { value: '24/7', label: 'AI Agent Active' },
            { value: '10x',  label: 'Faster Job Search' },
            { value: '100%', label: 'Free to Start' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl font-bold text-blue-400 mb-1">{value}</p>
              <p className="text-slate-400 text-sm">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything You Need to Land Your Dream Job
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              A complete autonomous system that handles every step of your job search
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-blue-500/50 transition-all">
                <div className="bg-blue-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-slate-400 text-lg">Get started in minutes</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {steps.map(({ num, title, desc }) => (
              <div key={num} className="flex gap-4 p-6 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="text-3xl font-bold text-blue-500/30 flex-shrink-0 w-12">{num}</div>
                <div>
                  <h3 className="text-white font-semibold mb-2">{title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/20 rounded-2xl p-10">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Automate Your Job Search?
            </h2>
            <p className="text-slate-400 mb-6">
              Join thousands of job seekers using AI to land their dream jobs faster.
            </p>
            <button
              onClick={() => navigate('/register')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-base"
            >
              Get Started Today
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Rocket className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold">CareerPilot AI</span>
          </div>
          <p className="text-slate-500 text-sm">Built with React + FastAPI + Gemini AI · Free Stack</p>
        </div>
      </footer>
    </div>
  )
}