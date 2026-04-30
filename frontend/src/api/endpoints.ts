import api from './client'

// ── Auth ──────────────────────────────────────
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/api/v1/auth/login', { email, password }),

  register: (name: string, email: string, password: string) =>
    api.post('/api/v1/auth/register', { name, email, password }),

  me: () =>
    api.get('/api/v1/auth/me'),
}

// ── Jobs ──────────────────────────────────────
export const jobsAPI = {
  getJobs: (limit = 20, skip = 0, minScore = 0) =>
    api.get(`/api/v1/scraper/jobs?limit=${limit}&skip=${skip}&min_score=${minScore}`),

  scrapeJobs: (keywords: string[], resume_text: string) =>
    api.post('/api/v1/scraper/scrape-now', {
      keywords,
      sources: ['greenhouse', 'lever', 'remoteok'],
      resume_text,
    }),

  getStats: () =>
    api.get('/api/v1/scraper/stats'),
}

// ── Applications ──────────────────────────────
export const applicationsAPI = {
  getAll: (status?: string) =>
    api.get(`/api/v1/applications/${status ? `?status=${status}` : ''}`),

  create: (job_id: string, cover_letter?: string) =>
    api.post('/api/v1/applications/', { job_id, cover_letter }),

  update: (id: string, status: string, notes?: string) =>
    api.patch(`/api/v1/applications/${id}`, { status, notes }),

  delete: (id: string) =>
    api.delete(`/api/v1/applications/${id}`),
}

// ── AI ────────────────────────────────────────
export const aiAPI = {
  matchJob: (resume_text: string, job_description: string) =>
    api.post('/api/v1/ai/match', { resume_text, job_description }),

  tailorResume: (resume_text: string, job_description: string, job_title: string, company: string) =>
    api.post('/api/v1/ai/tailor-resume', { resume_text, job_description, job_title, company }),

  generateCoverLetter: (resume_text: string, job_description: string, job_title: string, company: string) =>
    api.post('/api/v1/ai/cover-letter', { resume_text, job_description, job_title, company }),

  extractSkills: (resume_text: string) =>
    api.post('/api/v1/ai/extract-skills', { resume_text }),
}