import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Users, FileText, TrendingUp } from 'lucide-react'
import { api } from '../lib/api'

interface Analytics {
  total_users: number
  total_resumes: number
  average_ats_score: number
}

export default function AdminPanel() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/admin/analytics').then(({ data }) => setAnalytics(data)).catch((e) => setError(e.response?.data?.detail || 'Access denied'))
  }, [])

  const chartData = analytics ? [
    { name: 'Users', value: analytics.total_users },
    { name: 'Resumes', value: analytics.total_resumes },
    { name: 'Avg Score', value: Math.round(analytics.average_ats_score) },
  ] : []

  if (error) {
    return (
      <div className="glass rounded-2xl p-12 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Analytics</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Platform overview</p>
      </div>

      {analytics && (
        <>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary-500" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Total Users</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{analytics.total_users}</p>
                </div>
              </div>
            </div>
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Total Resumes</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{analytics.total_resumes}</p>
                </div>
              </div>
            </div>
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-violet-500" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Avg ATS Score</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{analytics.average_ats_score.toFixed(1)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Overview Chart</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="name" tick={{ fill: 'currentColor' }} />
                  <YAxis tick={{ fill: 'currentColor' }} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--tw-bg-opacity)', borderRadius: '0.5rem' }} />
                  <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </motion.div>
  )
}
