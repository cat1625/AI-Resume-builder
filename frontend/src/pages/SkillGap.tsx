import { useState } from 'react'
import { motion } from 'framer-motion'
import { Target, Check, X } from 'lucide-react'
import { api } from '../lib/api'

export default function SkillGap() {
  const [resumeText, setResumeText] = useState('')
  const [jobDesc, setJobDesc] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ matched?: string[]; missing?: string[]; match_rate?: number } | null>(null)

  const analyze = async () => {
    if (!resumeText.trim() || !jobDesc.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const { data } = await api.post('/ai/skill-gap', { resume_text: resumeText, job_description: jobDesc })
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
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Skill Gap Detection</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Compare your resume against job requirements</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Your Resume</label>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your resume..."
            className="w-full h-48 p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 resize-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="glass rounded-2xl p-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Job Description</label>
          <textarea
            value={jobDesc}
            onChange={(e) => setJobDesc(e.target.value)}
            placeholder="Paste job description..."
            className="w-full h-48 p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 resize-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={analyze}
        disabled={loading || !resumeText.trim() || !jobDesc.trim()}
        className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold flex items-center gap-2 disabled:opacity-50"
      >
        {loading ? 'Analyzing...' : 'Detect Skill Gap'}
        <Target className="w-5 h-5" />
      </motion.button>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-2 gap-6"
        >
          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold text-emerald-600 dark:text-emerald-400 mb-4 flex items-center gap-2">
              <Check className="w-5 h-5" />
              Matched Skills ({result.matched?.length || 0})
            </h3>
            <div className="flex flex-wrap gap-2">
              {(result.matched || []).map((s, i) => (
                <span key={i} className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm">
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold text-amber-600 dark:text-amber-400 mb-4 flex items-center gap-2">
              <X className="w-5 h-5" />
              Missing Skills ({result.missing?.length || 0})
            </h3>
            <div className="flex flex-wrap gap-2">
              {(result.missing || []).map((s, i) => (
                <span key={i} className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 text-sm">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {result && result.match_rate !== undefined && (
        <div className="glass rounded-2xl p-6 text-center">
          <p className="text-slate-500 dark:text-slate-400">Match Rate</p>
          <p className="text-4xl font-bold text-primary-500">{result.match_rate.toFixed(0)}%</p>
        </div>
      )}
    </motion.div>
  )
}
