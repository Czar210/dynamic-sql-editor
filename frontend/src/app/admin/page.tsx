import { Database, TrendingUp, Users, Activity } from "lucide-react"

export default function AdminDashboard() {
  const stats = [
    { label: "Total Tables", value: "3", icon: Database, trend: "+1 this week", color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Active Records", value: "1,204", icon: Users, trend: "+12% this month", color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { label: "API Requests", value: "45.2k", icon: Activity, trend: "+5% vs last week", color: "text-purple-400", bg: "bg-purple-400/10" },
    { label: "Uptime", value: "99.9%", icon: TrendingUp, trend: "Stable", color: "text-indigo-400", bg: "bg-indigo-400/10" },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-neutral-400 mt-2">Welcome to your headless CMS dynamic panel.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800/50 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <div>
              <p className="text-neutral-400 text-sm font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
              <p className="text-sm text-neutral-500 mt-2">{stat.trend}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/50 min-h-[300px]">
          <h3 className="font-semibold mb-4">Recent Schema Changes</h3>
          <div className="space-y-4">
            <p className="text-sm text-neutral-400">Posts table generated successfully.</p>
            <p className="text-sm text-neutral-400">Users table was modified (added 'avatar_url').</p>
          </div>
        </div>
        <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/50 min-h-[300px]">
          <h3 className="font-semibold mb-4">System Status</h3>
          <p className="text-sm text-neutral-400">Environment: Vercel Production Preview</p>
          <p className="text-sm text-neutral-400">Database: SQLite Local (Active)</p>
        </div>
      </div>
    </div>
  )
}
