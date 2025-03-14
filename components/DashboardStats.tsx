"use client"

import { useState } from "react"
import type { Convict } from "@/lib/storage"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { formatDate } from "@/lib/utils"

interface DashboardStatsProps {
  convicts: Convict[]
}

// Colors for the charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

export default function DashboardStats({ convicts }: DashboardStatsProps) {
  const [timeRange, setTimeRange] = useState<"all" | "month" | "week">("all")

  // Filter convicts based on time range
  const filteredConvicts = convicts.filter((convict) => {
    if (timeRange === "all") return true

    const now = Date.now()
    const createdAt = convict.createdAt || 0
    const daysDiff = (now - createdAt) / (1000 * 60 * 60 * 24)

    if (timeRange === "month") return daysDiff <= 30
    if (timeRange === "week") return daysDiff <= 7

    return true
  })

  // Calculate category distribution
  const categoryCount: Record<string, number> = {}
  filteredConvicts.forEach((convict) => {
    const category = convict.category || "Uncategorized"
    categoryCount[category] = (categoryCount[category] || 0) + 1
  })

  const categoryData = Object.entries(categoryCount).map(([name, value]) => ({
    name,
    value,
  }))

  // Calculate tag distribution
  const tagCount: Record<string, number> = {}
  filteredConvicts.forEach((convict) => {
    if (convict.tags) {
      convict.tags.forEach((tag) => {
        tagCount[tag] = (tagCount[tag] || 0) + 1
      })
    }
  })

  const tagData = Object.entries(tagCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10) // Top 10 tags

  // Calculate records added over time (by day)
  const recordsByDay: Record<string, number> = {}
  filteredConvicts.forEach((convict) => {
    if (convict.createdAt) {
      const date = new Date(convict.createdAt)
      const dayStr = date.toISOString().split("T")[0]
      recordsByDay[dayStr] = (recordsByDay[dayStr] || 0) + 1
    }
  })

  const timelineData = Object.entries(recordsByDay)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(-30) // Last 30 days

  // Calculate recent activity
  const recentConvicts = [...filteredConvicts].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 5) // Last 5 records

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dashboard Overview</h2>
        <Tabs value={timeRange} onValueChange={setTimeRange as any}>
          <TabsList>
            <TabsTrigger value="all">All Time</TabsTrigger>
            <TabsTrigger value="month">Last 30 Days</TabsTrigger>
            <TabsTrigger value="week">Last 7 Days</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Records</CardTitle>
            <CardDescription>Number of convict records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{filteredConvicts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Categories</CardTitle>
            <CardDescription>Number of different categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{Object.keys(categoryCount).length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Tags</CardTitle>
            <CardDescription>Number of unique tags</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{Object.keys(tagCount).length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <Legend />
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

      <Card>
        <CardHeader>
          <CardTitle>Top Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {tagData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tagData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No tag data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recentConvicts.length > 0 ? (
            <div className="space-y-4">
              {recentConvicts.map((convict) => (
                <div key={convict.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <h3 className="font-medium">{convict.name}</h3>
                    <p className="text-sm text-muted-foreground">{convict.category || "Uncategorized"}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {convict.createdAt ? formatDate(convict.createdAt) : "Unknown date"}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">No recent activity</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

