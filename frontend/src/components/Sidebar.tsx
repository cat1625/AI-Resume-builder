import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Target,
  FileCheck,
  HelpCircle,
  Linkedin,
  Settings,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import clsx from 'clsx'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/resumes', icon: FileText, label: 'Resumes' },
  { to: '/job-analyzer', icon: Briefcase, label: 'Job Analyzer' },
  { to: '/skill-gap', icon: Target, label: 'Skill Gap' },
  { to: '/cover-letter', icon: FileCheck, label: 'Cover Letter' },
  { to: '/interview-prep', icon: HelpCircle, label: 'Interview Prep' },
  { to: '/linkedin', icon: Linkedin, label: 'LinkedIn' },
]

export default function Sidebar() {
  const { user } = useAuth()

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 glass border-r border-slate-200/50 dark:border-slate-700/50 z-40">
      <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-violet flex items-center justify-center text-white font-bold shadow-lg">
            AI
          </div>
          <div>
            <h1 className="font-bold text-slate-900 dark:text-white">Resume Builder</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">ATS Scoring</p>
          </div>
        </motion.div>
      </div>
      <nav className="p-4 space-y-1">
        {navItems.map((item, i) => (
          <motion.div
            key={item.to}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 font-medium'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          </motion.div>
        ))}
        {user?.role === 'admin' && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                isActive ? 'bg-amber-500/10 text-amber-600' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              )
            }
          >
            <Settings className="w-5 h-5" />
            Admin
          </NavLink>
        )}
      </nav>
    </aside>
  )
}
