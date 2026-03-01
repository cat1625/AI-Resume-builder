import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import { FileText, Sparkles, Target, Save, Loader2, Eye, Lightbulb, Download } from 'lucide-react'
import { api } from '../lib/api'

interface Resume {
  id: number
  title: string
  content: string | null
  ats_score: number | null
  version: number
}

interface ScoreBreakdown {
  total_score?: number
  keyword_match?: number
  semantic_similarity?: number
  section_completeness?: number
  formatting?: number
  grammar?: number
  action_verbs?: number
  quantifiable_metrics?: number
  readability?: number
}

export default function ResumeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [resume, setResume] = useState<Resume | null>(null)
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [scoring, setScoring] = useState(false)
  const [scoreBreakdown, setScoreBreakdown] = useState<ScoreBreakdown | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (id && id !== 'new') {
      api.get(`/resumes/${id}`).then(({ data }) => setResume(data)).catch(() => navigate('/resumes')).finally(() => setLoading(false))
    } else {
      setResume({ id: 0, title: 'New Resume', content: '', ats_score: null, version: 1 })
      setLoading(false)
    }
  }, [id, navigate])

  const handleSave = async () => {
    if (!resume) return
    try {
      if (id === 'new') {
        const { data } = await api.post('/resumes/', { title: resume.title, content: resume.content })
        navigate(`/resumes/${data.id}`)
      } else {
        await api.put(`/resumes/${id}`, { title: resume.title, content: resume.content })
        setResume(r => r ? { ...r, content: resume.content } : null)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleScore = async () => {
    if (!id || id === 'new') return
    setScoring(true)
    try {
      const { data } = await api.post(`/resumes/${id}/score?job_description=${encodeURIComponent(jobDescription)}`)
      setScoreBreakdown(data)
      setResume(r => r ? { ...r, ats_score: data.total_score } : null)
    } catch (e) {
      console.error(e)
    } finally {
      setScoring(false)
    }
  }

  const generateWithAI = async () => {
    setGenerating(true)
    try {
      const { data } = await api.post('/ai/generate-resume', { prompt: aiPrompt, job_description: jobDescription })
      if (data.content) setResume(r => r ? { ...r, content: data.content } : null)
    } catch (e) {
      console.error(e)
    } finally {
      setGenerating(false)
    }
  }

  const fetchSuggestions = async () => {
    if (!resume?.content) return
    setLoadingSuggestions(true)
    setSuggestions([])
    try {
      const { data } = await api.post('/ai/suggestions', { resume_text: resume.content, job_description: jobDescription })
      setSuggestions(data.suggestions || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingSuggestions(false)
    }
  }

  const downloadReport = async () => {
    if (!id || id === 'new') return
    setDownloading(true)
    try {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams()
      if (jobDescription) params.set('job_description', jobDescription)
      const base = api.defaults.baseURL || '/api'
      const url = `${window.location.origin}${base}/resumes/${id}/report/download?${params.toString()}`
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('Download failed')
      const blob = await res.blob()
      const disposition = res.headers.get('Content-Disposition')
      const match = disposition?.match(/filename="?([^";]+)"?/)
      const filename = match ? match[1] : `ATS_Report_${resume?.title || 'Resume'}.html`
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = filename
      a.click()
      URL.revokeObjectURL(a.href)
    } catch (e) {
      console.error(e)
    } finally {
      setDownloading(false)
    }
  }

  const sixSecondPreview = resume?.content ? resume.content.split('\n').slice(0, 8).join('\n') : ''

  const radarData = scoreBreakdown ? [
    { subject: 'Keywords', value: scoreBreakdown.keyword_match ?? 0, fullMark: 100 },
    { subject: 'Semantic', value: scoreBreakdown.semantic_similarity ?? 0, fullMark: 100 },
    { subject: 'Sections', value: scoreBreakdown.section_completeness ?? 0, fullMark: 100 },
    { subject: 'Format', value: scoreBreakdown.formatting ?? 0, fullMark: 100 },
    { subject: 'Grammar', value: scoreBreakdown.grammar ?? 0, fullMark: 100 },
    { subject: 'Actions', value: scoreBreakdown.action_verbs ?? 0, fullMark: 100 },
    { subject: 'Metrics', value: scoreBreakdown.quantifiable_metrics ?? 0, fullMark: 100 },
    { subject: 'Readability', value: scoreBreakdown.readability ?? 0, fullMark: 100 },
  ] : []

  if (loading || !resume) return <div className="flex justify-center py-20"><div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full" /></div>

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid lg:grid-cols-3 gap-6"
    >
      <div className="lg:col-span-2 space-y-6">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{resume.title}</h2>
            <div className="flex flex-wrap gap-2">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} className="px-4 py-2 rounded-lg bg-primary-500 text-white font-medium flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save
              </motion.button>
              {id !== 'new' && (
                <>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleScore} disabled={scoring} className="px-4 py-2 rounded-lg bg-emerald-500 text-white font-medium flex items-center gap-2 disabled:opacity-50">
                    {scoring ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Score
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={fetchSuggestions} disabled={loadingSuggestions || !resume.content} className="px-4 py-2 rounded-lg bg-amber-500 text-white font-medium flex items-center gap-2 disabled:opacity-50">
                    {loadingSuggestions ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lightbulb className="w-4 h-4" />}
                    Suggestions
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={downloadReport} disabled={downloading} className="px-4 py-2 rounded-lg bg-slate-600 dark:bg-slate-500 text-white font-medium flex items-center gap-2 disabled:opacity-50" title="Download detailed ATS report (HTML, no API key)">
                    {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    Download Report
                  </motion.button>
                </>
              )}
            </div>
          </div>
          {id === 'new' && (
            <div className="mb-4 p-4 rounded-xl bg-primary-500/5 border border-primary-500/20">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Generate with AI</label>
              <div className="flex gap-2">
                <input
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g., 5 years Python, AWS, led team of 4..."
                  className="flex-1 p-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800"
                />
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={generateWithAI} disabled={generating} className="px-4 py-2 rounded-lg bg-primary-500 text-white font-medium flex items-center gap-2 disabled:opacity-50">
                  {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Generate
                </motion.button>
              </div>
            </div>
          )}
          <textarea
            value={resume.content || ''}
            onChange={(e) => setResume(r => r ? { ...r, content: e.target.value } : null)}
            placeholder="Paste or type your resume content here..."
            className="w-full h-96 p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 font-mono text-sm resize-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        {id !== 'new' && (
          <>
          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary-500" />
              Recruiter 6-Second Scan
            </h3>
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 font-mono text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
              {sixSecondPreview || 'Add content to preview...'}
            </div>
            <p className="text-xs text-slate-500 mt-2">What recruiters see in the first 6 seconds</p>
          </div>
          <div className="glass rounded-2xl p-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Job Description (for ATS scoring)</label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste job description to get targeted ATS score..."
              className="w-full h-32 p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm resize-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          </>
        )}
      </div>

      <div className="space-y-6">
        <div className="glass rounded-2xl p-6 sticky top-24">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary-500" />
            ATS Score
          </h3>
          {resume.ats_score !== null ? (
            <>
              <div className="text-center py-6">
                <div className={`inline-flex items-center justify-center w-24 h-24 rounded-2xl text-3xl font-bold ${
                  resume.ats_score >= 70 ? 'bg-emerald-500/20 text-emerald-600' :
                  resume.ats_score >= 50 ? 'bg-amber-500/20 text-amber-600' : 'bg-red-500/20 text-red-600'
                }`}>
                  {resume.ats_score.toFixed(0)}
                </div>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Overall Score</p>
              </div>
              {radarData.length > 0 && (
                <div className="h-64 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#94a3b8" strokeOpacity={0.3} />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: 'currentColor', fontSize: 10 }} />
                      <PolarRadiusAxis domain={[0, 100]} tick={{ fill: 'currentColor', fontSize: 10 }} />
                      <Radar name="Score" dataKey="value" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.4} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              )}
              {suggestions.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <h4 className="font-medium text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    Optimization Tips
                  </h4>
                  <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                    {suggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-500">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto text-slate-400 mb-2" />
              <p className="text-slate-500 dark:text-slate-400">No score yet</p>
              <p className="text-sm text-slate-400 mt-1">Click Score to analyze</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
