import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Apply saved theme on first load
const savedTheme = localStorage.getItem('theme') || 'dark'
document.documentElement.classList.toggle('light', savedTheme === 'light')


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
