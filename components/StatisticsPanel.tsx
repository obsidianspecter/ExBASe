"use client"

import type { Convict } from "@/lib/storage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

interface StatisticsPanelProps {
  convicts: Convict[]
}

// Colors for the charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

export default function StatisticsPanel({ convicts }: StatisticsPanelProps) {
  // Calculate category distribution
  const categoryCount: Record<string, number> = {}
  convicts.forEach((convict) => {
    const category = convict.category || "Uncategorized"
    categoryCount[category] = (categoryCount[category] || 0) + 1
  })

  const categoryData = Object.entries(categoryCount).map(([name, value]) => ({
    name,
    value,
  }))

  // Calculate records added over time (by month)
  const recordsByMonth: Record<string, number> = {}
  convicts.forEach((convict) => {
    if (convict.createdAt) {
      const date = new Date(convict.createdAt)
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`
      recordsByMonth[monthYear] = (recordsByMonth[monthYear] || 0) + 1
    }
  })

  const timelineData = Object.entries(recordsByMonth)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => {
      const [aMonth, aYear] = a.name.split("/")
      const [bMonth, bYear] = b.name.split("/")
      return (
        new Date(Number(aYear), Number(aMonth) - 1).getTime() - new Date(Number(bYear), Number(bMonth) - 1).getTime()
      )
    })

  // Calculate tag frequency
  const tagCount: Record<string, number> = {}
  convicts.forEach((convict) => {
    if (convict.tags) {
      convict.tags.forEach((tag) => {
        tagCount[tag] = (tagCount[tag] || 0) + 1
      })
    }
  })

  const tagData = Object.entries(tagCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5) // Top 5 tags

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Records by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No category data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Records Added Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {timelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No timeline data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

