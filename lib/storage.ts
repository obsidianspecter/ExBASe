export interface Convict {
  id: string
  name: string
  phone: string
  caseDetails: string
  image?: string
  category?: string
  tags?: string[]
  createdAt?: number
}

const STORAGE_KEY = "convicts"

/**
 * Get all convicts from localStorage
 */
export const getConvicts = (): Convict[] => {
  if (typeof window === "undefined") {
    console.log("getConvicts: window is undefined, returning empty array")
    return []
  }

  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) {
      console.log("getConvicts: No data in localStorage, returning empty array")
      return []
    }

    const parsed = JSON.parse(data)
    if (!Array.isArray(parsed)) {
      console.error("getConvicts: Data is not an array, returning empty array")
      return []
    }

    return parsed
  } catch (error) {
    console.error("Error getting convicts from localStorage:", error)
    return []
  }
}

/**
 * Get a specific convict by ID
 */
export const getConvictById = (id: string): Convict | null => {
  const convicts = getConvicts()
  return convicts.find((convict) => convict.id === id) || null
}

/**
 * Add a new convict to localStorage
 */
export const addConvict = (convict: Convict): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      console.error("Cannot access localStorage: window is undefined")
      reject(new Error("Cannot access localStorage: window is undefined"))
      return
    }

    try {
      // Validate required fields
      if (!convict.id) {
        console.error("Missing required field: id")
        reject(new Error("Missing required field: id"))
        return
      }

      if (!convict.name) {
        console.error("Missing required field: name")
        reject(new Error("Missing required field: name"))
        return
      }

      if (!convict.phone) {
        console.error("Missing required field: phone")
        reject(new Error("Missing required field: phone"))
        return
      }

      if (!convict.caseDetails) {
        console.error("Missing required field: caseDetails")
        reject(new Error("Missing required field: caseDetails"))
        return
      }

      // Get current convicts
      let convicts = []
      try {
        const data = localStorage.getItem(STORAGE_KEY)
        convicts = data ? JSON.parse(data) : []
        console.log(`Current convicts in storage: ${convicts.length}`)
      } catch (parseError) {
        console.error("Error parsing existing convicts:", parseError)
        // If there's an error parsing, start with an empty array
        convicts = []
      }

      // Check for duplicate ID
      const existingIndex = convicts.findIndex((c) => c.id === convict.id)
      if (existingIndex >= 0) {
        console.log("Updating existing convict with ID:", convict.id)
        convicts[existingIndex] = convict
      } else {
        console.log("Adding new convict with ID:", convict.id)
        convicts.push(convict)
      }

      // Save to localStorage
      const jsonData = JSON.stringify(convicts)
      try {
        localStorage.setItem(STORAGE_KEY, jsonData)
        console.log("Successfully saved to localStorage, new count:", convicts.length)
      } catch (storageError) {
        console.error("Error saving to localStorage:", storageError)

        // Try to handle quota exceeded error
        if (
          storageError instanceof DOMException &&
          (storageError.name === "QuotaExceededError" || storageError.name === "NS_ERROR_DOM_QUOTA_REACHED")
        ) {
          // If the error is due to quota exceeded, try to remove the image to save space
          if (convict.image) {
            console.log("Quota exceeded. Trying to save without image...")
            const convictWithoutImage = { ...convict, image: "" }

            // Replace the convict in the array
            if (existingIndex >= 0) {
              convicts[existingIndex] = convictWithoutImage
            } else {
              // Remove the last added item and add the new one without image
              convicts.pop()
              convicts.push(convictWithoutImage)
            }

            // Try saving again
            localStorage.setItem(STORAGE_KEY, JSON.stringify(convicts))
            console.log("Saved without image due to storage limitations")
            resolve()
            return
          }
        }

        reject(storageError)
        return
      }

      // Debug the current state after saving
      debugStorage()

      resolve()
    } catch (error) {
      console.error("Error adding convict to localStorage:", error)
      reject(error)
    }
  })
}

/**
 * Update an existing convict in localStorage
 */
export const updateConvict = (updatedConvict: Convict): void => {
  if (typeof window === "undefined") return

  try {
    // Validate required fields
    if (!updatedConvict.id || !updatedConvict.name || !updatedConvict.phone || !updatedConvict.caseDetails) {
      throw new Error("Missing required fields for convict record")
    }

    const convicts = getConvicts()
    const updatedConvicts = convicts.map((convict) => (convict.id === updatedConvict.id ? updatedConvict : convict))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConvicts))

    // Debug after update
    console.log(`Updated convict with ID: ${updatedConvict.id}`)
    debugStorage()
  } catch (error) {
    console.error("Error updating convict in localStorage:", error)
    throw error
  }
}

/**
 * Delete a convict from localStorage
 */
export const deleteConvict = (id: string): void => {
  if (typeof window === "undefined") return

  try {
    const convicts = getConvicts()
    const filteredConvicts = convicts.filter((convict) => convict.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredConvicts))

    // Debug after delete
    console.log(`Deleted convict with ID: ${id}`)
    debugStorage()
  } catch (error) {
    console.error("Error deleting convict from localStorage:", error)
    throw error
  }
}

/**
 * Save all convicts to localStorage
 */
export const saveConvicts = (convicts: Convict[]): void => {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(convicts))
    console.log(`Saved ${convicts.length} convicts to localStorage`)
  } catch (error) {
    console.error("Error saving convicts to localStorage:", error)
    throw error
  }
}

// Enhance the debugStorage function
export const debugStorage = (): void => {
  if (typeof window === "undefined") {
    console.log("debugStorage: window is undefined")
    return
  }

  try {
    const data = localStorage.getItem(STORAGE_KEY)
    console.log("Current localStorage key:", STORAGE_KEY)
    console.log("Raw localStorage data:", data ? `${data.substring(0, 100)}...` : "null")

    if (data) {
      try {
        const parsed = JSON.parse(data)
        console.log("Number of records:", Array.isArray(parsed) ? parsed.length : "Not an array")

        if (Array.isArray(parsed) && parsed.length > 0) {
          console.log("First record ID:", parsed[0].id)
          console.log("First record name:", parsed[0].name)
        }
      } catch (parseError) {
        console.error("Error parsing localStorage data:", parseError)
      }
    } else {
      console.log("No data found in localStorage")
    }

    // Check localStorage size
    let totalSize = 0
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        const value = localStorage.getItem(key) || ""
        totalSize += key.length + value.length
      }
    }
    console.log(`Total localStorage usage: ~${(totalSize / 1024).toFixed(2)} KB`)
  } catch (error) {
    console.error("Error debugging localStorage:", error)
  }
}

// Initialize localStorage if needed
export const initializeStorage = (): void => {
  if (typeof window === "undefined") return

  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) {
      console.log("Initializing empty convicts array in localStorage")
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
    }
  } catch (error) {
    console.error("Error initializing localStorage:", error)
  }
}

// Call initialization when this module is imported
if (typeof window !== "undefined") {
  initializeStorage()
}

