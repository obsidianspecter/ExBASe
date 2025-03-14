"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import ConvictForm from "@/components/ConvictForm"
import Navbar from "@/components/Navbar"
import { type Convict, getConvictById, updateConvict } from "@/lib/storage"
import { triggerStorageUpdate } from "@/lib/event-utils"
import { useToast } from "@/hooks/use-toast"

export default function EditConvictPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [convict, setConvict] = useState<Convict | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchConvict = () => {
      const data = getConvictById(params.id)
      if (data) {
        setConvict(data)
      }
      setLoading(false)
    }

    fetchConvict()
  }, [params.id])

  const handleSubmit = (data: Omit<Convict, "id">) => {
    if (convict) {
      try {
        console.log("Updating suspect with ID:", convict.id)

        const updatedConvict: Convict = {
          id: convict.id,
          ...data,
        }

        console.log("Updated suspect data:", updatedConvict)
        updateConvict(updatedConvict)

        // Trigger storage update event
        triggerStorageUpdate()

        toast({
          title: "Success",
          description: "Suspect record updated successfully",
        })

        // Add a small delay before navigation to ensure storage is updated
        setTimeout(() => {
          router.push("/")
        }, 100)
      } catch (error) {
        console.error("Error updating suspect:", error)
        toast({
          title: "Error",
          description: "Failed to update suspect record. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <p>Loading...</p>
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
            <button
              onClick={() => router.push("/")}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md"
            >
              Go Back
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Edit Suspect Record</h1>
          <p className="text-muted-foreground">Update the details of the suspect record</p>
        </div>

        <ConvictForm initialData={convict} onSubmit={handleSubmit} onCancel={() => router.push("/")} />
      </main>
    </div>
  )
}

