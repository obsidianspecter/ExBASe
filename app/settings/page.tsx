"use client"

import { useState } from "react"
import Navbar from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, Download, HardDrive, Trash2, Upload } from "lucide-react"
import { exportData, importData } from "@/lib/data-utils"
import { getConvicts, saveConvicts } from "@/lib/storage"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useTheme } from "next-themes"

export default function SettingsPage() {
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  // Settings state
  const [settings, setSettings] = useState({
    autoBackup: false,
    confirmDelete: true,
    showStatsByDefault: false,
  })

  const handleExportData = () => {
    setIsExporting(true)
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
    } finally {
      setIsExporting(false)
    }
  }

  const handleImportData = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        setIsImporting(true)
        importData(file)
          .then(() => {
            toast({
              title: "Import Successful",
              description: "Your data has been imported successfully.",
            })
            // Trigger a storage event so other tabs can update
            window.dispatchEvent(new Event("storageUpdated"))
          })
          .catch((error) => {
            toast({
              title: "Import Failed",
              description: error.message,
              variant: "destructive",
            })
          })
          .finally(() => {
            setIsImporting(false)
          })
      }
    }

    input.click()
  }

  const handleDeleteAllData = () => {
    try {
      // Clear all data
      saveConvicts([])

      // Trigger a storage event so other tabs can update
      window.dispatchEvent(new Event("storageUpdated"))

      toast({
        title: "Data Deleted",
        description: "All records have been deleted successfully.",
      })

      setShowDeleteDialog(false)
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete data. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSettingChange = (key: keyof typeof settings, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))

    // In a real app, you would save these settings to localStorage or a database
    toast({
      title: "Settings Updated",
      description: "Your preferences have been saved.",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your application settings and preferences</p>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="data">Data Management</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Manage your general application preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="confirm-delete">Confirm Delete</Label>
                    <p className="text-sm text-muted-foreground">Show confirmation dialog when deleting records</p>
                  </div>
                  <Switch
                    id="confirm-delete"
                    checked={settings.confirmDelete}
                    onCheckedChange={(checked) => handleSettingChange("confirmDelete", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-stats">Show Statistics by Default</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically show statistics panel on the records page
                    </p>
                  </div>
                  <Switch
                    id="show-stats"
                    checked={settings.showStatsByDefault}
                    onCheckedChange={(checked) => handleSettingChange("showStatsByDefault", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Data Backup & Restore</CardTitle>
                <CardDescription>Export and import your data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-backup">Automatic Backup</Label>
                    <p className="text-sm text-muted-foreground">Automatically backup your data when making changes</p>
                  </div>
                  <Switch
                    id="auto-backup"
                    checked={settings.autoBackup}
                    onCheckedChange={(checked) => handleSettingChange("autoBackup", checked)}
                  />
                </div>

                <div className="grid gap-2 pt-4">
                  <h3 className="text-sm font-medium">Manual Backup & Restore</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={handleExportData}
                      disabled={isExporting}
                      className="flex items-center"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      {isExporting ? "Exporting..." : "Export Data"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleImportData}
                      disabled={isImporting}
                      className="flex items-center"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {isImporting ? "Importing..." : "Import Data"}
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  className="w-full flex items-center"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete All Data
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Storage Information</CardTitle>
                <CardDescription>View your local storage usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <HardDrive className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Records: {getConvicts().length}</p>
                    <p className="text-sm text-muted-foreground">Data is stored locally in your browser</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Theme Settings</CardTitle>
                <CardDescription>Customize the application appearance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="theme">Theme</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={theme === "light" ? "default" : "outline"}
                      onClick={() => setTheme("light")}
                      className="justify-start"
                    >
                      Light
                    </Button>
                    <Button
                      variant={theme === "dark" ? "default" : "outline"}
                      onClick={() => setTheme("dark")}
                      className="justify-start"
                    >
                      Dark
                    </Button>
                    <Button
                      variant={theme === "system" ? "default" : "outline"}
                      onClick={() => setTheme("system")}
                      className="justify-start"
                    >
                      System
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Delete All Data
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete all convict records? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAllData} className="bg-destructive text-destructive-foreground">
              Delete All Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

