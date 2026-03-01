import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, FileText, Search } from 'lucide-react'
import { api } from '../lib/api'

interface Resume {
  id: number
  title: string
  ats_score: number | null
  version: number
  created_at: string
}

export default function ResumeBuilder() {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/resumes/').then(({ data }) => setResumes(data)).finally(() => setLoading(false))
  }, [])

  const filtered = resumes.filter(r => r.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Resumes</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Create and manage ATS-optimized resumes</p>
        </div>
        <Link
          to="/resumes/new"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg shadow-primary-500/25"
        >
          <Plus className="w-5 h-5" />
          New Resume
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search resumes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full" /></div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-3xl p-16 text-center"
        >
          <div className="w-20 h-20 mx-auto rounded-2xl bg-primary-500/10 flex items-center justify-center mb-4">
            <FileText className="w-10 h-10 text-primary-500" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No resumes yet</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">Create your first resume with AI assistance and get real-time ATS scoring</p>
          <Link
            to="/resumes/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600"
          >
            <Plus className="w-5 h-5" />
            Create Resume
          </Link>
        </motion.div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((resume, i) => (
            <motion.div
              key={resume.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={`/resumes/${resume.id}`}>
                <div className="glass rounded-2xl p-6 card-hover h-full">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-primary-500" />
                    </div>
                    {resume.ats_score !== null && (
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        resume.ats_score >= 70 ? 'bg-emerald-500/20 text-emerald-600' :
                        resume.ats_score >= 50 ? 'bg-amber-500/20 text-amber-600' : 'bg-red-500/20 text-red-600'
                      }`}>
                        {resume.ats_score.toFixed(0)}%
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mt-4">{resume.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">v{resume.version} • {new Date(resume.created_at).toLocaleDateString()}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
