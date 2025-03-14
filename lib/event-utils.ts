/**
 * Trigger a storage update event to notify all components
 * This is useful when localStorage is updated and we need to refresh components
 */
export const triggerStorageUpdate = (): void => {
  console.log("Triggering storage update event")

  try {
    // Create and dispatch a custom event
    const event = new Event("storageUpdated")
    window.dispatchEvent(event)
    console.log("Dispatched storageUpdated event")

    // Also try to trigger the standard storage event
    // This is a workaround since the storage event doesn't fire in the same window that made the change
    try {
      // Get a dummy key that won't affect our app
      const dummyKey = "_dummy_trigger_" + Date.now()
      // Set and immediately remove the dummy key
      localStorage.setItem(dummyKey, "1")
      localStorage.removeItem(dummyKey)
      console.log("Triggered standard storage event via dummy key")
    } catch (error) {
      console.error("Error triggering storage event:", error)
    }
  } catch (error) {
    console.error("Error in triggerStorageUpdate:", error)
  }
}

/**
 * Add event listeners for storage updates
 * @param callback Function to call when storage is updated
 * @returns Cleanup function to remove event listeners
 */
export const listenForStorageUpdates = (callback: () => void): (() => void) => {
  const handleStorageChange = () => {
    console.log("Storage update detected")
    callback()
  }

  window.addEventListener("storage", handleStorageChange)
  window.addEventListener("storageUpdated", handleStorageChange)

  return () => {
    window.removeEventListener("storage", handleStorageChange)
    window.removeEventListener("storageUpdated", handleStorageChange)
  }
}

