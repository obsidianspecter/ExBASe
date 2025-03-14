"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { type Convict, deleteConvict } from "@/lib/storage"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Edit, Trash2, Phone, FileText, AlertCircle, Eye } from "lucide-react"
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
import { formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { triggerStorageUpdate } from "@/lib/event-utils"

interface ConvictListProps {
  convicts: Convict[]
}

export default function ConvictList({ convicts }: ConvictListProps) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showBulkDelete, setShowBulkDelete] = useState(false)
  const { toast } = useToast()

  const handleDelete = () => {
    if (deleteId) {
      try {
        console.log("Deleting convict with ID:", deleteId)
        deleteConvict(deleteId)
        setDeleteId(null)

        // Trigger storage update event
        triggerStorageUpdate()

        toast({
          title: "Record Deleted",
          description: "The convict record has been deleted successfully.",
        })
      } catch (error) {
        console.error("Error deleting convict:", error)
        toast({
          title: "Delete Failed",
          description: "Failed to delete the record. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleBulkDelete = () => {
    try {
      console.log(`Deleting ${selectedIds.size} convicts`)
      selectedIds.forEach((id) => {
        deleteConvict(id)
      })

      setSelectedIds(new Set())
      setShowBulkDelete(false)

      // Trigger storage update event
      triggerStorageUpdate()

      toast({
        title: "Records Deleted",
        description: `${selectedIds.size} records have been deleted successfully.`,
      })
    } catch (error) {
      console.error("Error bulk deleting convicts:", error)
      toast({
        title: "Delete Failed",
        description: "Failed to delete the selected records. Please try again.",
        variant: "destructive",
      })
    }
  }

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const selectAll = () => {
    if (selectedIds.size === convicts.length) {
      // Deselect all
      setSelectedIds(new Set())
    } else {
      // Select all
      setSelectedIds(new Set(convicts.map((c) => c.id)))
    }
  }

  return (
    <>
      {convicts.length > 0 && (
        <div className="mb-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Checkbox
              id="select-all"
              checked={selectedIds.size > 0 && selectedIds.size === convicts.length}
              onCheckedChange={selectAll}
            />
            <label htmlFor="select-all" className="text-sm font-medium">
              Select All
            </label>
          </div>

          {selectedIds.size > 0 && (
            <Button variant="destructive" size="sm" onClick={() => setShowBulkDelete(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected ({selectedIds.size})
            </Button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {convicts.map((convict) => (
          <Card key={convict.id} className="overflow-hidden">
            <div className="aspect-video relative bg-muted">
              {convict.image ? (
                <img
                  src={convict.image || "/placeholder.svg"}
                  alt={`Photo of ${convict.name}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <FileText className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <div className="absolute top-2 left-2">
                <Checkbox
                  checked={selectedIds.has(convict.id)}
                  onCheckedChange={() => toggleSelect(convict.id)}
                  className="bg-background/80 border-background/80"
                />
              </div>
              {convict.category && (
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-background/80">
                    {convict.category}
                  </Badge>
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <h3 className="text-xl font-bold mb-2 truncate">{convict.name}</h3>
              <div className="flex items-center text-muted-foreground mb-2">
                <Phone className="h-4 w-4 mr-2" />
                <span>{convict.phone}</span>
              </div>
              {convict.createdAt && (
                <div className="text-xs text-muted-foreground mb-2">Added: {formatDate(convict.createdAt)}</div>
              )}
              <p className="text-sm line-clamp-3">{convict.caseDetails}</p>
              {convict.tags && convict.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {convict.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between">
              <Button variant="outline" size="sm" onClick={() => router.push(`/convict/${convict.id}`)}>
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => router.push(`/convict/edit/${convict.id}`)}>
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
                <Button variant="destructive" size="sm" onClick={() => setDeleteId(convict.id)}>
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this convict record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showBulkDelete} onOpenChange={setShowBulkDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Confirm Bulk Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedIds.size} convict records? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground">
              Delete {selectedIds.size} Records
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

