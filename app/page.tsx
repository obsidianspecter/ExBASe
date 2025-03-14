"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { type Convict, getConvicts, debugStorage } from "@/lib/storage"
import ConvictList from "@/components/ConvictList"
import SearchBar from "@/components/SearchBar"
import Navbar from "@/components/Navbar"
import FilterSort from "@/components/FilterSort"
import StatisticsPanel from "@/components/StatisticsPanel"
import { Button } from "@/components/ui/button"
import { Download, Upload, BarChart2, FileDown } from "lucide-react"
import { exportData, importData } from "@/lib/data-utils"
import { useToast } from "@/hooks/use-toast"
import { generateBatchPDF } from "@/lib/pdf-utils"
import DashboardStats from "@/components/DashboardStats"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SplashScreen from "@/components/SplashScreen"

export default function Home() {
  const [showSplash, setShowSplash] = useState(true)
  const [convicts, setConvicts] = useState<Convict[]>([])
  const [filteredConvicts, setFilteredConvicts] = useState<Convict[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showStats, setShowStats] = useState(false)
  const [sortOption, setSortOption] = useState<string>("nameAsc")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("records")
  const [exportingPDF, setExportingPDF] = useState(false)
  const { toast } = useToast()

  // File input ref for import
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Memoize the filter and sort function to improve performance
  const applyFiltersAndSort = useCallback((data: Convict[], query: string, sort: string, category: string) => {
    // First apply category filter
    let filtered = category === "all" ? [...data] : data.filter((convict) => convict.category === category)

    // Then apply search query
    if (query.trim() !== "") {
      const queryLower = query.toLowerCase()
      filtered = filtered.filter(
        (convict) =>
          convict.name.toLowerCase().includes(queryLower) ||
          convict.phone.includes(queryLower) ||
          convict.caseDetails.toLowerCase().includes(queryLower),
      )
    }

    // Then apply sorting
    switch (sort) {
      case "nameAsc":
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "nameDesc":
        filtered.sort((a, b) => b.name.localeCompare(a.name))
        break
      case "dateAsc":
        filtered.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
        break
      case "dateDesc":
        filtered.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        break
    }

    setFilteredConvicts(filtered)
  }, [])

  useEffect(() => {
    const loadConvicts = () => {
      try {
        setIsLoading(true)
        // Debug localStorage to see what's happening
        console.log("Loading convicts from storage...")
        debugStorage()

        const data = getConvicts()
        console.log(`Loaded ${data.length} convicts from storage`)
        setConvicts(data)
        applyFiltersAndSort(data, searchQuery, sortOption, categoryFilter)
      } catch (error) {
        console.error("Error loading convicts:", error)
        toast({
          title: "Error",
          description: "Failed to load convict records",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    // Only load convicts if splash screen is dismissed
    if (!showSplash) {
      loadConvicts()
    }

    // Add event listener for storage changes
    const handleStorageChange = (event: Event) => {
      console.log("Storage event detected:", event.type)
      loadConvicts()
    }

    // Listen for both standard storage events and our custom event
    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("storageUpdated", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("storageUpdated", handleStorageChange)
    }
  }, [searchQuery, sortOption, categoryFilter, applyFiltersAndSort, toast, showSplash])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    applyFiltersAndSort(convicts, query, sortOption, categoryFilter)
  }

  const handleSortChange = (option: string) => {
    setSortOption(option)
    applyFiltersAndSort(convicts, searchQuery, option, categoryFilter)
  }

  const handleCategoryChange = (category: string) => {
    setCategoryFilter(category)
    applyFiltersAndSort(convicts, searchQuery, sortOption, category)
  }

  const handleExport = () => {
    try {
      exportData()
      toast({
        title: "Export Successful",
        description: "Your data has been exported successfully.",
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleExportPDF = async () => {
    if (filteredConvicts.length === 0) {
      toast({
        title: "No Records",
        description: "There are no records to export",
        variant: "destructive",
      })
      return
    }

    setExportingPDF(true)
    try {
      const success = await generateBatchPDF(filteredConvicts)
      if (success) {
        toast({
          title: "Export Successful",
          description: `PDF with ${filteredConvicts.length} records has been generated`,
        })
      } else {
        throw new Error("Failed to generate PDF")
      }
    } catch (error) {
      console.error("PDF generation error:", error)
      toast({
        title: "Export Failed",
        description: "Could not generate PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      setExportingPDF(false)
    }
  }

  const handleImport = () => {
    // Trigger file input click
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      importData(file)
        .then(() => {
          toast({
            title: "Import Successful",
            description: "Your data has been imported successfully.",
          })
          // Refresh data
          const data = getConvicts()
          setConvicts(data)
          applyFiltersAndSort(data, searchQuery, sortOption, categoryFilter)
        })
        .catch((error) => {
          toast({
            title: "Import Failed",
            description: error.message,
            variant: "destructive",
          })
        })
    }
    // Reset file input
    if (e.target) {
      e.target.value = ""
    }
  }

  // If splash screen is showing, only render that
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Suspect Records</h1>
          <p className="text-muted-foreground">Manage and view all suspect records in the system</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="records">Records</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          </TabsList>

          <TabsContent value="records" className="mt-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-start">
              <div className="w-full md:w-2/3">
                <SearchBar onSearch={handleSearch} />
              </div>
              <div className="flex gap-2 w-full md:w-auto flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowStats(!showStats)}
                  className="flex-1 md:flex-none"
                >
                  <BarChart2 className="h-4 w-4 mr-2" />
                  {showStats ? "Hide Stats" : "Show Stats"}
                </Button>
                <Button variant="outline" size="sm" onClick={handleExport} className="flex-1 md:flex-none">
                  <Download className="h-4 w-4 mr-2" />
                  Export JSON
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportPDF}
                  className="flex-1 md:flex-none"
                  disabled={exportingPDF || filteredConvicts.length === 0}
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  {exportingPDF ? "Exporting..." : "Export PDF"}
                </Button>
                <Button variant="outline" size="sm" onClick={handleImport} className="flex-1 md:flex-none">
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
              </div>
            </div>

            {showStats && convicts.length > 0 && (
              <div className="mb-6">
                <StatisticsPanel convicts={convicts} />
              </div>
            )}

            <FilterSort
              onSortChange={handleSortChange}
              onCategoryChange={handleCategoryChange}
              sortOption={sortOption}
              categoryFilter={categoryFilter}
            />

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-pulse text-center">
                  <p>Loading records...</p>
                </div>
              </div>
            ) : filteredConvicts.length > 0 ? (
              <ConvictList convicts={filteredConvicts} />
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium mb-2">No records found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || categoryFilter !== "all"
                    ? "Try different search terms or filters"
                    : "Add a new suspect record to get started"}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="dashboard" className="mt-6">
            <DashboardStats convicts={convicts} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

