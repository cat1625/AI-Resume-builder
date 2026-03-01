import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { HelpCircle, Sparkles } from 'lucide-react'
import { api } from '../lib/api'

export default function InterviewPrep() {
  const [resumes, setResumes] = useState<{ id: number; title: string }[]>([])
  const [selectedResume, setSelectedResume] = useState<number | null>(null)
  const [jobDesc, setJobDesc] = useState('')
  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState<string[]>([])

  useEffect(() => {
    api.get('/resumes/').then(({ data }) => setResumes(data))
  }, [])

  const generate = async () => {
    setLoading(true)
    setQuestions([])
    try {
      const { data } = await api.post('/ai/generate-interview-questions', {
        resume_id: selectedResume,
        job_description: jobDesc,
      })
      setQuestions(Array.isArray(data.questions) ? data.questions : [data.content || 'No questions generated'])
    } catch (e) {
      setQuestions(['Error generating questions. Ensure OPENAI_API_KEY is configured.'])
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
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Interview Question Generator</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Prepare with AI-generated interview questions</p>
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
          {loading ? 'Generating...' : 'Generate Questions'}
          <Sparkles className="w-5 h-5" />
        </motion.button>
      </div>

      {questions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary-500" />
            Interview Questions
          </h3>
          <ol className="space-y-3 list-decimal list-inside">
            {questions.map((q, i) => (
              <li key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300">
                {q.replace(/^\d+\.\s*/, '')}
              </li>
            ))}
          </ol>
        </motion.div>
      )}
    </motion.div>
  )
}
