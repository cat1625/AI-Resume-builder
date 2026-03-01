import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ResumeBuilder from './pages/ResumeBuilder'
import ResumeDetail from './pages/ResumeDetail'
import JobAnalyzer from './pages/JobAnalyzer'
import SkillGap from './pages/SkillGap'
import CoverLetter from './pages/CoverLetter'
import InterviewPrep from './pages/InterviewPrep'
import LinkedInAnalyzer from './pages/LinkedInAnalyzer'
import AdminPanel from './pages/AdminPanel'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full" /></div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="resumes" element={<ResumeBuilder />} />
        <Route path="resumes/:id" element={<ResumeDetail />} />
        <Route path="job-analyzer" element={<JobAnalyzer />} />
        <Route path="skill-gap" element={<SkillGap />} />
        <Route path="cover-letter" element={<CoverLetter />} />
        <Route path="interview-prep" element={<InterviewPrep />} />
        <Route path="linkedin" element={<LinkedInAnalyzer />} />
        <Route path="admin" element={<AdminPanel />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
