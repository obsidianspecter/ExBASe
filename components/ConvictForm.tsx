"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import type { Convict } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Upload, X, Camera, Plus, Loader2 } from "lucide-react"

interface ConvictFormProps {
  initialData?: Convict
  onSubmit: (data: Omit<Convict, "id">) => void
  onCancel: () => void
}

type FormData = Omit<Convict, "id">

// Predefined categories
const CATEGORIES = ["Theft", "Assault", "Fraud", "Drug Offense", "Homicide", "Other"]

export default function ConvictForm({ initialData, onSubmit, onCancel }: ConvictFormProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: initialData || {
      name: "",
      phone: "",
      caseDetails: "",
      image: "",
      category: "",
      tags: [],
      createdAt: Date.now(),
    },
  })

  const category = watch("category")

  useEffect(() => {
    if (initialData?.image) {
      setImagePreview(initialData.image)
    }
    if (initialData?.tags) {
      setTags(initialData.tags)
    }
  }, [initialData])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setImagePreview(base64String)
        setValue("image", base64String)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImagePreview(null)
    setValue("image", "")
  }

  const handleCategoryChange = (value: string) => {
    setValue("category", value)
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()]
      setTags(newTags)
      setValue("tags", newTags)
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove)
    setTags(newTags)
    setValue("tags", newTags)
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    }
  }

  const processSubmit = async (data: FormData) => {
    try {
      setFormError(null)
      console.log("Form submission started with data:", JSON.stringify(data))
      setIsSubmitting(true)

      // Validate required fields
      if (!data.name || !data.phone || !data.caseDetails) {
        const missingFields = []
        if (!data.name) missingFields.push("name")
        if (!data.phone) missingFields.push("phone")
        if (!data.caseDetails) missingFields.push("case details")

        const errorMsg = `Missing required fields: ${missingFields.join(", ")}`
        console.error(errorMsg)
        setFormError(errorMsg)
        return
      }

      // Ensure createdAt is set if this is a new record
      if (!initialData) {
        data.createdAt = Date.now()
        console.log("Setting createdAt for new record:", data.createdAt)
      }

      // Make sure tags are included
      data.tags = tags
      console.log("Final form data with tags:", JSON.stringify(data))

      // Call the onSubmit callback with the form data
      await onSubmit(data)
      console.log("Form submission completed successfully")
    } catch (error) {
      console.error("Error submitting form:", error)
      setFormError(error instanceof Error ? error.message : "An unknown error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(processSubmit, (errors) => {
        console.error("Form validation errors:", errors)
        setFormError("Please check the form for errors")
      })}
      className="space-y-6 max-w-2xl mx-auto"
    >
      {formError && <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">{formError}</div>}

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" placeholder="Enter full name" {...register("name", { required: "Name is required" })} />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            placeholder="Enter phone number"
            {...register("phone", {
              required: "Phone number is required",
              pattern: {
                value: /^[0-9+-]+$/,
                message: "Please enter a valid phone number",
              },
            })}
          />
          {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="category">Case Category</Label>
          <Select value={category} onValueChange={handleCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="tags">Tags</Label>
          <div className="flex gap-2">
            <Input
              id="tags"
              placeholder="Add tags and press Enter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
            />
            <Button type="button" size="icon" onClick={addTag}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="rounded-full h-4 w-4 inline-flex items-center justify-center hover:bg-muted"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="caseDetails">Case Details</Label>
          <Textarea
            id="caseDetails"
            placeholder="Enter case details"
            rows={5}
            {...register("caseDetails", { required: "Case details are required" })}
          />
          {errors.caseDetails && <p className="text-sm text-destructive">{errors.caseDetails.message}</p>}
        </div>

        <div className="grid gap-2">
          <Label>Photo</Label>
          <div className="flex flex-col gap-4">
            {imagePreview ? (
              <Card className="relative overflow-hidden">
                <CardContent className="p-0">
                  <img src={imagePreview || "/placeholder.svg"} alt="Preview" className="w-full h-48 object-cover" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 bg-muted/50">
                <Camera className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground text-center">Drag and drop an image or click to browse</p>
                <div className="mt-2">
                  <Label
                    htmlFor="image-upload"
                    className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Image
                  </Label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>
              </div>
            )}
            <input type="hidden" {...register("image")} />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {initialData ? "Updating..." : "Saving..."}
            </>
          ) : initialData ? (
            "Update Record"
          ) : (
            "Save Record"
          )}
        </Button>
      </div>
    </form>
  )
}

