import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import { FileText, TrendingUp, Target, Zap } from 'lucide-react'
import { api } from '../lib/api'

interface Resume {
  id: number
  title: string
  ats_score: number | null
  updated_at: string
}

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

export default function Dashboard() {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/resumes/').then(({ data }) => setResumes(data)).finally(() => setLoading(false))
  }, [])

  const radarData = [
    { subject: 'Keywords', value: 75, fullMark: 100 },
    { subject: 'Semantic', value: 68, fullMark: 100 },
    { subject: 'Sections', value: 90, fullMark: 100 },
    { subject: 'Format', value: 85, fullMark: 100 },
    { subject: 'Grammar', value: 82, fullMark: 100 },
    { subject: 'Actions', value: 70, fullMark: 100 },
    { subject: 'Metrics', value: 65, fullMark: 100 },
    { subject: 'Readability', value: 88, fullMark: 100 },
  ]

  const topResume = resumes.filter(r => r.ats_score).sort((a, b) => (b.ats_score || 0) - (a.ats_score || 0))[0]

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <motion.div variants={item}>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Your resume analytics at a glance</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Resumes', value: resumes.length, icon: FileText, color: 'from-primary-500 to-primary-600' },
          { label: 'Top Score', value: topResume?.ats_score?.toFixed(1) || '—', icon: TrendingUp, color: 'from-emerald-500 to-emerald-600' },
          { label: 'Avg Score', value: resumes.filter(r => r.ats_score).length ? (resumes.reduce((a, r) => a + (r.ats_score || 0), 0) / resumes.filter(r => r.ats_score).length).toFixed(1) : '—', icon: Target, color: 'from-violet-500 to-violet-600' },
          { label: 'Optimized', value: resumes.filter(r => r.ats_score && r.ats_score >= 70).length, icon: Zap, color: 'from-amber-500 to-amber-600' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            variants={item}
            className="glass rounded-2xl p-6 card-hover"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div variants={item} className="glass rounded-2xl p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">ATS Score Breakdown</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#94a3b8" strokeOpacity={0.3} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'currentColor', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'currentColor' }} />
                <Radar name="Score" dataKey="value" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.4} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={item} className="glass rounded-2xl p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Recent Resumes</h3>
          {loading ? (
            <div className="flex justify-center py-12"><div className="animate-spin w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full" /></div>
          ) : resumes.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No resumes yet</p>
              <Link to="/resumes" className="text-primary-500 font-medium mt-2 inline-block">Create your first resume</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {resumes.slice(0, 5).map((r) => (
                <Link
                  key={r.id}
                  to={`/resumes/${r.id}`}
                  className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{r.title}</p>
                    <p className="text-sm text-slate-500">{new Date(r.updated_at).toLocaleDateString()}</p>
                  </div>
                  {r.ats_score !== null && (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      r.ats_score >= 70 ? 'bg-emerald-500/20 text-emerald-600' :
                      r.ats_score >= 50 ? 'bg-amber-500/20 text-amber-600' : 'bg-red-500/20 text-red-600'
                    }`}>
                      {r.ats_score.toFixed(0)}%
                    </span>
                  )}
                </Link>
              ))}
              <Link to="/resumes" className="block text-center text-primary-500 font-medium py-2">View all →</Link>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
