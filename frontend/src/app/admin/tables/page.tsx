"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, Database, ChevronRight, Edit2, Trash2 } from "lucide-react"

type DynamicTable = {
  id: number
  name: string
  description?: string
  created_at: string
}

export default function TablesOverview() {
  const [tables, setTables] = useState<DynamicTable[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/tables/`)
      .then(res => res.json())
      .then(data => {
        setTables(data)
        setLoading(false)
      })
      .catch(err => {
        console.error("Failed to fetch tables", err)
        setLoading(false)
      })
  }, [])

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Models</h1>
          <p className="text-neutral-400 mt-2">Manage your dynamic database tables and schema.</p>
        </div>
        <Link 
          href="/admin/tables/create"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Table
        </Link>
      </div>

      <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-neutral-500">Loading tables...</div>
        ) : tables.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="p-4 bg-neutral-800/50 rounded-full mb-4">
              <Database className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-medium text-neutral-200">No tables created</h3>
            <p className="text-neutral-400 mt-1 max-w-sm">You haven't created any dynamic data models yet. Get started by creating your first table.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-800">
            {tables.map(table => (
              <div key={table.id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-neutral-800/20 transition-colors group">
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-medium flex items-center gap-3">
                    <Database className="w-5 h-5 text-indigo-400" />
                    {table.name}
                  </h3>
                  {table.description && (
                    <p className="text-sm text-neutral-400">{table.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 text-neutral-400 hover:text-indigo-400 rounded-lg hover:bg-indigo-400/10 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-neutral-400 hover:text-red-400 rounded-lg hover:bg-red-400/10 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <Link 
                    href={`/admin/data/${table.name}`}
                    className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-sm font-medium rounded-lg transition-colors"
                  >
                    View Data
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
