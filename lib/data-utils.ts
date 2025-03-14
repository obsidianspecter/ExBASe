import { getConvicts, saveConvicts } from "./storage"

// Export all convict data as a JSON file
export const exportData = () => {
  const convicts = getConvicts()
  const dataStr = JSON.stringify(convicts, null, 2)
  const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

  const exportFileDefaultName = `convict-records-${new Date().toISOString().slice(0, 10)}.json`

  const linkElement = document.createElement("a")
  linkElement.setAttribute("href", dataUri)
  linkElement.setAttribute("download", exportFileDefaultName)
  linkElement.click()
}

// Import convict data from a JSON file
export const importData = (file: File): Promise<void> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target?.result as string)

        // Validate the data structure
        if (!Array.isArray(jsonData)) {
          throw new Error("Invalid data format: Expected an array of records")
        }

        // Check if each item has required fields
        jsonData.forEach((item, index) => {
          if (!item.id || !item.name || !item.phone || !item.caseDetails) {
            throw new Error(`Record at index ${index} is missing required fields`)
          }
        })

        // Save the imported data
        saveConvicts(jsonData)

        // Trigger a storage event so other tabs can update
        window.dispatchEvent(new Event("storage"))

        resolve()
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error("Error reading file"))
    }

    reader.readAsText(file)
  })
}

