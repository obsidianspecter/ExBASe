"use client"

import { useRouter } from "next/navigation"
import ConvictForm from "@/components/ConvictForm"
import Navbar from "@/components/Navbar"
import { type Convict, addConvict, debugStorage } from "@/lib/storage"
import { triggerStorageUpdate } from "@/lib/event-utils"
import { v4 as uuidv4 } from "uuid"
import { useToast } from "@/hooks/use-toast"

export default function AddConvictPage() {
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (data: Omit<Convict, "id">) => {
    console.log("Add suspect page received form data:", JSON.stringify(data))

    try {
      // Validate required fields
      if (!data.name || !data.phone || !data.caseDetails) {
        const missingFields = []
        if (!data.name) missingFields.push("name")
        if (!data.phone) missingFields.push("phone")
        if (!data.caseDetails) missingFields.push("case details")

        const errorMsg = `Missing required fields: ${missingFields.join(", ")}`
        console.error(errorMsg)

        toast({
          title: "Validation Error",
          description: errorMsg,
          variant: "destructive",
        })
        return
      }

      // Debug localStorage before adding
      console.log("Current localStorage state before adding:")
      debugStorage()

      // Create a new convict with a unique ID
      const newConvict: Convict = {
        id: uuidv4(),
        ...data,
        createdAt: Date.now(), // Ensure createdAt is set
      }

      console.log("Prepared new suspect record:", JSON.stringify(newConvict))

      // Add the convict to storage
      await addConvict(newConvict)
      console.log("Successfully added suspect to storage")

      // Debug localStorage after adding
      console.log("Current localStorage state after adding:")
      debugStorage()

      // Show success message
      toast({
        title: "Success",
        description: "Suspect record added successfully",
      })

      // Create and dispatch a custom event for storage updates
      console.log("Dispatching storageUpdated event")
      triggerStorageUpdate()

      // Add a small delay before navigation to ensure storage is updated
      setTimeout(() => {
        // Redirect to the home page after successful submission
        console.log("Redirecting to home page")
        router.push("/")
      }, 500) // Increased delay to ensure storage update completes
    } catch (error) {
      console.error("Error adding suspect:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add suspect record. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Add New Suspect Record</h1>
          <p className="text-muted-foreground">Enter the details of the new suspect record</p>
        </div>

        <ConvictForm onSubmit={handleSubmit} onCancel={() => router.push("/")} />
      </main>
    </div>
  )
}

