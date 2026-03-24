"use client"
import React, { useState, useEffect } from 'react'
import GridLayout from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

import BarChartWidget from '@/components/widgets/BarChartWidget'
import WidgetWrapper from '@/components/widgets/WidgetWrapper'
import { LayoutDashboard, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function PublicDashboard() {
  const [postsData, setPostsData] = useState<any[]>([])
  
  // Dashboard layout configuration
  const layout = [
    { i: 'overview', x: 0, y: 0, w: 4, h: 2, static: false },
    { i: 'chart1', x: 4, y: 0, w: 8, h: 4, static: false },
    { i: 'datatable', x: 0, y: 2, w: 12, h: 4, static: false }
  ]

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/posts`)
      .then(res => res.json())
      .then(data => setPostsData(Array.isArray(data) ? data : []))
      .catch(console.error)
  }, [])

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 p-4 sm:p-8">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/" className="p-2 -ml-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                <LayoutDashboard className="w-8 h-8 text-indigo-400" />
                Executive Dashboard
              </h1>
            </div>
            <p className="text-neutral-400">Interactive iPad-style dashboard. Move, resize and export widgets freely.</p>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <span className="flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Synced
            </span>
          </div>
        </div>

        {/* Dashboard Canvas */}
        <div className="relative w-full rounded-3xl bg-neutral-900/30 border border-neutral-800/50 p-2 overflow-hidden shadow-2xl">
          <GridLayout 
            className="layout" 
            layout={layout} 
            rowHeight={100} 
            width={1200} // This would normally use a ResponsiveGridLayout but for simplicity we fix it or manage it via resize listeners
            isDraggable={true}
            isResizable={true}
            draggableHandle=".handle"
            margin={[16, 16]}
          >
            {/* Widget 1: Metric */}
            <div key="overview">
              <WidgetWrapper title="Total Posts Registered" data={postsData}>
                <div className="w-full h-full flex flex-col justify-center items-center gap-2">
                  <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-purple-500">
                    {postsData.length}
                  </h2>
                  <p className="text-neutral-400 font-medium">Active entries in database</p>
                </div>
              </WidgetWrapper>
            </div>

            {/* Widget 2: Chart */}
            <div key="chart1">
              <BarChartWidget 
                title="Post Views Distribution" 
                data={postsData} 
                dataKeyX="title" 
                dataKeyY="views" 
                color="#6366f1"
              />
            </div>

            {/* Widget 3: Data Grid Extractor */}
            <div key="datatable">
              <WidgetWrapper title="Detailed Data View" data={postsData}>
                <div className="w-full h-full overflow-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead className="sticky top-0 bg-neutral-950 z-10">
                      <tr>
                        <th className="p-3 text-neutral-400 font-medium border-b border-neutral-800">ID</th>
                        <th className="p-3 text-neutral-400 font-medium border-b border-neutral-800">Title</th>
                        <th className="p-3 text-neutral-400 font-medium border-b border-neutral-800">Views</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/50">
                      {postsData.map(post => (
                        <tr key={post.id} className="hover:bg-neutral-800/30">
                          <td className="p-3 text-neutral-500">#{post.id}</td>
                          <td className="p-3 text-neutral-200">{post.title}</td>
                          <td className="p-3 text-indigo-400 font-medium">{post.views}</td>
                        </tr>
                      ))}
                      {postsData.length === 0 && (
                        <tr><td colSpan={3} className="p-6 text-center text-neutral-500">No data available</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </WidgetWrapper>
            </div>
          </GridLayout>
        </div>
      </div>
    </div>
  )
}
