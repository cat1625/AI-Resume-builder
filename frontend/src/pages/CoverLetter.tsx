import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileCheck, Sparkles } from 'lucide-react'
import { api } from '../lib/api'

export default function CoverLetter() {
  const [resumes, setResumes] = useState<{ id: number; title: string }[]>([])
  const [selectedResume, setSelectedResume] = useState<number | null>(null)
  const [jobDesc, setJobDesc] = useState('')
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')

  useEffect(() => {
    api.get('/resumes/').then(({ data }) => setResumes(data))
  }, [])

  const generate = async () => {
    setLoading(true)
    setContent('')
    try {
      const { data } = await api.post('/ai/generate-cover-letter', {
        resume_id: selectedResume,
        job_description: jobDesc,
      })
      setContent(data.content || '')
    } catch (e) {
      setContent('Error generating cover letter. Ensure OPENAI_API_KEY is configured.')
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
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">AI Cover Letter Generator</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Generate personalized cover letters</p>
      </div>

      <div className="glass rounded-2xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select Resume</label>
          <select
            value={selectedResume || ''}
            onChange={(e) => setSelectedResume(e.target.value ? Number(e.target.value) : null)}
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary-500"
          >
            <option value="">-- Select --</option>
            {resumes.map((r) => (
              <option key={r.id} value={r.id}>{r.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Job Description</label>
          <textarea
            value={jobDesc}
            onChange={(e) => setJobDesc(e.target.value)}
            placeholder="Paste the job description..."
            className="w-full h-32 p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 resize-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={generate}
          disabled={loading}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Cover Letter'}
          <Sparkles className="w-5 h-5" />
        </motion.button>
      </div>

      {content && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-primary-500" />
            Generated Cover Letter
          </h3>
          <div className="prose dark:prose-invert max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-slate-700 dark:text-slate-300">{content}</pre>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
