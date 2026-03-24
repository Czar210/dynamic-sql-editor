"use client"
import React, { useRef, useState } from 'react'
import { MoreHorizontal, Download, FileText, Table as TableIcon, Image as ImageIcon } from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'

interface WidgetWrapperProps {
  title: string
  children: React.ReactNode
  data?: any[] // Data passed for excel/csv export
}

export default function WidgetWrapper({ title, children, data }: WidgetWrapperProps) {
  const widgetRef = useRef<HTMLDivElement>(null)
  const [showMenu, setShowMenu] = useState(false)

  const exportJPEG = async () => {
    if (!widgetRef.current) return
    const canvas = await html2canvas(widgetRef.current, { scale: 2, backgroundColor: "#171717" })
    const link = document.createElement('a')
    link.download = `${title.replace(/\s+/g, '_')}.jpeg`
    link.href = canvas.toDataURL('image/jpeg')
    link.click()
    setShowMenu(false)
  }

  const exportPDF = async () => {
    if (!widgetRef.current) return
    const canvas = await html2canvas(widgetRef.current, { scale: 2, backgroundColor: "#171717" })
    const imgData = canvas.toDataURL('image/jpeg')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight)
    pdf.save(`${title.replace(/\s+/g, '_')}.pdf`)
    setShowMenu(false)
  }

  const exportExcel = () => {
    if (!data || data.length === 0) return alert("No data to export")
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data")
    XLSX.writeFile(workbook, `${title.replace(/\s+/g, '_')}.xlsx`)
    setShowMenu(false)
  }

  const exportCSV = () => {
    if (!data || data.length === 0) return alert("No data to export")
    const worksheet = XLSX.utils.json_to_sheet(data)
    const csv = XLSX.utils.sheet_to_csv(worksheet)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `${title.replace(/\s+/g, '_')}.csv`
    link.click()
    setShowMenu(false)
  }

  return (
    <div 
      ref={widgetRef} 
      className="w-full h-full bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col overflow-hidden relative group"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-neutral-900/80 handle cursor-move">
        <h3 className="font-semibold text-neutral-200 text-sm tracking-wide">{title}</h3>
        
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4 cursor-pointer" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-neutral-950 border border-neutral-800 rounded-xl shadow-xl shadow-black/50 overflow-hidden z-50">
              <div className="px-3 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider bg-neutral-900/50">Export Visuals</div>
              <button onClick={exportJPEG} className="w-full text-left px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-indigo-400" /> Save as JPEG
              </button>
              <button onClick={exportPDF} className="w-full text-left px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-rose-400" /> Download PDF
              </button>
              
              <div className="px-3 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider bg-neutral-900/50 border-t border-neutral-800">Export Data</div>
              <button onClick={exportExcel} className="w-full text-left px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-emerald-400" /> Export XLSX
              </button>
              <button onClick={exportCSV} className="w-full text-left px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-neutral-400" /> Download CSV
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Widget Content */}
      <div className="flex-1 p-4 relative min-h-0 bg-neutral-950/20">
        {children}
      </div>
    </div>
  )
}
