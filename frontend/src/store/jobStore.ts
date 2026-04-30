import { create } from 'zustand'
import { jobsAPI } from '../api/endpoints'

interface Job {
  id: string
  title: string
  company: string
  location: string
  salary_min: number | null
  salary_max: number | null
  description: string
  source: string
  source_url: string
  match_score: number
  ats_score: number
  posted_at: string
  created_at: string
}

interface JobState {
  jobs: Job[]
  isLoading: boolean
  isScraping: boolean
  error: string | null
  totalJobs: number
  fetchJobs: (minScore?: number) => Promise<void>
  scrapeJobs: (keywords: string[], resumeText: string) => Promise<void>
  clearError: () => void
}

export const useJobStore = create<JobState>((set) => ({
  jobs: [],
  isLoading: false,
  isScraping: false,
  error: null,
  totalJobs: 0,

  fetchJobs: async (minScore = 0) => {
    set({ isLoading: true, error: null })
    try {
      const response = await jobsAPI.getJobs(50, 0, minScore)
      const jobsData = Array.isArray(response.data) ? response.data : []
      set({
        jobs: jobsData,
        totalJobs: jobsData.length,
        isLoading: false,
      })
    } catch (error: any) {
      set({
        error: 'Failed to fetch jobs',
        isLoading: false,
      })
    }
  },

  scrapeJobs: async (keywords: string[], resumeText: string) => {
    set({ isScraping: true, error: null })
    try {
      await jobsAPI.scrapeJobs(keywords, resumeText)
      const response = await jobsAPI.getJobs(50, 0, 0)
      const jobsData = Array.isArray(response.data) ? response.data : []
      set({
        jobs: jobsData,
        totalJobs: jobsData.length,
        isScraping: false,
      })
    } catch (error: any) {
      set({
        error: 'Scraping failed',
        isScraping: false,
      })
    }
  },

  clearError: () => set({ error: null }),
}))