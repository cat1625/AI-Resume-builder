import { useState } from 'react'
import { motion } from 'framer-motion'
import { Linkedin, Sparkles } from 'lucide-react'

export default function LinkedInAnalyzer() {
  const [profileUrl, setProfileUrl] = useState('')
  const [loading, setLoading] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">LinkedIn Profile Analyzer</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Analyze your LinkedIn profile for resume optimization</p>
      </div>

      <div className="glass rounded-2xl p-8 text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#0A66C2]/10 flex items-center justify-center mb-4">
          <Linkedin className="w-8 h-8 text-[#0A66C2]" />
        </div>
        <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Coming Soon</h3>
        <p className="text-slate-500 dark:text-slate-400 mb-6">Paste your LinkedIn profile URL to get optimization suggestions and ATS compatibility tips.</p>
        <input
          type="url"
          value={profileUrl}
          onChange={(e) => setProfileUrl(e.target.value)}
          placeholder="https://linkedin.com/in/yourprofile"
          className="w-full max-w-md mx-auto block p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 mb-4"
          disabled
        />
        <button disabled className="px-6 py-3 rounded-xl bg-slate-300 dark:bg-slate-600 text-slate-500 cursor-not-allowed flex items-center gap-2 mx-auto">
          <Sparkles className="w-5 h-5" />
          Analyze (Coming Soon)
        </button>
      </div>
    </motion.div>
  )
}
