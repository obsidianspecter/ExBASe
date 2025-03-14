"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { type Convict, getConvictById } from "@/lib/storage"
import Navbar from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Printer, Calendar, Phone, FileText, Tag, Download, Share2 } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { generatePDF } from "@/lib/pdf-utils"
import { useToast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function ConvictDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [convict, setConvict] = useState<Convict | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchConvict = () => {
      try {
        const data = getConvictById(params.id)
        if (data) {
          setConvict(data)
        }
        setLoading(false)
      } catch (error) {
        console.error("Error fetching suspect:", error)
        setLoading(false)
      }
    }

    fetchConvict()

    // Listen for storage events to update the data if changed in another tab
    const handleStorageChange = () => {
      fetchConvict()
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("storageUpdated", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("storageUpdated", handleStorageChange)
    }
  }, [params.id])

  const handlePrint = () => {
    window.print()
  }

  const handleExportPDF = async () => {
    if (!convict) return

    setExporting(true)
    try {
      const success = await generatePDF(convict)
      if (success) {
        toast({
          title: "Export Successful",
          description: "PDF has been generated and downloaded",
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
      setExporting(false)
    }
  }

  const handleShare = () => {
    if (!convict) return

    // Create a shareable text
    const shareText = `
Name: ${convict.name}
Phone: ${convict.phone}
Category: ${convict.category || "N/A"}
Case Details: ${convict.caseDetails}
    `.trim()

    // Copy to clipboard
    navigator.clipboard
      .writeText(shareText)
      .then(() => {
        toast({
          title: "Copied to Clipboard",
          description: "Record details copied to clipboard",
        })
      })
      .catch(() => {
        toast({
          title: "Copy Failed",
          description: "Could not copy to clipboard",
          variant: "destructive",
        })
      })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-muted mb-4"></div>
              <div className="h-4 w-48 bg-muted rounded mb-2"></div>
              <div className="h-4 w-32 bg-muted rounded"></div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!convict) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col justify-center items-center h-64">
            <h2 className="text-2xl font-bold mb-2">Record Not Found</h2>
            <p className="text-muted-foreground mb-4">The suspect record you are looking for does not exist.</p>
            <Button
              onClick={() => router.push("/")}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md"
            >
              Go Back
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => router.push("/")} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to List
            </Button>
            <h1 className="text-3xl font-bold">Suspect Details</h1>
          </div>
          <div className="print:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleShare}>Copy to Clipboard</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-0">
                {convict.image ? (
                  <img
                    src={convict.image || "/placeholder.svg"}
                    alt={`Photo of ${convict.name}`}
                    className="w-full aspect-square object-cover"
                  />
                ) : (
                  <div className="w-full aspect-square flex items-center justify-center bg-muted">
                    <FileText className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between p-4 flex-wrap gap-2 print:hidden">
                <Button variant="outline" onClick={() => router.push(`/convict/edit/${convict.id}`)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" onClick={handlePrint}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button variant="outline" onClick={handleExportPDF} disabled={exporting}>
                  <Download className="h-4 w-4 mr-2" />
                  {exporting ? "Exporting..." : "Export PDF"}
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{convict.name}</CardTitle>
                {convict.category && (
                  <Badge variant="outline" className="mt-1">
                    {convict.category}
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="flex items-start gap-2">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h3 className="font-medium">Phone Number</h3>
                      <p>{convict.phone}</p>
                    </div>
                  </div>

                  {convict.createdAt && (
                    <div className="flex items-start gap-2">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <h3 className="font-medium">Record Created</h3>
                        <p>{formatDate(convict.createdAt)}</p>
                      </div>
                    </div>
                  )}

                  {convict.tags && convict.tags.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <h3 className="font-medium">Tags</h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {convict.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-medium mb-2">Case Details</h3>
                  <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">{convict.caseDetails}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

