"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Save, Plus } from "lucide-react"

export default function DataViewer({ params }: { params: { table: string } }) {
  const [columns, setColumns] = useState<any[]>([])
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [newRecord, setNewRecord] = useState<any>({})

  useEffect(() => {
    // Fetch table definition to get columns
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/tables/`)
      .then(res => res.json())
      .then(tables => {
        const tableDef = tables.find((t: any) => t.name === params.table)
        if (tableDef && tableDef.columns) {
          setColumns(tableDef.columns)
        }
      })
      .catch(console.error)

    // Fetch actual data
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/${params.table}`)
      .then(res => res.json())
      .then(data => {
        setRecords(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [params.table])

  const handleSave = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/${params.table}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRecord)
      })
      if (res.ok) {
        setIsAdding(false)
        setNewRecord({})
        // Refresh records
        const dataRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/${params.table}`)
        setRecords(await dataRes.json())
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/tables" className="p-2 bg-neutral-900 border border-neutral-800 rounded-lg hover:bg-neutral-800 transition-colors">
            <ArrowLeft className="w-5 h-5 text-neutral-400" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight capitalize">{params.table}</h1>
            <p className="text-neutral-400 mt-1">Manage data for this dynamically generated model.</p>
          </div>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Record
        </button>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden overflow-x-auto">
        {loading ? (
          <div className="p-8 text-neutral-500 text-center">Loading data...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-950 border-b border-neutral-800">
                <th className="p-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider">ID</th>
                {columns.map(c => (
                  <th key={c.id} className="p-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    {c.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {isAdding && (
                <tr className="bg-indigo-500/5">
                  <td className="p-4">
                    <span className="text-neutral-600 italic">Auto</span>
                  </td>
                  {columns.map(c => (
                    <td key={c.id} className="p-4">
                      {c.data_type === "Boolean" ? (
                        <input 
                          type="checkbox" 
                          checked={newRecord[c.name] || false}
                          onChange={e => setNewRecord({...newRecord, [c.name]: e.target.checked})}
                          className="w-4 h-4 accent-indigo-500"
                        />
                      ) : (
                        <input 
                          type={c.data_type === "Integer" || c.data_type === "Float" ? "number" : "text"}
                          value={newRecord[c.name] || ""}
                          onChange={e => setNewRecord({...newRecord, [c.name]: c.data_type === "Integer" ? parseInt(e.target.value) : e.target.value})}
                          placeholder={`Enter ${c.name}`}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-1.5 focus:outline-none focus:border-indigo-500 text-sm"
                        />
                      )}
                    </td>
                  ))}
                  <td className="p-4 w-12 text-right">
                    <button onClick={handleSave} className="text-indigo-400 hover:text-indigo-300">
                      <Save className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              )}
              {records.length === 0 && !isAdding ? (
                <tr>
                  <td colSpan={columns.length + 1} className="p-8 text-center text-neutral-500">
                    No records found in {params.table}.
                  </td>
                </tr>
              ) : (
                records.map((record, i) => (
                  <tr key={i} className="hover:bg-neutral-800/20 transition-colors">
                    <td className="p-4 text-sm text-neutral-400">{record.id}</td>
                    {columns.map(c => (
                      <td key={c.id} className="p-4 text-sm whitespace-nowrap">
                        {typeof record[c.name] === 'boolean' 
                          ? (record[c.name] ? "True" : "False") 
                          : String(record[c.name] ?? "-")}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
