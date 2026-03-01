import { useState } from 'react'
import { motion } from 'framer-motion'
import { Briefcase, Sparkles, Tag } from 'lucide-react'
import { api } from '../lib/api'

export default function JobAnalyzer() {
  const [jobDesc, setJobDesc] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ keywords?: string[]; skills?: string[]; summary?: string } | null>(null)

  const analyze = async () => {
    if (!jobDesc.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const { data } = await api.post('/jobs/analyze', { job_description: jobDesc })
      setResult(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Job Description Analyzer</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Extract keywords and skills from job postings</p>
      </div>

      <div className="glass rounded-2xl p-6">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Paste Job Description</label>
        <textarea
          value={jobDesc}
          onChange={(e) => setJobDesc(e.target.value)}
          placeholder="Paste the full job description here..."
          className="w-full h-48 p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 resize-none focus:ring-2 focus:ring-primary-500"
        />
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={analyze}
          disabled={loading || !jobDesc.trim()}
          className="mt-4 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Analyze'}
          <Sparkles className="w-5 h-5" />
        </motion.button>
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary-500" />
            Extracted Keywords & Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {(result.keywords || result.skills || []).map((kw, i) => (
              <span key={i} className="px-3 py-1 rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400 text-sm font-medium">
                {kw}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
